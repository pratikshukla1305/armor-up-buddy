
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Camera, CheckCircle, Users, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
              <Shield className="h-4 w-4 text-shield-blue mr-2" />
              <span className="text-xs font-medium">About Midshield</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Transforming <span className="text-shield-blue">Public Safety</span> with Technology</h1>
            <p className="text-gray-600 text-lg">
              Midshield is a revolutionary platform empowering citizens to actively participate in creating safer communities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Shield className="h-6 w-6 text-shield-blue mr-2" />
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6">
                At Midshield, we believe that technology can bridge the gap between citizens and law enforcement agencies 
                to create safer communities. Our platform leverages blockchain technology and artificial intelligence 
                to provide secure, tamper-proof evidence submission, automated report generation, and instant 
                communication with authorities.
              </p>
              <p className="text-gray-600">
                Our mission is to empower every citizen to take an active role in public safety while ensuring 
                their contributions are secure, private, and properly rewarded.
              </p>
            </div>
            
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Users className="h-6 w-6 text-shield-blue mr-2" />
                Who We Serve
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Citizens</h3>
                    <p className="text-gray-600">Providing tools to report crimes, submit evidence, and contribute to public safety</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Law Enforcement</h3>
                    <p className="text-gray-600">Offering a secure platform to receive verified reports and manage evidence</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Communities</h3>
                    <p className="text-gray-600">Creating stronger, safer neighborhoods through collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-8 mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center">
              <FileText className="h-6 w-6 text-shield-blue mr-2" />
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-blue-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-shield-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Evidence Collection</h3>
                <p className="text-gray-600">
                  Upload photos and videos with immutable blockchain storage to ensure evidence cannot be tampered with.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-blue-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-shield-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">KYC Verification</h3>
                <p className="text-gray-600">
                  Our electronic Know Your Customer (e-KYC) process ensures all users are verified, maintaining trust in the system.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-blue-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-shield-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Emergency SOS</h3>
                <p className="text-gray-600">
                  Instant alert system to signal authorities in case of emergencies, sharing your location and critical information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-8 mb-16">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Join the Midshield Community</h2>
              <p className="text-gray-600 mb-8">
                Whether you're a concerned citizen or a law enforcement officer, Midshield provides the tools you need to make a difference.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/get-started">
                  <Button size="lg" className="bg-shield-blue text-white hover:bg-blue-600 transition-all w-full sm:w-auto">
                    Create Citizen Account
                  </Button>
                </Link>
                <Link to="/officer-login">
                  <Button size="lg" variant="outline" className="border-shield-blue text-shield-blue hover:bg-blue-50 transition-all w-full sm:w-auto">
                    Officer Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
