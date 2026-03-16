import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membersAPI, handleAPIError } from '../utils/api';

const Members = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if current user is admin
  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    setCurrentUser(adminUser);
    
    // If user is not admin, redirect to dashboard
    if (adminUser.role && adminUser.role !== 'ADMIN' && adminUser.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const [newMember, setNewMember] = useState({
    username: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Helper function to get initials from username
  const getInitials = (username) => {
    if (!username) return 'U';
    
    // Split by space, underscore, or dot to handle different username formats
    const parts = username.split(/[\s._-]+/);
    
    if (parts.length >= 2) {
      // If we have multiple parts, take first letter of first and last part
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    } else {
      // If only one part, take first two letters or just first letter
      return parts[0].length >= 2 
        ? (parts[0].charAt(0) + parts[0].charAt(1)).toUpperCase()
        : parts[0].charAt(0).toUpperCase();
    }
  };

  // Regex patterns for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validation functions
  const validateForm = () => {
    const errors = {};

    if (!emailRegex.test(newMember.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone is optional, but if provided, must be valid
    if (newMember.phone && newMember.phone.trim() && !phoneRegex.test(newMember.phone)) {
      errors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!passwordRegex.test(newMember.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch members from API
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await membersAPI.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Clean the data before sending
      const memberData = {
        ...newMember,
        phone: newMember.phone.trim() || null // Send null if phone is empty
      };
      
      console.log('Adding member with data:', memberData);
      
      await membersAPI.add(memberData);
      setNewMember({
        username: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        password: '',
      });
      setValidationErrors({});
      setShowAddModal(false);
      await fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Failed to add member:', error);
      setError(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setLoading(true);
      const updateData = {
        phone: editingMember.phone,
        role: editingMember.role,
        department: editingMember.department,
      };
      await membersAPI.update(editingMember.id, updateData);
      setEditingMember(null);
      await fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update member:', error);
      setError(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} ${member.username}?`
    );
    
    if (confirmed) {
      try {
        setLoading(true);
        
        if (newStatus === 'INACTIVE') {
          // Try WebSocket endpoint first
          try {
            await membersAPI.deactivate(member.username);
            console.log(`✅ User ${member.username} deactivated with WebSocket notification`);
          } catch (error) {
            console.warn('⚠️ WebSocket deactivate failed, using fallback method:', error);
            
            // Fallback: Use regular update + localStorage notification
            const updateData = { status: newStatus };
            await membersAPI.update(member.id, updateData);
            
            // Set localStorage flag as fallback (use username for consistency)
            localStorage.setItem(`forceLogout_${member.username}`, Date.now().toString());
            console.log(`✅ User ${member.username} deactivated with localStorage fallback`);
          }
        } else {
          // For activation, use regular update
          const updateData = { status: newStatus };
          await membersAPI.update(member.id, updateData);
          console.log(`✅ User ${member.username} activated`);
        }
        
        await fetchMembers(); // Refresh the list
        
      } catch (error) {
        console.error('Failed to update member status:', error);
        
        // Check if it's an authentication error
        if (error.message.includes('Session expired') || error.message.includes('unauthenticated')) {
          // WebSocket will handle the logout smoothly, just show a gentle message
          console.log('Authentication error detected, WebSocket handling logout...');
          setError('Session expired. You will be logged out automatically.');
          return;
        }
        
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMember = async (id) => {
    // Find the member to get username for WebSocket notification
    const memberToDelete = members.find(m => m.id === id);
    if (!memberToDelete) {
      alert('Member not found');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${memberToDelete.username}? This action cannot be undone.`);
    if (confirmed) {
      try {
        setLoading(true);
        
        // Try WebSocket endpoint first
        try {
          await membersAPI.softDelete(id);
          console.log(`✅ User ${memberToDelete.username} deleted with WebSocket notification`);
        } catch (error) {
          console.warn('⚠️ WebSocket delete failed, using fallback method:', error);
          
          // Fallback: Use regular delete + localStorage notification
          await membersAPI.delete(id);
          
          // Set localStorage flag as fallback (use username for consistency)
          localStorage.setItem(`forceLogout_${memberToDelete.username}`, Date.now().toString());
          console.log(`✅ User ${memberToDelete.username} deleted with localStorage fallback`);
        }
        
        await fetchMembers(); // Refresh the list
        
      } catch (error) {
        console.error('Failed to delete member:', error);
        
        // Check if it's an authentication error
        if (error.message.includes('Session expired') || error.message.includes('unauthenticated')) {
          // WebSocket will handle the logout smoothly, just show a gentle message
          console.log('Authentication error detected, WebSocket handling logout...');
          setError('Session expired. You will be logged out automatically.');
          return;
        }
        
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter members based on search query (username, role, department)
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      (member.username && member.username.toLowerCase().includes(query)) ||
      (member.email && member.email.toLowerCase().includes(query)) ||
      (member.role && member.role.toLowerCase().includes(query)) ||
      (member.department && member.department.toLowerCase().includes(query))
    );
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700';
      case 'TEAM_LEAD':
        return 'bg-purple-100 text-purple-700';
      case 'RECRUITER':
      case 'SENIOR_RECRUITER':
        return 'bg-green-100 text-green-700';
      case 'HR_EXECUTIVE':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatRole = (role) => {
    return role ? role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Loading members...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin access
  if (currentUser && currentUser.role && currentUser.role !== 'ADMIN' && currentUser.role !== 'Admin') {
    return (
      <div className={`p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Access Denied
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              You don't have permission to access the Members page. Only administrators can manage team members.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Team Members
          </h2>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setValidationErrors({});
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <span>+</span>
          Add Member
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Total Members</h3>
          <p className="text-3xl font-bold text-slate-800">{members.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Active</h3>
          <p className="text-3xl font-bold text-green-600">
            {members.filter((m) => m.status === 'ACTIVE' || !m.status).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Admins</h3>
          <p className="text-3xl font-bold text-purple-600">
            {(() => {
              // console.log('All members for admin count:', members.map(m => ({ username: m.username, role: m.role })));
              const adminCount = members.filter((m) => {
                const role = m.role ? m.role.toLowerCase() : '';
                const isAdmin = role === 'admin' || m.role === 'Admin' || m.role === 'ADMIN';
                // console.log(`Member: ${m.username}, Role: "${m.role}", Lowercase: "${role}", Is Admin: ${isAdmin}`);
                return isAdmin;
              }).length;
              // console.log('Final Admin Count:', adminCount);
              return adminCount;
            })()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Recruiters</h3>
          <p className="text-3xl font-bold text-blue-600">
            {(() => {
              const recruiterCount = members.filter((m) => {
                const role = m.role ? m.role.toLowerCase() : '';
                const isRecruiter = role === 'recruiter' || m.role === 'Recruiter' || m.role === 'RECRUITER' || 
                                   role === 'senior_recruiter' || m.role === 'Senior Recruiter' || m.role === 'SENIOR_RECRUITER' ||
                                   role.includes('recruiter');
                // console.log(`Member: ${m.username}, Role: "${m.role}", Lowercase: "${role}", Is Recruiter: ${isRecruiter}`);
                return isRecruiter;
              }).length;
              // console.log('Final Recruiter Count:', recruiterCount);
              return recruiterCount;
            })()}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm`}>
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">All Members</h3>
            <p className="text-slate-600 text-sm">View and manage team members</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by username, email, role or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 pl-10 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'
              }`}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-2 border-b border-slate-200 bg-slate-50">
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden min-h-[400px]">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No members found matching your search.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id} 
                  className={`border rounded-lg p-4 ${
                    darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(member.username)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {member.username || 'Unknown User'}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
                        member.status === 'ACTIVE' || !member.status
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      title={member.status === 'ACTIVE' || !member.status ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          member.status === 'ACTIVE' || !member.status
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Role:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Department:</span>
                      <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {member.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone:</span>
                      <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {member.phone}
                      </span>
                    </div>
                    {member.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Join Date:</span>
                        <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button 
                      onClick={() => setEditingMember(member)}
                      className="flex-1 text-blue-600 hover:text-blue-800 font-medium text-sm py-2 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="flex-1 text-red-600 hover:text-red-800 font-medium text-sm py-2 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto min-h-[500px]">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Member</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Department</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Contact</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Join Date</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No members found matching your search.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear search
                    </button>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(member.username)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{member.username || 'Unknown User'}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {formatRole(member.role)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{member.department}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{member.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
                        member.status === 'ACTIVE' || !member.status
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      title={member.status === 'ACTIVE' || !member.status ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          member.status === 'ACTIVE' || !member.status
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 items-center">
                      <button 
                        onClick={() => setEditingMember(member)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                        title="Edit Member"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                        title="Delete Member"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Add New Member
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setValidationErrors({});
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.username}
                  onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => {
                    setNewMember({ ...newMember, email: e.target.value });
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter email address"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => {
                    setNewMember({ ...newMember, phone: e.target.value });
                    if (validationErrors.phone) {
                      setValidationErrors({ ...validationErrors, phone: '' });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter phone number (+1234567890)"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role *
                </label>
                <select
                  required
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Select Role</option>
                  {/* <option value="ADMIN">Admin</option> */}
                  <option value="MANAGER">Manager</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="SENIOR_RECRUITER">Senior Recruiter</option>
                  <option value="HR_EXECUTIVE">HR Executive</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department *
                </label>
                <select
                  required
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT Operations">IT Operations</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newMember.password}
                  onChange={(e) => {
                    setNewMember({ ...newMember, password: e.target.value });
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: '' });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)"
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {/* Password must contain at least 8 characters with uppercase, lowercase, number, and special character */}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Edit Member
                </h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditMember} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={editingMember.username || ''}
                  className={`w-full px-4 py-2 rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-400'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={editingMember.email || ''}
                  className={`w-full px-4 py-2 rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-400'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role
                </label>
                <select
                  value={editingMember.role || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Select Role</option>
                  {/* <option value="ADMIN">Admin</option> */}
                  <option value="MANAGER">Manager</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="SENIOR_RECRUITER">Senior Recruiter</option>
                  <option value="HR_EXECUTIVE">HR Executive</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department
                </label>
                <select
                  value={editingMember.department || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT Operations">IT Operations</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;