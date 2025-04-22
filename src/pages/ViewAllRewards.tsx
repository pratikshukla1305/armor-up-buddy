
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Award, ArrowUp, Wallet, Star } from 'lucide-react';

const ViewAllRewards = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-card p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Reward History</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Award className="h-5 w-5 text-shield-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium">Evidence Submission</h3>
                        <p className="text-sm text-gray-500">July 18, 2023</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+25 SHIELD</p>
                      <p className="text-sm text-gray-500">≈ $12.50 USD</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Star className="h-5 w-5 text-shield-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium">Quality Bonus</h3>
                        <p className="text-sm text-gray-500">July 15, 2023</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+50 SHIELD</p>
                      <p className="text-sm text-gray-500">≈ $25.00 USD</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Award className="h-5 w-5 text-shield-blue" />
                      </div>
                      <div>
                        <h3 className="font-medium">Report Verification</h3>
                        <p className="text-sm text-gray-500">July 12, 2023</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+15 SHIELD</p>
                      <p className="text-sm text-gray-500">≈ $7.50 USD</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button variant="outline" className="border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all">
                    Load More History
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="glass-card p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Balance</h2>
                  <Wallet className="h-6 w-6 text-shield-blue" />
                </div>
                
                <div className="bg-shield-light rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Available SHIELD</span>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">+25% this month</span>
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold mr-2">250</span>
                    <span className="text-xl text-shield-blue font-medium">SHIELD</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">≈ $125.00 USD</div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-shield-blue text-white hover:bg-blue-600 transition-all">
                    Withdraw Tokens
                  </Button>
                  <Link to="/connect-wallet">
                    <Button variant="outline" className="w-full border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all">
                      Change Wallet
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold mb-4">Your Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Monthly Rank</span>
                      <span className="font-medium">#12</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-shield-blue h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Submissions</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-shield-blue h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Verification Rate</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-shield-blue h-2 rounded-full" style={{ width: '92%' }}></div>
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

export default ViewAllRewards;
