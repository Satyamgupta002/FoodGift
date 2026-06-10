import React, { useState } from 'react';
import { Menu, X, DollarSign, History, UserCog, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import DonorPage from './DonorPage';
import PastActivities from './PastActivities';
import Profile from './Profile';
import { useNavigate } from 'react-router-dom';
function AllShow() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('donate');
  const navigate=useNavigate();
  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { id: 'donate', label: 'Donate', icon: DollarSign },
    { id: 'activities', label: 'Past Activities', icon: History },
    { id: 'profile', label: 'Profile', icon: UserCog },
  ];

  const handleLogout = () => {
    if(localStorage.getItem('token')) localStorage.removeItem('token');
    navigate('/');
    console.log('User logged out');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'donate':
        return <DonorPage />;
      case 'activities':
        return <PastActivities />;
      case 'profile':
        return <Profile />;
      default:
        return <DonorPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={isOpen} 
        menuItems={menuItems} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-green-800 text-white shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <button onClick={toggleSidebar} className="text-white hover:text-green-200 transition-colors p-1 flex-shrink-0">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold flex-1 text-center">Donor Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AllShow;
