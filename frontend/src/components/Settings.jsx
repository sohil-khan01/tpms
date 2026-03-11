import { useState } from 'react';

const Settings = ({ darkMode, toggleDarkMode }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    newCandidates: true,
    interviews: true,
    matches: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'DD/MM/YYYY',
    autoSave: true,
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            🎨 Appearance
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            🔔 Notifications
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            🔒 Security
          </h3>

          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Change Password
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Update your account password
                  </p>
                </div>
                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>→</span>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Two-Factor Authentication
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Add an extra layer of security
                  </p>
                </div>
                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>→</span>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Login History
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    View recent login activity
                  </p>
                </div>
                <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>→</span>
              </div>
            </button>
          </div>
        </div>

        {/* System Preferences */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            ⚙️ System Preferences
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;