import { useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../utils/api';
import { HiPaintBrush, HiBell, HiLockClosed, HiCog6Tooth, HiChevronRight, HiCheckCircle, HiXCircle, HiXMark, HiEye, HiEyeSlash } from 'react-icons/hi2';

const SETTINGS_KEY = 'userSettings';

const defaultSettings = {
  notifications: {
    email: true,
    push: false,
    sms: true,
    newCandidates: true,
    interviews: true,
    matches: false,
  },
  preferences: {
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    autoSave: true,
  },
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return defaultSettings;
};

const saveToStorage = (notifications, preferences) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ notifications, preferences }));
};

const Settings = ({ darkMode, toggleDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const stored = loadFromStorage();
  const [notifications, setNotifications] = useState(stored.notifications ?? defaultSettings.notifications);
  const [preferences, setPreferences] = useState(stored.preferences ?? defaultSettings.preferences);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPwFields, setShowPwFields] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    setSaving(true);
    saveToStorage(notifications, preferences);
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 300);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage('All password fields are required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setChangingPassword(true);
      setErrorMessage('');
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      await authAPI.changePassword(adminUser.id, passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(handleAPIError(err));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setChangingPassword(false);
    }
  };

  // no loading state needed — settings come from localStorage
  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Settings
      </h2>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <HiCheckCircle className="text-green-600 text-xl" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <HiXCircle className="text-red-600 text-xl" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <HiPaintBrush className="w-5 h-5" />
            Appearance
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Dark Mode
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Asia/Kolkata">India Standard Time</option>
                <option value="Europe/London">London Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <HiBell className="w-5 h-5" />
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Email Notifications
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.email ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Push Notifications
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Browser push notifications
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.push ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  New Candidates
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Alert when new resumes are uploaded
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('newCandidates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.newCandidates ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.newCandidates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Interview Reminders
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Reminders for scheduled interviews
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('interviews')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.interviews ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.interviews ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <HiLockClosed className="w-5 h-5" />
            Security
          </h3>

          <div className="space-y-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className={`w-full text-left p-4 border rounded-lg transition-colors cursor-pointer ${
                darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Change Password
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Update your account password
                  </p>
                </div>
                <HiChevronRight className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* System Preferences */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <HiCog6Tooth className="w-5 h-5" />
            System Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Auto-save
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Automatically save changes
                </p>
              </div>
              <button
                onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  preferences.autoSave ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className={`px-6 py-3 rounded-lg transition-colors cursor-pointer ${
            saving 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-md w-full p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPwFields.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className={`w-full px-4 py-2 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPwFields(p => ({...p, current: !p.current}))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                    {showPwFields.current ? <HiEyeSlash className="w-4 h-4"/> : <HiEye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwFields.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className={`w-full px-4 py-2 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPwFields(p => ({...p, new: !p.new}))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                    {showPwFields.new ? <HiEyeSlash className="w-4 h-4"/> : <HiEye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwFields.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className={`w-full px-4 py-2 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPwFields(p => ({...p, confirm: !p.confirm}))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                    {showPwFields.confirm ? <HiEyeSlash className="w-4 h-4"/> : <HiEye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  changingPassword
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
