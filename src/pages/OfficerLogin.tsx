
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Lock, UserCog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useOfficerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/officer-dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/officer-dashboard");
      }
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
                <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-3xl opacity-5 transform -rotate-6"></div>
                <div className="glass-card p-8 relative">
                  <div className="rounded-full bg-blue-50 p-4 w-16 h-16 flex items-center justify-center mb-6">
                    <UserCog className="h-8 w-8 text-shield-blue" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">Shield Officer Portal</h2>
                  <p className="text-gray-600 mb-6">
                    As a law enforcement officer, you have access to specialized tools to:
                  </p>
                  
                  <img 
                    src="https://thumbs.dreamstime.com/b/police-officer-night-patrol-car-lights-city-street-law-enforcement-action-325423054.jpg" 
                    alt="Police officer working" 
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">Review and approve KYC verifications</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">Manage public safety advisories</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">Update criminal records and wanted individuals</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">Respond to citizen SOS alerts and tips</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700">Update case density maps with real-time data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-center lg:text-left mb-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                  <UserCog className="h-4 w-4 text-shield-blue mr-2" />
                  <span className="text-xs font-medium">Law Enforcement</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Officer <span className="text-shield-blue">Login</span></h2>
                <p className="text-gray-600">Access your secure officer portal to manage cases, advisories, and respond to citizens.</p>
              </div>
              
              <div className="glass-card p-8 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Department Email</label>
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
                        placeholder="officer@police.gov"
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
                  >
                    {isLoading ? 'Logging in...' : 'Login to Officer Portal'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/officer-registration" className="font-medium text-shield-blue hover:text-blue-600">
                      Register
                    </Link>
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

export default OfficerLogin;
