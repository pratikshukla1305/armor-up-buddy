
import React from 'react';
import { Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SelfReportSection = () => {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#0D2644] flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
      <div className="glass-card p-6 h-full">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Self Report</h3>
          <Shield className="h-5 w-5 text-[#0D2644]" />
        </div>
        
        <div className="rounded-xl bg-shield-light p-5 mb-6">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-[#0D2644]" />
              <span className="text-sm font-medium">Report Without Evidence</span>
            </div>
            <p className="text-sm text-gray-600">
              You can submit reports without photos or videos. Describe what happened, where and when it occurred, and any other details you recall.
            </p>
            <p className="text-sm text-gray-600">
              Your report will be reviewed by law enforcement and may help solve crimes in your community.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link to="/self-report">
            <Button 
              className="bg-[#0D2644] text-white hover:bg-[#0D2644]/90 transition-all"
            >
              Create Self Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SelfReportSection;
