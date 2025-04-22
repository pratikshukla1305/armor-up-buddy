import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, User, Mail, Lock, UserCog } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  console.log("SignIn page loaded, user state:", user ? "Logged in" : "Not logged in");
  
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in attempt with email:", email);
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign in with:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Sign-in error:", error.message);
        toast.error(`Sign-in error: ${error.message}`);
      } else {
        console.log("Sign in successful, redirecting to dashboard");
        toast.success("Sign in successful!");
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err: any) {
      console.error("Unexpected error during sign in:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="section-padding bg-white flex items-center justify-center pt-28">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-shield-blue rounded-3xl blur-3xl opacity-5 transform -rotate-6"></div>
                <div className="glass-card p-8 relative">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-shield-blue mr-2" />
                      <span className="text-xl font-semibold">Shield</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <img 
                      src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                      alt="Security professionals" 
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Secure your community</h3>
                      <p className="text-gray-600">Join the network of vigilant citizens protecting neighborhoods through advanced reporting tools.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-center lg:text-left mb-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                  <User className="h-4 w-4 text-shield-blue mr-2" />
                  <span className="text-xs font-medium">Secure Access</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sign in to <span className="text-shield-blue">Shield</span></h2>
                <p className="text-gray-600">Access your account to manage evidence, reports, and your security.</p>
              </div>
              
              <div className="glass-card p-8 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-shield-blue focus:ring-shield-blue border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="#" className="font-medium text-shield-blue hover:text-blue-600">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all"
                    disabled={isLoading}
                    onClick={(e) => {
                      if (!isLoading) {
                        console.log("Sign in button clicked");
                      }
                    }}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <AuthButton />
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/get-started" className="font-medium text-shield-blue hover:text-blue-600">
                      Get Started
                    </Link>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <UserCog className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Are you a law enforcement officer?</span>
                    </div>
                    <div className="mt-2 text-center">
                      <Link to="/officer-login" className="text-sm font-medium text-shield-blue hover:text-blue-600">
                        Sign in to the Officer Portal
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default SignIn;
