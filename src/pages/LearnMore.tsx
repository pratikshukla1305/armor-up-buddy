
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <Shield className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">Midshield Technology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Learn More About <span className="text-shield-blue">Midshield</span></h1>
            <p className="text-gray-600 text-lg">
              Discover how our blockchain and AI technologies are revolutionizing crime reporting and evidence management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4">Blockchain Security</h2>
              <p className="text-gray-600 mb-6">
                Midshield leverages blockchain technology to create an immutable record of all evidence. 
                Once uploaded, evidence cannot be altered or tampered with, ensuring the integrity of 
                your submissions. Every piece of evidence receives a unique cryptographic hash that 
                verifies its authenticity.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Immutable evidence storage</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Cryptographic verification</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Transparent audit trail</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4">AI-Powered Analysis</h2>
              <p className="text-gray-600 mb-6">
                Our advanced AI algorithms analyze evidence to automatically generate comprehensive 
                reports. The system can identify key details, compare multiple pieces of evidence, 
                and highlight patterns that might be missed by human observation alone.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Automated report generation</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Multi-image comparison</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700">Pattern recognition</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-8 mb-16">
            <h2 className="text-2xl font-bold mb-4 text-center">Crypto Reward System</h2>
            <p className="text-gray-600 mb-6 text-center max-w-3xl mx-auto">
              Midshield incentivizes active participation in public safety by rewarding users with 
              cryptocurrency tokens for reporting crimes and submitting valuable evidence. The more 
              useful your contribution, the higher the reward.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-shield-blue">Submit Evidence</h3>
                <p className="text-gray-600 mb-4">Upload images and videos of crime scenes securely through our platform.</p>
                <Link to="/get-started" className="text-shield-blue hover:underline flex items-center">
                  Get started <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-shield-blue">Earn Rewards</h3>
                <p className="text-gray-600 mb-4">Receive SHIELD tokens for verified submissions that contribute to public safety.</p>
                <Link to="/connect-wallet" className="text-shield-blue hover:underline flex items-center">
                  Connect wallet <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-shield-blue">Track Progress</h3>
                <p className="text-gray-600 mb-4">Monitor your contributions and rewards through your personal dashboard.</p>
                <Link to="/view-all-rewards" className="text-shield-blue hover:underline flex items-center">
                  View rewards <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/get-started">
              <Button size="lg" className="bg-shield-blue text-white hover:bg-blue-600 transition-all">
                Get Started with Midshield
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LearnMore;
