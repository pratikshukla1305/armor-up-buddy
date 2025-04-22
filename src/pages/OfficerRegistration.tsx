import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Lock, UserCog, User, Badge, Building, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerOfficer } from '@/services/officerServices';

const OfficerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    badgeNumber: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the officer using the service function that bypasses RLS
      await registerOfficer({
        full_name: formData.fullName,
        badge_number: formData.badgeNumber,
        department: formData.department,
        department_email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });
      
      toast.success("Registration successful! You can now log in.");
      navigate("/officer-login");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(`Registration failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="section-padding bg-white flex items-center justify-center pt-16 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-center lg:text-left mb-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                  <UserCog className="h-4 w-4 text-shield-blue mr-2" />
                  <span className="text-xs font-medium">Law Enforcement</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Officer <span className="text-shield-blue">Registration</span></h2>
                <p className="text-gray-600">Create your officer account to access the Midshield platform and tools.</p>
              </div>
              
              <div className="glass-card p-8 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="Officer Full Name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="badgeNumber" className="text-sm font-medium text-gray-700 mb-1">Badge Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Badge className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="badgeNumber"
                        name="badgeNumber"
                        value={formData.badgeNumber}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="Badge Number"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="department" className="text-sm font-medium text-gray-700 mb-1">Department / Precinct</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="Department or Precinct"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Department Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                          placeholder="officer@police.gov"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                          placeholder="(123) 456-7890"
                          required
                        />
                      </div>
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-shield-blue focus:border-shield-blue"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 text-shield-blue focus:ring-shield-blue border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700">
                        I confirm that I am an authorized law enforcement officer and the information provided is accurate
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/officer-login" className="font-medium text-shield-blue hover:text-blue-600">
                      Sign In
                    </Link>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-3xl opacity-5 transform rotate-6"></div>
                <div className="glass-card p-8 relative">
                  <h3 className="text-xl font-semibold mb-6">Officer Access Provides</h3>
                  
                  <div className="space-y-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-shield-blue mb-2">KYC Verification Management</h4>
                      <p className="text-sm text-gray-600">
                        Review and approve citizen identity verification requests, ensuring all platform users are properly authenticated.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-shield-blue mb-2">Public Safety Advisory System</h4>
                      <p className="text-sm text-gray-600">
                        Create and manage public safety advisories to alert citizens about potential threats or safety concerns in their area.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-shield-blue mb-2">Criminal Database Management</h4>
                      <p className="text-sm text-gray-600">
                        Update the database of wanted individuals and review citizen tips about suspicious activities or persons.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-shield-blue mb-2">Emergency Response Coordination</h4>
                      <p className="text-sm text-gray-600">
                        Receive and respond to SOS alerts from citizens in distress, with location data and situation details.
                      </p>
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

export default OfficerRegistration;
