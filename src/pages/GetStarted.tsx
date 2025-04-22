import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, User, Mail, Lock, UserPlus, CheckCircle, UserCog } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const GetStarted = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  
  console.log("GetStarted page loaded, user state:", user ? "Logged in" : "Not logged in");
  
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign up attempt with email:", email);
    
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (!agreeToTerms) {
      toast.error("Please agree to the terms of service");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign up with:", email, fullName);
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error("Sign up error:", error.message);
        toast.error(`Sign up error: ${error.message}`);
      } else {
        console.log("Sign up successful, redirecting to sign in");
        toast.success("Account created successfully! Please verify your email (if required) and sign in.");
        setTimeout(() => navigate('/signin'), 500);
      }
    } catch (err: any) {
      console.error("Unexpected error during sign up:", err);
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
            <div>
              <div className="text-center lg:text-left mb-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                  <UserPlus className="h-4 w-4 text-shield-blue mr-2" />
                  <span className="text-xs font-medium">Join Us</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Started with <span className="text-shield-blue">Shield</span></h2>
                <p className="text-gray-600">Create your account to start reporting crimes, securing evidence, and earning rewards.</p>
              </div>
              
              <div className="glass-card p-8 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>
                  
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
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="h-4 w-4 text-shield-blue focus:ring-shield-blue border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-shield-blue hover:underline">Terms of Service</a> and <a href="#" className="text-shield-blue hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all"
                    disabled={isLoading || !agreeToTerms}
                    onClick={(e) => {
                      if (!isLoading && agreeToTerms) {
                        console.log("Sign up button clicked");
                      }
                    }}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <AuthButton />
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-medium text-shield-blue hover:text-blue-600">
                      Sign In
                    </Link>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <UserCog className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Are you a law enforcement officer?</span>
                    </div>
                    <div className="mt-2 text-center">
                      <Link to="/officer-registration" className="text-sm font-medium text-shield-blue hover:text-blue-600">
                        Register for Officer Access
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-shield-blue rounded-3xl blur-3xl opacity-5 transform rotate-6"></div>
                <div className="glass-card p-8 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1605806616949-59450e59f5cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                    alt="Police officers working" 
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                  <h3 className="text-xl font-semibold mb-6">Why Join Shield?</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium">Secure Evidence Storage</h4>
                        <p className="text-sm text-gray-600">All evidence is securely stored with advanced encryption.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium">SOS Alerts</h4>
                        <p className="text-sm text-gray-600">Your Safety.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium">AI-Powered Analysis</h4>
                        <p className="text-sm text-gray-600">Our AI helps analyze evidence and automatically generates reports.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium">Help Officers</h4>
                        <p className="text-sm text-gray-600">Help Officers to catch criminals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default GetStarted;
