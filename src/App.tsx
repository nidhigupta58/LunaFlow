/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserData, CalendarTokens } from './types';

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<CalendarTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem('luna_user_data');
    const savedTokens = localStorage.getItem('luna_calendar_tokens');
    
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
    if (savedTokens) {
      setTokens(JSON.parse(savedTokens));
    }
    setLoading(false);

    // Listen for OAuth success
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const newTokens = event.data.tokens;
        setTokens(newTokens);
        localStorage.setItem('luna_calendar_tokens', JSON.stringify(newTokens));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('luna_user_data', JSON.stringify(data));
  };

  const handleUpdateUser = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('luna_user_data', JSON.stringify(data));
  };

  const handleConnectCalendar = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (err) {
      console.error("Failed to get auth URL", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('luna_user_data');
    localStorage.removeItem('luna_calendar_tokens');
    setUserData(null);
    setTokens(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="size-12 border-4 border-brand-pink border-t-brand-rose rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData || !userData.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Dashboard 
      userData={userData} 
      tokens={tokens} 
      onConnectCalendar={handleConnectCalendar}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}
