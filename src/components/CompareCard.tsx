
import React from 'react';
import { Search, Image, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CompareCardProps = {
  className?: string;
};

const CompareCard = ({ className }: CompareCardProps) => {
  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Image Comparison</h3>
        <Search className="h-5 w-5 text-shield-blue" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-xl p-2 bg-white">
          <div className="h-32 rounded-lg bg-gray-100 shimmer mb-2 flex items-center justify-center">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-xs text-center text-gray-500">Crime Scene A</div>
        </div>
        
        <div className="border rounded-xl p-2 bg-white">
          <div className="h-32 rounded-lg bg-gray-100 shimmer mb-2 flex items-center justify-center">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-xs text-center text-gray-500">Crime Scene B</div>
        </div>
      </div>
      
      <div className="rounded-xl bg-shield-light p-4 mb-6">
        <div className="text-sm font-medium mb-2">Similarity Analysis</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Pattern Recognition</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                <div className="h-full w-3/4 bg-shield-blue"></div>
              </div>
              <span className="text-xs font-medium">75%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Location Similarity</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                <div className="h-full w-1/4 bg-shield-blue"></div>
              </div>
              <span className="text-xs font-medium">25%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Timing Correlation</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                <div className="h-full w-1/2 bg-shield-blue"></div>
              </div>
              <span className="text-xs font-medium">50%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 border rounded-lg mb-6">
        <div className="flex items-center space-x-2">
          <ArrowUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">High chance of connection</span>
        </div>
        <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">87%</span>
      </div>
      
      <div className="flex justify-end">
        <Button 
          to="/generate-detailed-report"
          className="bg-shield-blue text-white hover:bg-blue-600 transition-all"
        >
          Generate Detailed Report
        </Button>
      </div>
    </div>
  );
};

export default CompareCard;
