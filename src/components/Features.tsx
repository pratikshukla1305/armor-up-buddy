
import React from 'react';
import { Shield, Upload, FileText, Search, Award, Image, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  link
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay?: number;
  link?: string;
}) => {
  const CardContent = (
    <div 
      className="glass-card p-6 animate-fade-up" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="rounded-full w-12 h-12 bg-[#0D2644]/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[#0D2644]" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{CardContent}</Link>;
  }
  return CardContent;
};

const Features = () => {
  return (
    <section className="section-padding bg-white" id="features">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-shield-border bg-white shadow-sm mb-4">
            <span className="text-xs font-medium">Unique Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Advanced Technology, <span className="text-[#0D2644]">Simple Experience</span></h2>
          <p className="text-gray-600 text-lg">
            Midshield combines powerful AI analysis tools with user-friendly reporting options to create a seamless evidence management system.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={UserCircle} 
            title="Self Reporting" 
            description="Submit detailed reports without photos or videos. Option for anonymous and confidential reporting with full user privacy."
            delay={0.1}
          />
          <FeatureCard 
            icon={Upload} 
            title="Simple Uploading" 
            description="Easily upload images of crime scenes with an intuitive interface designed for speed and accessibility."
            delay={0.2}
          />
          <FeatureCard 
            icon={FileText} 
            title="AI Report Generation" 
            description="Our AI automatically generates comprehensive reports from your evidence, saving time and ensuring consistency."
            delay={0.3}
          />
          <FeatureCard 
            icon={Search} 
            title="Evidence Request" 
            description="Help officer in giving some evidence, information on the report officers are working upon."
            delay={0.4}
          />
          <FeatureCard 
            icon={Award} 
            title="SOS" 
            description="Send emergency alerts whenever in risk, requires safety."
            delay={0.5}
          />
          <FeatureCard 
            icon={Image} 
            title="Advisories" 
            description="See the latest Advisories given by the goverment and the authorities."
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
