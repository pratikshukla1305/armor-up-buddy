
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Star, Award } from 'lucide-react';

const LearnAboutRewards = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <Award className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">Reward System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Earn <span className="text-shield-blue">SHIELD</span> Tokens</h1>
            <p className="text-gray-600 text-lg">
              Learn how you can earn cryptocurrency rewards while contributing to public safety.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-shield-blue mr-3" />
                <h2 className="text-2xl font-bold">Submit Evidence</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Upload images, videos, or written reports of incidents. Each verified submission earns you SHIELD tokens.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>10 SHIELD per verified image</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>25 SHIELD per verified video</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>15 SHIELD per written report</span>
                </li>
              </ul>
              <Link to="/get-started">
                <Button className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                  Start Submitting
                </Button>
              </Link>
            </div>
            
            <div className="glass-card p-8">
              <div className="flex items-center mb-6">
                <Star className="h-8 w-8 text-shield-blue mr-3" />
                <h2 className="text-2xl font-bold">Quality Bonuses</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Earn additional rewards for providing high-quality, detailed evidence that leads to successful outcomes.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>50 SHIELD for critical evidence</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>100 SHIELD for case-solving info</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>2x multiplier for urgent cases</span>
                </li>
              </ul>
              <Link to="/connect-wallet">
                <Button className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                  Connect Wallet
                </Button>
              </Link>
            </div>
            
            <div className="glass-card p-8">
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-shield-blue mr-3" />
                <h2 className="text-2xl font-bold">Monthly Rewards</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Top contributors receive additional rewards and recognition through our monthly program.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>500 SHIELD for top contributor</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Special badges and recognition</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Access to exclusive features</span>
                </li>
              </ul>
              <Link to="/view-all-rewards">
                <Button className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Token Value Section */}
          <div className="glass-card p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">SHIELD Token Value</h2>
                <p className="text-gray-600 mb-6">
                  SHIELD tokens have real value and can be traded on supported cryptocurrency exchanges. 
                  The value of tokens increases as our platform grows and more users participate in 
                  maintaining public safety.
                </p>
                <div className="bg-shield-light rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current Value</p>
                      <p className="text-xl font-bold text-shield-blue">$0.50 USD</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">24h Change</p>
                      <p className="text-xl font-bold text-green-500">+5.2%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-6">
                  Ready to start earning SHIELD tokens? Follow these simple steps to begin your journey 
                  in contributing to public safety while earning rewards.
                </p>
                <div className="space-y-4">
                  <Button className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                    Create Account
                  </Button>
                  <Button variant="outline" className="w-full border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all">
                    Connect Wallet
                  </Button>
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

export default LearnAboutRewards;
