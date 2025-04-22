
import React from 'react';
import { Helmet } from 'react-helmet';
import NavbarWithNotifications from '@/components/NavbarWithNotifications';
import CriminalListing from '@/components/helpus/CriminalListing';
import TipForm from '@/components/helpus/TipForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Search, CornerRightDown } from 'lucide-react';

const HelpUsPage = () => {
  return (
    <>
      <Helmet>
        <title>Help Us | SafetyNet</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <NavbarWithNotifications />
        
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Help Us</h1>
            <p className="mt-2 text-gray-600">
              Help law enforcement by providing information about criminal cases or suspects.
              Your tips can remain anonymous.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">View Wanted Individuals</h2>
                  <p className="text-gray-600">See profiles of currently wanted individuals</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Browse through profiles of individuals currently wanted by law enforcement.
                If you recognize someone or have information about their whereabouts, you can
                submit an anonymous tip.
              </p>
              <Link to="/wanted-individuals">
                <Button className="w-full">View Wanted Individuals</Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 p-3 rounded-full mr-4">
                  <CornerRightDown className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Submit a Tip</h2>
                  <p className="text-gray-600">Provide information about criminal activity</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                If you have information about any criminal activity or individuals wanted by law
                enforcement, you can submit a tip. You can choose to remain anonymous.
              </p>
              <Link to="/submit-tip">
                <Button className="w-full" variant="secondary">Submit a Tip</Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Safety Warning</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Do not approach any individuals you recognize as wanted. Contact local law enforcement instead.</p>
                </div>
              </div>
            </div>
          </div>
          
          <CriminalListing />
          
          <div className="mt-12">
            <TipForm />
          </div>
        </main>
      </div>
    </>
  );
};

export default HelpUsPage;
