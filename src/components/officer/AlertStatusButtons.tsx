
import React from 'react';
import { Button } from '@/components/ui/button';

interface AlertStatusButtonsProps {
  status: string | undefined;
  onUpdateStatus: (status: string) => void;
  contactInfo?: string;
}

const AlertStatusButtons: React.FC<AlertStatusButtonsProps> = ({
  status,
  onUpdateStatus,
  contactInfo
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {status !== "In Progress" && (
        <Button 
          size="sm" 
          variant="outline" 
          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          onClick={() => onUpdateStatus("In Progress")}
        >
          Mark In Progress
        </Button>
      )}
      
      {status !== "Resolved" && (
        <Button 
          size="sm" 
          variant="outline" 
          className="border-green-500 text-green-600 hover:bg-green-50"
          onClick={() => onUpdateStatus("Resolved")}
        >
          Mark Resolved
        </Button>
      )}
      
      <Button 
        size="sm"
        variant="outline" 
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
        disabled={!contactInfo}
      >
        {contactInfo ? "Call Citizen" : "No Contact Info"}
      </Button>
    </div>
  );
};

export default AlertStatusButtons;
