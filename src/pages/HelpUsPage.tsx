
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CriminalListing from '@/components/helpus/CriminalListing';
import TipForm from '@/components/helpus/TipForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HelpUsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Help Us Find These Individuals
            </h1>
            <p className="text-gray-600 mb-8">
              Your vigilance can make our community safer. If you spot any of these individuals, please report the sighting securely through our platform.
            </p>
            
            <Tabs defaultValue="wanted" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="wanted" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Wanted Individuals
                </TabsTrigger>
                <TabsTrigger value="submit" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Submit a Tip
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wanted" className="mt-0">
                <CriminalListing />
              </TabsContent>
              
              <TabsContent value="submit" className="mt-0">
                <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Important Information</h3>
                  <p className="text-gray-700">
                    If you believe you've seen one of these individuals or have information that could help locate them:
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                    <li>Do not approach the individual yourself</li>
                    <li>Submit a report through this secure platform</li>
                    <li>Include as many details as possible about the sighting</li>
                    <li>For emergencies, always call your local emergency number first</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg border border-gray-200">
                  <TipForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpUsPage;
