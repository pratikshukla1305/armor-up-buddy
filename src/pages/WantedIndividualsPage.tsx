
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';
import CriminalListing from '@/components/helpus/CriminalListing';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const WantedIndividualsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Most Wanted Individuals | Shield</title>
        <meta name="description" content="View the list of most wanted individuals in your area. Help us locate these individuals by submitting tips." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mb-6">
          <Link to="/help-us">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Help Us Page
            </Button>
          </Link>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Most Wanted Individuals
            </h1>
            <p className="text-gray-600 mb-8">
              These individuals are currently wanted by law enforcement. If you have any information about their whereabouts, please submit a tip.
            </p>
            
            <CriminalListing />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WantedIndividualsPage;
