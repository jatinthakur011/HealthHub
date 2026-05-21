import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { switchRole } from '../store/authSlice';

export default function SessionSwitcher() {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  if (!auth.userSession || !auth.doctorSession) {
    return null;
  }

  const currentIsUser = auth.currentRole === 'user';

  const handleSwitch = (role) => {
    dispatch(switchRole(role));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
        title="Switch between user and doctor sessions"
      >
        <span>🔄</span>
        <span className="hidden sm:inline">
          {currentIsUser ? 'User Mode' : 'Doctor Mode'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={() => handleSwitch('user')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b ${
              currentIsUser ? 'bg-blue-50 text-blue-700 font-medium' : ''
            }`}
          >
            <span>👤</span>
            <div>
              <div className="font-medium">User Account</div>
              <div className="text-xs text-gray-500">{auth.userSession?.email}</div>
            </div>
            {currentIsUser && <span className="ml-auto text-green-600">✓</span>}
          </button>
          <button
            onClick={() => handleSwitch('doctor')}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 ${
              !currentIsUser ? 'bg-blue-50 text-blue-700 font-medium' : ''
            }`}
          >
            <span>👨‍⚕️</span>
            <div>
              <div className="font-medium">Doctor Account</div>
              <div className="text-xs text-gray-500">{auth.doctorSession?.email}</div>
            </div>
            {!currentIsUser && <span className="ml-auto text-green-600">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

