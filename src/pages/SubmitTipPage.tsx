
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TipForm from '@/components/helpus/TipForm';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';

const SubmitTipPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitStart = () => {
    setIsSubmitting(true);
  };
  
  const handleSubmitEnd = () => {
    setIsSubmitting(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Submit a Tip | Shield</title>
        <meta name="description" content="Submit information about criminal sightings to help law enforcement." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-gray-800 font-medium">Submitting your report...</p>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Submit a Criminal Sighting Tip
            </h1>
            <p className="text-gray-600 mb-8">
              Your information can help authorities locate wanted individuals. All submissions are secure and can be made anonymously.
            </p>
            
            <TipForm onSubmitStart={handleSubmitStart} onSubmitEnd={handleSubmitEnd} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubmitTipPage;
