
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Officer } from '@/types/officer';

type OfficerAuthContextType = {
  officer: Officer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<Officer | null>;
  refreshProfile: () => Promise<void>;
};

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const OfficerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if officer is logged in from local storage on initialization
    const storedOfficer = localStorage.getItem('officer');
    
    if (storedOfficer) {
      try {
        const officerData = JSON.parse(storedOfficer);
        setOfficer(officerData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing stored officer data:", e);
        localStorage.removeItem('officer');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Query from officer_profiles table with department_email and password
      const { data, error } = await supabase
        .from('officer_profiles')
        .select('*')
        .eq('department_email', email)
        .single();
      
      if (error) {
        toast.error("Login failed. Please check your credentials.");
        return { error };
      }
      
      // In a real app, we would never check passwords directly like this
      // We would use a proper authentication system with hashed passwords
      // This is just for demonstration
      if (data && data.password === password) {
        const officerData: Officer = {
          id: data.id,
          full_name: data.full_name,
          badge_number: data.badge_number,
          department: data.department,
          department_email: data.department_email,
          phone_number: data.phone_number
        };
        
        // Store officer data in local storage
        localStorage.setItem('officer', JSON.stringify(officerData));
        
        setOfficer(officerData);
        setIsAuthenticated(true);
        toast.success(`Welcome, Officer ${officerData.full_name}`);
        return { error: null };
      } else {
        toast.error("Invalid credentials");
        return { error: new Error("Invalid credentials") };
      }
    } catch (err: any) {
      console.error("Sign-in error:", err.message);
      toast.error(`Login error: ${err.message}`);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('officer');
    setOfficer(null);
    setIsAuthenticated(false);
    toast.success("Signed out successfully");
  };

  const getProfile = async (): Promise<Officer | null> => {
    if (!officer) return null;
    return officer;
  };
  
  const refreshProfile = async () => {
    if (!officer) return;
    
    try {
      const { data, error } = await supabase
        .from('officer_profiles')
        .select('*')
        .eq('id', officer.id)
        .single();
        
      if (error) {
        console.error("Error refreshing officer profile:", error);
        return;
      }
      
      if (data) {
        const updatedOfficerData: Officer = {
          id: data.id,
          full_name: data.full_name,
          badge_number: data.badge_number,
          department: data.department,
          department_email: data.department_email,
          phone_number: data.phone_number
        };
        
        // Update local storage and state
        localStorage.setItem('officer', JSON.stringify(updatedOfficerData));
        setOfficer(updatedOfficerData);
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  const value = {
    officer,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    getProfile,
    refreshProfile
  };

  return <OfficerAuthContext.Provider value={value}>{children}</OfficerAuthContext.Provider>;
};

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (context === undefined) {
    throw new Error('useOfficerAuth must be used within an OfficerAuthProvider');
  }
  return context;
};
