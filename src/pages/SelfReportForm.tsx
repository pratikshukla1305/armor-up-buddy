
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const SelfReportForm = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Self Report</CardTitle>
          <CardDescription>
            Please sign in to submit a report
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Self Report Form</CardTitle>
        <CardDescription>
          Submit your report securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: Implement full self-report form functionality */}
        <p>Self Report Form Coming Soon</p>
      </CardContent>
    </Card>
  );
};

export default SelfReportForm;
