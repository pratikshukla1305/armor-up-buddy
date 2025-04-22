
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthButtonProps = {
  className?: string;
};

const AuthButton = ({ className }: AuthButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  const REDIRECT_URL = 'http://localhost:3000/dashboard';

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      console.log('Attempting Google OAuth login');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
        },
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      console.log('Google OAuth initiated:', data);
    } catch (error: any) {
      console.error('Google login error:', error.message);
      uiToast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
      toast.error(`Error signing in with Google: ${error.message}`);
    } finally {
      setIsLoading(null);
      setIsOpen(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading('github');
    try {
      console.log('Attempting GitHub OAuth login');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: REDIRECT_URL,
        },
      });
      
      if (error) {
        console.error('GitHub OAuth error:', error);
        throw error;
      }
      
      console.log('GitHub OAuth initiated:', data);
    } catch (error: any) {
      console.error('GitHub login error:', error.message);
      uiToast({
        title: "Error signing in with GitHub",
        description: error.message,
        variant: "destructive",
      });
      toast.error(`Error signing in with GitHub: ${error.message}`);
    } finally {
      setIsLoading(null);
      setIsOpen(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    setIsLoading('metamask');
    // This is a placeholder for MetaMask integration
    toast.info("MetaMask login is not yet implemented");
    uiToast({
      title: "MetaMask Integration",
      description: "MetaMask login functionality coming soon!",
    });
    setIsLoading(null);
    setIsOpen(false);
  };

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.auth-dropdown')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={cn('relative auth-dropdown', className)}>
      <Button 
        variant="outline" 
        className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Shield className="h-5 w-5 mr-2" />
        Connect Account
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl glass-card p-4 shadow-xl animate-scale-in z-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-shield-blue/10 flex items-center justify-center">
              <User className="h-5 w-5 text-shield-blue" />
            </div>
            <div>
              <div className="text-sm font-medium">Connect Account</div>
              <div className="text-xs text-gray-500">Choose your login method</div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              className="w-full p-3 rounded-lg border border-shield-border bg-white hover:border-shield-blue transition-all flex items-center space-x-3"
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isLoading === 'google' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-shield-blue border-t-transparent rounded-full"></div>
                ) : (
                  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 8.2C17.64 7.57 17.58 6.95 17.48 6.36H9V9.46H13.84C13.64 10.42 13.02 11.24 12.12 11.78V13.72H15.02C16.7 12.34 17.64 10.45 17.64 8.2Z" fill="#4285F4"/>
                    <path d="M9 18C11.43 18 13.47 17.2 15.02 15.72L12.12 13.78C11.36 14.3 10.36 14.62 9 14.62C6.69 14.62 4.72 13.02 4 10.9H0.98V12.91C2.52 15.99 5.53 18 9 18Z" fill="#34A853"/>
                    <path d="M4 10.9C3.82 10.36 3.72 9.78 3.72 9.2C3.72 8.62 3.82 8.04 4 7.5V5.49H0.98C0.36 6.88 0 8.09 0 9.2C0 10.31 0.36 11.52 0.98 12.91L4 10.9Z" fill="#FBBC05"/>
                    <path d="M9 3.78C10.32 3.78 11.5 4.24 12.46 5.16L15.02 2.6C13.46 1.1 11.43 0 9 0C5.53 0 2.52 2.01 0.98 5.09L4 7.1C4.72 4.98 6.69 3.78 9 3.78Z" fill="#EA4335"/>
                  </svg>
                )}
              </div>
              <span className="text-sm">{isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <button 
              className="w-full p-3 rounded-lg border border-shield-border bg-white hover:border-shield-blue transition-all flex items-center space-x-3"
              onClick={handleGithubLogin}
              disabled={isLoading !== null}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isLoading === 'github' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-shield-blue border-t-transparent rounded-full"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.10671 0.103516C3.73654 0.103516 0.202148 3.63791 0.202148 8.00808C0.202148 11.5134 2.38877 14.4968 5.48221 15.5574C5.87565 15.6312 6.02248 15.3954 6.02248 15.1885C6.02248 15.0006 6.01359 14.3126 6.00916 13.6541C3.80291 14.1326 3.34083 12.8339 3.34083 12.8339C2.97937 11.911 2.45786 11.6763 2.45786 11.6763C1.74029 11.1817 2.51218 11.1922 2.51218 11.1922C3.30527 11.2482 3.72514 12.0024 3.72514 12.0024C4.42649 13.2184 5.57582 12.8711 6.03701 12.6716C6.11082 12.1559 6.3119 11.8076 6.5355 11.6097C4.77713 11.4096 2.91693 10.7294 2.91693 7.65115C2.91693 6.77306 3.22859 6.0548 3.74033 5.48782C3.65774 5.29009 3.38501 4.47489 3.82039 3.36201C3.82039 3.36201 4.47957 3.15157 5.99917 4.20387C6.63707 4.02624 7.32398 3.93832 8.00671 3.93478C8.68943 3.93832 9.37545 4.02624 10.0142 4.20387C11.5329 3.15157 12.1912 3.36201 12.1912 3.36201C12.6284 4.47489 12.3557 5.29009 12.2731 5.48782C12.7857 6.0548 13.0947 6.77306 13.0947 7.65115C13.0947 10.7374 11.2301 11.4069 9.46617 11.6028C9.74222 11.8453 9.98665 12.3267 9.98665 13.0622C9.98665 14.1219 9.97598 14.926 9.97598 15.1885C9.97598 15.3972 10.1201 15.635 10.52 15.5565C13.6108 14.495 15.7956 11.5125 15.7956 8.00808C15.7956 3.63791 12.2612 0.103516 8.10671 0.103516" fill="#161614"/>
                  </svg>
                )}
              </div>
              <span className="text-sm">{isLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
            </button>

            <button 
              className="w-full p-3 rounded-lg border border-shield-border bg-white hover:border-shield-blue transition-all flex items-center space-x-3"
              onClick={handleMetaMaskLogin}
              disabled={isLoading !== null}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isLoading === 'metamask' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-shield-blue border-t-transparent rounded-full"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8Z" fill="#F5F5F5" stroke="#E5E5EA"/>
                    <path d="M8.17978 6.59814C8.99517 5.56243 9.60207 4.00999 9.32396 2.5C8.03938 2.59759 6.48694 3.41298 5.69125 4.42899C4.95416 5.36192 4.25817 6.93406 4.57718 8.36681C6.00993 8.40571 7.36438 7.63384 8.17978 6.59814Z" fill="#333333"/>
                    <path d="M11.8082 9.64485C11.3221 8.43148 10.2282 7.58668 9.30496 7.58668C8.38171 7.58668 7.61768 8.00942 7.04189 8.00942C6.4272 8.00942 5.54505 7.60638 4.80795 7.62609C3.79194 7.64579 2.85901 8.21274 2.35334 9.13599C1.30762 10.9803 2.03588 13.746 3.0519 15.3281C3.53786 16.0955 4.13593 16.9695 4.94249 16.9307C5.69124 16.8916 6.02791 16.4107 6.97233 16.4107C7.91675 16.4107 8.21606 16.9307 9.02261 16.9109C9.85771 16.8916 10.3634 16.1047 10.8494 15.3379C11.4163 14.452 11.6555 13.5871 11.6749 13.5482C11.6555 13.5287 9.98046 12.8199 9.96076 10.9997C9.94106 9.48664 11.295 8.68009 11.3733 8.62148C10.6556 7.54516 9.55098 7.44757 9.20548 7.42787C8.29191 7.36926 7.48535 7.93621 7.04189 7.93621C6.61814 7.93621 5.93183 7.44757 4.82519 7.44757L4.80795 7.44758C3.74253 7.46728 2.7265 8.12395 2.1704 9.12447C1.90201 9.62145 1.75558 10.1723 1.75558 10.7315C1.75558 10.8083 1.75819 10.8848 1.76339 10.9606C2.03588 13.7852 4.27005 15.9436 6.08136 16C6.8496 16.0189 7.52711 15.5699 8.33367 15.5699C9.10191 15.5699 9.71854 16.0189 10.557 16.0189C10.8954 16.0189 11.1996 15.9539 11.4769 15.8261C13.1594 15.0713 14.3728 11.9197 14.3728 11.9197C14.2558 11.8611 11.8278 10.7741 11.8082 9.64485Z" fill="#333333"/>
                  </svg>
                )}
              </div>
              <span className="text-sm">{isLoading === 'metamask' ? 'Connecting...' : 'Continue with MetaMask'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
