import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, MapPin, AlertCircle, Megaphone, LogOut, User as UserIcon, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SOSButton from '@/components/sos/SOSButton';
import SOSModal from '@/components/sos/SOSModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
import { getUnreadNotificationsCount } from '@/services/userNotificationService';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/get-started';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        const count = await getUnreadNotificationsCount();
        setUnreadNotifications(count);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleSOSClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowSOSModal(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(null);
          setShowSOSModal(true);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation(null);
      setShowSOSModal(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user || !user.user_metadata || !user.user_metadata.full_name) {
      return user?.email?.charAt(0).toUpperCase() || 'U';
    }
    
    const fullName = user.user_metadata.full_name;
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
      isAuthPage ? 'relative' : 'fixed',
      isScrolled 
        ? 'bg-stripe-blue-dark/90 backdrop-blur-md border-b border-stripe-blue/10 py-2' 
        : 'bg-stripe-blue-dark/85 backdrop-blur-md py-4'
    )}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white animate-fade-in" />
            <span className="text-xl font-semibold text-white">Shield</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/features" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              How it works
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-gray-200 hover:text-white transition-colors bg-transparent hover:bg-white/10">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      Locate
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white">
                    <div className="grid gap-3 p-4 w-[400px]">
                      <Link 
                        to="/police-stations" 
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="bg-blue-100 p-2 rounded-full">
                          <MapPin className="h-4 w-4 text-stripe-blue" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Nearby Police Stations</h4>
                          <p className="text-xs text-gray-500">Find police stations near your location</p>
                        </div>
                      </Link>
                      <Link 
                        to="/case-heatmap" 
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="bg-red-100 p-2 rounded-full">
                          <MapPin className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Case Density Map</h4>
                          <p className="text-xs text-gray-500">View case reporting density across regions</p>
                        </div>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Link to="/e-kyc" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
              e-KYC
            </Link>
            
            <Link 
              to="/advisory" 
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors flex items-center"
            >
              <Megaphone className="mr-1 h-4 w-4" />
              Advisory
            </Link>
            
            <Link 
              to="/help-us" 
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors flex items-center"
            >
              <AlertCircle className="mr-1 h-4 w-4" />
              Help Us
            </Link>
            
            <SOSButton onClick={handleSOSClick} className="scale-90" />
            
            {user && (
              <Link to="/notifications" className="relative">
                <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback className="bg-gray-100 text-gray-800">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.user_metadata?.full_name && (
                        <p className="font-medium">{user.user_metadata.full_name}</p>
                      )}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reports">My Reports</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications">Notifications</Link>
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
              <>
                <Link to="/signin" className="text-sm font-medium">
                  <Button 
                    variant="outline" 
                    className="border-white text-white bg-stripe-slate-dark/50 hover:bg-white hover:text-stripe-blue-dark transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started" className="text-sm font-medium">
                  <Button className="bg-white text-stripe-blue-dark hover:bg-gray-100 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            
            <Link 
              to="/forum" 
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors flex items-center"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Forum
            </Link>
          </nav>

          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <Link to="/notifications" className="relative">
                <Button variant="ghost" className="text-white hover:bg-white/10 p-1">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </Link>
            )}
            <SOSButton onClick={handleSOSClick} className="scale-75" />
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

      {isMobileMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 right-0 border-t border-white/10 animate-fade-in bg-stripe-blue-dark/95 backdrop-blur-lg">
          <div className="px-4 py-5 space-y-4">
            {user && (
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-md mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-white">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-300 truncate max-w-[200px]">{user.email}</p>
                </div>
              </div>
            )}
            
            <Link 
              to="/home" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/how-it-works" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <div className="border-t border-white/10 pt-2">
              <p className="text-base font-medium text-gray-200 mb-2">Locate</p>
              <Link
                to="/police-stations"
                className="block ml-4 py-2 text-sm text-gray-200 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nearby Police Stations
              </Link>
              <Link
                to="/case-heatmap"
                className="block ml-4 py-2 text-sm text-gray-200 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Case Density Map
              </Link>
            </div>
            <Link 
              to="/e-kyc" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              e-KYC
            </Link>
            
            <Link 
              to="/advisory" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Megaphone className="mr-1 h-4 w-4" />
              Advisory
            </Link>
            
            <Link 
              to="/help-us" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <AlertCircle className="mr-1 h-4 w-4" />
              Help Us
            </Link>
            
            <Link 
              to="/forum" 
              className="block text-base font-medium text-gray-200 hover:text-white transition-colors flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Forum
            </Link>
            
            {user ? (
              <div className="pt-4 space-y-3 border-t border-white/10">
                <Link 
                  to="/dashboard" 
                  className="block w-full text-base font-medium text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="block w-full text-base font-medium text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/my-reports" 
                  className="block w-full text-base font-medium text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Reports
                </Link>
                <Link 
                  to="/notifications" 
                  className="block w-full text-base font-medium text-gray-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Notifications
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full py-2 text-base font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="pt-4 space-y-3">
                <Link to="/signin" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-white text-white bg-stripe-slate-dark/50 hover:bg-white hover:text-stripe-blue-dark transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    className="w-full justify-center bg-white text-stripe-blue-dark hover:bg-gray-100 transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <SOSModal 
        open={showSOSModal} 
        onOpenChange={setShowSOSModal} 
        userLocation={userLocation} 
      />
    </header>
  );
};

export default Navbar;
