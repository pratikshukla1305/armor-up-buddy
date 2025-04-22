
import React from 'react';
import Navbar from '@/components/Navbar';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
