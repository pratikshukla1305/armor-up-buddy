
// Just ensuring the colors are right in the navbar

import React from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '@/components/AuthButton';
import { ShieldCheck, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNotificationBell from '@/components/user/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';

const NavbarWithNotifications = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-stripe-blue-dark/85 backdrop-blur-md shadow-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center">
            <div className="bg-white rounded-full p-1.5 mr-2">
              <ShieldCheck className="h-6 w-6 text-stripe-blue-dark" />
            </div>
            <span className="text-xl font-bold text-white">Shield</span>
          </Link>
          
          <div className="hidden md:flex space-x-10">
            <Link to="/police-stations" className="text-gray-200 hover:text-white transition-colors">Police Stations</Link>
            <Link to="/advisories" className="text-gray-200 hover:text-white transition-colors">Advisories</Link>
            <Link to="/help-us" className="text-gray-200 hover:text-white transition-colors">Help Us</Link>
            <Link to="/about" className="text-gray-200 hover:text-white transition-colors">About</Link>
            <Link to="/my-reports" className="text-gray-200 hover:text-white transition-colors">My Reports</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <UserNotificationBell />}
            
            <AuthButton />
            
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Shield className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarWithNotifications;
