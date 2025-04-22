
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Building2, Mail, Phone, Users, MessageSquare } from 'lucide-react';

const RequestDemo = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-center lg:text-left mb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                  <Calendar className="h-4 w-4 text-shield-blue mr-2" />
                  <span className="text-xs font-medium">Schedule Today</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Request a Live Demo</h1>
                <p className="text-gray-600 text-lg">
                  See how Midshield can transform your evidence collection and analysis process with our personalized demo.
                </p>
              </div>
              
              <div className="glass-card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Why Request a Demo?</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">See the platform in action with real-world scenarios</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">Get personalized answers to your specific questions</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">Learn about implementation and deployment options</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">Discover pricing plans and customization options</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <h2 className="text-xl font-semibold mb-6 text-center lg:text-left">Complete the Form</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                      <Input 
                        id="firstName" 
                        className="pl-10" 
                        placeholder="John"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10" 
                      placeholder="you@company.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      type="tel" 
                      className="pl-10" 
                      placeholder="(555) 123-4567"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <Input 
                      id="company" 
                      className="pl-10" 
                      placeholder="Your Company"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <div className="relative">
                    <Textarea 
                      id="message" 
                      className="pl-10 pt-2 min-h-[100px]" 
                      placeholder="Tell us about your specific needs and questions..."
                    />
                    <div className="absolute top-2 left-0 pl-3 flex items-start pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    className="h-4 w-4 text-shield-blue focus:ring-shield-blue border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-shield-blue hover:underline">Privacy Policy</a> and <a href="#" className="text-shield-blue hover:underline">Terms of Service</a>
                  </label>
                </div>
                
                <Button type="submit" className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                  Schedule Demo
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RequestDemo;
