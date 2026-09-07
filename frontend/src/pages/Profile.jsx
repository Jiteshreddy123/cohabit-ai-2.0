import React, { useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import { UserCircle, Mail, Shield, Building2, Key, Copy, Check } from "lucide-react";

function Profile() {
  const [college, setCollege] = useState(() => authApi.getCurrentCollege() || {});
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const freshUser = await authApi.getMe();
      if (freshUser) {
        setCollege(freshUser);
      }
    };
    loadProfile();
  }, []);

  const handleCopyCode = () => {
    if (college?.collegeCode) {
      navigator.clipboard.writeText(college.collegeCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const displayName = college?.name || (college?.email ? college.email.split('@')[0].toUpperCase() : "Institution");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">College Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your institution's account settings and preferences.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-8 transition-colors">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h2>
          <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium px-2.5 py-1 rounded-full">Admin Status</span>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
              <Building2 size={40} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <Shield size={14} className="text-green-500 dark:text-green-400" />
                Verified Educational Account
              </p>
            </div>
            {college?.collegeCode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">College Code</span>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-blue-800 dark:text-blue-200">{college.collegeCode}</code>
                  <button
                    onClick={handleCopyCode}
                    title="Copy College Code"
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
                  >
                    {copiedCode ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedCode && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Copied!</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-gray-400 dark:text-gray-500 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Admin Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{college?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCircle className="text-gray-400 dark:text-gray-500 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account Role</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Super Administrator</p>
                  </div>
                </div>
                {college?.collegeCode && (
                  <div className="flex items-start gap-3">
                    <Key className="text-gray-400 dark:text-gray-500 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Student Registration Code</p>
                      <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{college?.collegeCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Security Settings</h4>
              <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-3">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Two-Factor Authentication (2FA)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
