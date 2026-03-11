import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Members = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@company.com',
      role: 'Admin',
      department: 'IT',
      phone: '+91 98765 43210',
      joinDate: '2024-01-15',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      role: 'Manager',
      department: 'HR',
      phone: '+91 98765 43211',
      joinDate: '2024-02-10',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@company.com',
      role: 'Recruiter',
      department: 'Recruitment',
      phone: '+91 98765 43212',
      joinDate: '2024-03-05',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      email: 'sneha.gupta@company.com',
      role: 'Recruiter',
      department: 'Recruitment',
      phone: '+91 98765 43213',
      joinDate: '2024-03-20',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      role: 'Team Lead',
      department: 'IT',
      phone: '+91 98765 43214',
      joinDate: '2024-01-20',
      status: 'Active',
    },
    {
      id: 6,
      name: 'Neha Verma',
      email: 'neha.verma@company.com',
      role: 'HR Executive',
      department: 'HR',
      phone: '+91 98765 43215',
      joinDate: '2024-04-01',
      status: 'Active',
    },
    {
      id: 7,
      name: 'Rajesh Khanna',
      email: 'rajesh.khanna@company.com',
      role: 'Senior Recruiter',
      department: 'Recruitment',
      phone: '+91 98765 43216',
      joinDate: '2023-12-10',
      status: 'Active',
    },
    {
      id: 8,
      name: 'Anita Desai',
      email: 'anita.desai@company.com',
      role: 'Admin',
      department: 'IT',
      phone: '+91 98765 43217',
      joinDate: '2024-02-25',
      status: 'Inactive',
    },
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'Active',
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    const member = {
      id: members.length + 1,
      ...newMember,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setMembers([...members, member]);
    setNewMember({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      status: 'Active',
    });
    setShowAddModal(false);
  };

  const handleDeleteMember = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this member?');
    if (confirmed) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  // Filter members based on search query (name, role, department)
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700';
      case 'Manager':
        return 'bg-blue-100 text-blue-700';
      case 'Team Lead':
        return 'bg-purple-100 text-purple-700';
      case 'Recruiter':
      case 'Senior Recruiter':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

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
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <span>+</span>
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Total Members</h3>
          <p className="text-3xl font-bold text-slate-800">{members.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Active</h3>
          <p className="text-3xl font-bold text-green-600">
            {members.filter((m) => m.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Admins</h3>
          <p className="text-3xl font-bold text-purple-600">
            {members.filter((m) => m.role === 'Admin').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-slate-600 text-sm mb-1">Recruiters</h3>
          <p className="text-3xl font-bold text-blue-600">
            {members.filter((m) => m.role.includes('Recruiter')).length}
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
              placeholder="Search by name, role or department..."
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
        <div className="overflow-x-auto">
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
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{member.department}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{member.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{member.joinDate}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
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
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter full name"
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
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
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
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Senior Recruiter">Senior Recruiter</option>
                  <option value="HR Executive">HR Executive</option>
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
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Status
                </label>
                <select
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
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
