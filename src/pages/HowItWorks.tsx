
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UploadCard from '@/components/UploadCard';
import ReportCard from '@/components/ReportCard';
import SelfReportForm from '@/components/SelfReportForm';
import { Shield, FileText, UserCircle } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="section-padding bg-shield-light mt-16" id="how-it-works">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <span className="text-xs font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How <span className="text-shield-blue">Shield</span> Works</h2>
            <p className="text-gray-600 text-lg">
              Our platform streamlines the entire process from evidence collection to analysis, with blockchain security at every step.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-shield-blue flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
              <UploadCard className="h-full" />
            </div>
            
            <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-shield-blue flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
              <ReportCard className="h-full" />
            </div>
            
            <div className="relative animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-shield-blue flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
              <div className="h-full rounded-xl shadow-lg bg-white p-6">
                <div className="rounded-full w-12 h-12 bg-shield-blue/10 flex items-center justify-center mb-4">
                  <UserCircle className="h-6 w-6 text-shield-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Self Reporting</h3>
                <p className="text-gray-600 mb-4">
                  Don't have photos or videos? You can still submit a detailed text description of what happened.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-shield-blue">•</div>
                    <span className="text-sm text-gray-600">Describe the incident in detail</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-shield-blue">•</div>
                    <span className="text-sm text-gray-600">Option to remain anonymous</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-shield-blue">•</div>
                    <span className="text-sm text-gray-600">Request confidential handling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-semibold mb-4">AI-Powered Security</h3>
            <p className="text-gray-600 text-lg mb-8">
              Every image and report submitted through Shield is secured. Our AI analyzes and processes information to create detailed reports and identify patterns that might be missed by human observation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <Shield className="h-6 w-6 text-shield-blue mr-3" />
                <span className="font-medium">Immutable Evidence</span>
              </div>
              
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <Shield className="h-6 w-6 text-shield-blue mr-3" />
                <span className="font-medium">AI Analysis</span>
              </div>
              
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <Shield className="h-6 w-6 text-shield-blue mr-3" />
                <span className="font-medium">Report Pdf</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Self Report Section */}
      <section className="section-padding bg-white" id="self-report">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-shield-light shadow-sm mb-4">
              <FileText className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">Self Reporting</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Submit a Report <span className="text-shield-blue">Without Evidence</span></h2>
            <p className="text-gray-600">
              No photos or videos? No problem. You can still report incidents by providing a detailed description.
            </p>
          </div>
          
          <SelfReportForm />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
