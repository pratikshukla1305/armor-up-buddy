
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConnectionTestProps {
  onComplete?: (success: boolean) => void;
}

const ConnectionTest: React.FC<ConnectionTestProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{
    connected: boolean;
    error?: string;
    details?: any;
    tables?: string[];
  }>({
    connected: false
  });

  const runTest = async () => {
    setIsLoading(true);
    try {
      console.log("Testing Supabase connection...");
      
      // Test basic connection
      const { data, error } = await supabase.from('crime_reports').select('count').limit(1);
      
      if (error) {
        console.error("Connection test failed:", error);
        setTestResults({
          connected: false,
          error: error.message,
          details: error
        });
        if (onComplete) onComplete(false);
        return;
      }
      
      // Get list of available tables
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      const tableNames = tablesError ? [] : (tables || []).map((t: any) => t.tablename);
      
      setTestResults({
        connected: true,
        tables: tableNames
      });
      
      console.log("Connection test successful");
      console.log("Available tables:", tableNames);
      
      if (onComplete) onComplete(true);
    } catch (error: any) {
      console.error("Unexpected error during connection test:", error);
      setTestResults({
        connected: false,
        error: error.message || 'Unknown error',
        details: error
      });
      if (onComplete) onComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Supabase Connection Test</h3>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Testing connection...</span>
        </div>
      ) : testResults.connected ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Connected successfully</span>
          </div>
          
          {testResults.tables && testResults.tables.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Available tables:</p>
              <div className="text-xs bg-white p-2 rounded border max-h-24 overflow-y-auto">
                {testResults.tables.map(table => (
                  <div key={table} className="mb-1">{table}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Connection failed</span>
          </div>
          
          {testResults.error && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Error message:</p>
              <div className="text-xs bg-red-50 p-2 rounded border border-red-200 font-mono">
                {testResults.error}
              </div>
            </div>
          )}
          
          <p className="text-sm mt-2">This may be due to:</p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
            <li>Missing environment variables in your Vercel deployment</li>
            <li>Network connectivity issues</li>
            <li>Supabase service disruption</li>
            <li>CORS restrictions</li>
          </ul>
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={runTest}
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Testing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Test Again
          </>
        )}
      </Button>
    </div>
  );
};

export default ConnectionTest;
