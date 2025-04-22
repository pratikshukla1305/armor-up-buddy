
import React from 'react';
import NavbarWithNotifications from '@/components/NavbarWithNotifications';
import { Helmet } from 'react-helmet';
import WantedIndividualsList from '@/components/helpus/WantedIndividualsList';
import { Info } from 'lucide-react';

const WantedIndividualsPage = () => {
  return (
    <>
      <Helmet>
        <title>Wanted Individuals | SafetyNet</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <NavbarWithNotifications />
        
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wanted Individuals</h1>
            <p className="mt-2 text-gray-600">
              Below are individuals currently wanted by law enforcement. If you have any information,
              please submit a tip. Your identity can remain anonymous.
            </p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Notice</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>
                    Do not approach these individuals. If you see someone you recognize, contact law enforcement 
                    immediately or submit a tip through this platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <WantedIndividualsList />
        </main>
      </div>
    </>
  );
};

export default WantedIndividualsPage;
