
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, FileText, Bell, LogOut, Home, Settings, Users, AlertCircle, Map, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import NotificationBell from '@/components/officer/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const OfficerNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { officer, signOut } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/officer-login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/officer-dashboard', icon: Home },
    { name: 'User Profiles', path: '/officer-user-profiles', icon: Users },
    { name: 'Reports', path: '/officer-reports', icon: FileText },
    { name: 'KYC Verifications', path: '/officer-kyc', icon: FileCheck },
    { name: 'Advisories', path: '/officer-advisories', icon: AlertCircle },
    { name: 'Case Map', path: '/officer-case-map', icon: Map },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stripe-blue-dark/90 backdrop-blur-md shadow-md border-b border-stripe-blue/10 py-2">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/officer-dashboard" className="flex items-center">
            <div className="bg-white rounded-full p-1.5 mr-2">
              <Shield className="h-6 w-6 text-stripe-blue-dark" />
            </div>
            <span className="text-xl font-bold text-white">Shield</span>
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Officer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-white border-b-2 border-white'
                      : 'text-gray-200 hover:text-white hover:border-b-2 hover:border-white/50 transition-colors'
                  }`}
                >
                  <Icon className="mr-1 h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            {officer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-800 font-medium">
                        {officer.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {officer.full_name && (
                        <p className="font-medium">{officer.full_name}</p>
                      )}
                      {officer.badge_number && (
                        <p className="text-sm text-muted-foreground">
                          Badge: {officer.badge_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/officer-dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/officer-profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/officer-settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-stripe-blue-dark"
                onClick={() => navigate('/officer-login')}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-stripe-blue-dark/95 backdrop-blur-lg border-t border-white/10 animate-fade-in">
          <div className="px-4 py-5 space-y-4">
            {officer && (
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-md mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-100 text-gray-800 font-medium">
                    {officer.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-white">{officer.full_name}</p>
                  <p className="text-xs text-gray-300">Badge: {officer.badge_number}</p>
                </div>
              </div>
            )}
            
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center py-2 text-base font-medium ${
                    isActive(link.path)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-4 space-y-3 border-t border-white/10">
              <Link 
                to="/officer-profile" 
                className="flex items-center py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                Profile
              </Link>
              <Link 
                to="/officer-settings" 
                className="flex items-center py-2 text-base font-medium text-gray-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
              <button 
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full py-2 text-base font-medium text-red-400 hover:text-red-300"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default OfficerNavbar;
