import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import UploadCard from '@/components/UploadCard';
import ReportCard from '@/components/ReportCard';
import AuthButton from '@/components/AuthButton';
import SelfReportSection from '@/components/home/SelfReportSection';
import { Shield, Video, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      
      {/* How It Works Section */}
      <section className="section-padding bg-shield-light" id="how-it-works">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <span className="text-xs font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How <span className="text-[#0D2644]">Shield</span> Works</h2>
            <p className="text-gray-600 text-lg">
              Our platform streamlines the entire process from video evidence collection to AI analysis, with advanced security at every step.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#0D2644] flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
              <UploadCard className="h-full" />
            </div>
            
            <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#0D2644] flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
              <ReportCard className="h-full" />
            </div>
            
            <SelfReportSection />
          </div>
        </div>
      </section>
      
      {/* AI Crime Detection Section */}
      <section className="section-padding bg-white" id="ai-detection">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-fade-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
                <Shield className="h-4 w-4 text-[#0D2644] mr-2" />
                <span className="text-xs font-medium">AI-Powered Analysis</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Advanced <span className="text-[#0D2644]">Video Analysis</span><br />for Crime Detection</h2>
              
              <p className="text-lg text-gray-600 mb-6">
                Shield's AI technology analyzes video evidence to identify crime types, extract crucial details, and generate comprehensive reports automatically.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Instant crime type identification',
                  'Detailed scene description generation',
                  'Object and person detection',
                  'Secure data verification',
                  'Cooperative law enforcement tools'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
                  to="/get-started"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#0D2644] text-[#0D2644] hover:bg-[#0D2644] hover:text-white transition-all"
                  to="/how-it-works"
                >
                  Learn How It Works
                </Button>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative animate-fade-in">
              <div className="relative mx-auto max-w-md">
                <div className="absolute inset-0 bg-[#0D2644] rounded-3xl blur-3xl opacity-5 transform rotate-6"></div>
                <div className="glass-card p-8 relative">
                  {/* Modern AI crime detection visualization */}
                  <div className="h-56 rounded-xl bg-gray-100 overflow-hidden mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                      alt="AI crime detection visualization" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Search className="h-6 w-6 text-[#0D2644] mr-2" />
                      <span className="text-xl font-semibold">AI Analysis Center</span>
                    </div>
                    <AuthButton />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-shield-light mb-4">
                      <div className="text-sm font-medium mb-2">Video Analysis Results</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Crime Type</span>
                          <span className="text-xs font-medium">Theft (98% confidence)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Persons Identified</span>
                          <span className="text-xs font-medium">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Time of Incident</span>
                          <span className="text-xs font-medium">21:45:32</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Objects Detected</span>
                          <span className="text-xs font-medium">Car, Bag, Phone</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        className="w-full bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
                        to="/get-started"
                      >
                        Try Video Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-[#0D2644] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-400 opacity-20"></div>
          <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full bg-blue-300 opacity-10"></div>
          <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-blue-200 opacity-20"></div>
        </div>
        
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to make a difference?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join Shield today and become part of a community that's revolutionizing crime reporting with powerful AI detection technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-[#0D2644] hover:bg-blue-50 transition-all"
                to="/get-started"
              >
                Get Started Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm bg-white/10 transition-all"
                to="/request-demo"
              >
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
