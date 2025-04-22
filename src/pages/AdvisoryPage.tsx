
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdvisoryList from '@/components/advisory/AdvisoryList';

const AdvisoryPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Government & Police Advisories
            </h1>
            <p className="text-gray-600 mb-8">
              Stay informed with the latest orders, announcements, and safety advisories from government agencies and law enforcement.
            </p>
            
            <AdvisoryList />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdvisoryPage;
