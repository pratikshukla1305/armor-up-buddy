import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfficerAuthProvider } from "@/contexts/OfficerAuthContext";
import ProtectedOfficerRoute from "@/components/officer/ProtectedOfficerRoute";
import SecureAuthFlow from "@/components/auth/SecureAuthFlow";
import SOSButton from "@/components/sos/SOSButton";
import Index from "./pages/Index";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  const handleSOSClick = () => {
    console.log("Global SOS button clicked");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfficerAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/learn-more" element={<LearnMore />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/e-kyc" element={<EKycPage />} />
                <Route path="/officer-login" element={<OfficerLogin />} />
                <Route path="/officer-registration" element={<OfficerRegistration />} />

                <Route path="/dashboard" element={
                  <SecureAuthFlow>
                    <Dashboard />
                  </SecureAuthFlow>
                } />
                <Route path="/profile" element={
                  <SecureAuthFlow>
                    <Profile />
                  </SecureAuthFlow>
                } />
                <Route path="/my-reports" element={
                  <SecureAuthFlow>
                    <MyReports />
                  </SecureAuthFlow>
                } />
                <Route path="/notifications" element={
                  <SecureAuthFlow>
                    <Notifications />
                  </SecureAuthFlow>
                } />
                
                <Route path="/officer-dashboard" element={
                  <ProtectedOfficerRoute>
                    <OfficerDashboard />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-profile" element={
                  <ProtectedOfficerRoute>
                    <OfficerProfile />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-settings" element={
                  <ProtectedOfficerRoute>
                    <OfficerSettings />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-user-profiles" element={
                  <ProtectedOfficerRoute>
                    <OfficerUserProfiles />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-reports" element={
                  <ProtectedOfficerRoute>
                    <OfficerReports />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-kyc" element={
                  <ProtectedOfficerRoute>
                    <OfficerKyc />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-advisories" element={
                  <ProtectedOfficerRoute>
                    <OfficerAdvisories />
                  </ProtectedOfficerRoute>
                } />
                <Route path="/officer-case-map" element={
                  <ProtectedOfficerRoute>
                    <OfficerCaseMap />
                  </ProtectedOfficerRoute>
                } />
                
                <Route path="/continue-report" element={
                  <SecureAuthFlow>
                    <ContinueReport />
                  </SecureAuthFlow>
                } />
                <Route path="/cancel-report" element={
                  <SecureAuthFlow>
                    <CancelReport />
                  </SecureAuthFlow>
                } />
                <Route path="/view-draft-report" element={
                  <SecureAuthFlow>
                    <ViewDraftReport />
                  </SecureAuthFlow>
                } />
                <Route path="/generate-detailed-report" element={
                  <SecureAuthFlow>
                    <GenerateDetailedReport />
                  </SecureAuthFlow>
                } />
                <Route path="/connect-wallet" element={
                  <SecureAuthFlow>
                    <ConnectWallet />
                  </SecureAuthFlow>
                } />
                <Route path="/learn-about-rewards" element={<LearnAboutRewards />} />
                <Route path="/view-all-rewards" element={<ViewAllRewards />} />
                <Route path="/request-demo" element={<RequestDemo />} />
                <Route path="/police-stations" element={<PoliceStationsMap />} />
                <Route path="/case-heatmap" element={<CaseHeatmap />} />
                <Route path="/case-density-map" element={<CaseHeatmap />} />
                <Route path="/police-station/:id" element={<PoliceStationDetail />} />
                <Route path="/help-us" element={<HelpUsPage />} />
                <Route path="/wanted-individuals" element={<WantedIndividualsPage />} />
                <Route path="/submit-tip" element={<SubmitTipPage />} />
                <Route path="/submit-evidence" element={<SubmitEvidence />} />
                <Route path="/advisory" element={<AdvisoryPage />} />
                <Route path="/forum" element={
                  <SecureAuthFlow>
                    <DiscussionForum />
                  </SecureAuthFlow>
                } />
                <Route path="/self-report" element={
                  <SecureAuthFlow>
                    <SelfReportForm />
                  </SecureAuthFlow>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <div className="fixed bottom-6 right-6 z-50">
                <SOSButton 
                  onClick={handleSOSClick} 
                  variant="floating" 
                  size="lg"
                />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </OfficerAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
