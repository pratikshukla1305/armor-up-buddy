
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wallet, Shield, Star } from 'lucide-react';

const ConnectWallet = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <Wallet className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">Crypto Wallet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 text-lg">
              Link your crypto wallet to start earning rewards for your contributions to public safety.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">Available Wallets</h2>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-shield-blue hover:shadow-sm transition-all">
                  <div className="flex items-center">
                    <img src="/metamask.svg" alt="MetaMask" className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium">MetaMask</h3>
                      <p className="text-sm text-gray-500">Connect to your MetaMask wallet</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-shield-blue text-white hover:bg-blue-600 transition-all">
                    Connect
                  </Button>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-shield-blue hover:shadow-sm transition-all">
                  <div className="flex items-center">
                    <img src="/walletconnect.svg" alt="WalletConnect" className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium">WalletConnect</h3>
                      <p className="text-sm text-gray-500">Connect using WalletConnect</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-shield-blue text-white hover:bg-blue-600 transition-all">
                    Connect
                  </Button>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-shield-blue hover:shadow-sm transition-all">
                  <div className="flex items-center">
                    <img src="/coinbase.svg" alt="Coinbase Wallet" className="w-8 h-8 mr-3" />
                    <div className="text-left">
                      <h3 className="font-medium">Coinbase Wallet</h3>
                      <p className="text-sm text-gray-500">Connect to Coinbase Wallet</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-shield-blue text-white hover:bg-blue-600 transition-all">
                    Connect
                  </Button>
                </button>
              </div>
            </div>
            
            <div>
              <div className="glass-card p-8 mb-6">
                <h2 className="text-2xl font-bold mb-4">Why Connect?</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-shield-blue mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium mb-1">Earn SHIELD Tokens</h3>
                      <p className="text-gray-600">Get rewarded with SHIELD tokens for your contributions to public safety.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Star className="h-5 w-5 text-shield-blue mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium mb-1">Unlock Benefits</h3>
                      <p className="text-gray-600">Access exclusive features and higher reward tiers as you contribute more.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link to="/learn-about-rewards" className="block">
                <Button variant="outline" className="w-full border-shield-blue text-shield-blue hover:bg-shield-blue hover:text-white transition-all">
                  Learn More About Rewards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ConnectWallet;
