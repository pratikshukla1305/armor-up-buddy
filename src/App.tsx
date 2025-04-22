import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfficerAuthProvider } from "@/contexts/OfficerAuthContext";
import ProtectedOfficerRoute from "@/components/officer/ProtectedOfficerRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import FeaturesPage from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import SignIn from "./pages/SignIn";
import GetStarted from "./pages/GetStarted";
import NotFound from "./pages/NotFound";
import LearnMore from "./pages/LearnMore";
import ContinueReport from "./pages/ContinueReport";
import CancelReport from "./pages/CancelReport";
import ViewDraftReport from "./pages/ViewDraftReport";
import GenerateDetailedReport from "./pages/GenerateDetailedReport";
import ConnectWallet from "./pages/ConnectWallet";
import LearnAboutRewards from "./pages/LearnAboutRewards";
import ViewAllRewards from "./pages/ViewAllRewards";
import RequestDemo from "./pages/RequestDemo";
import EKycPage from "./pages/EKycPage";
import PoliceStationsMap from "./pages/PoliceStationsMap";
import CaseHeatmap from "./pages/CaseHeatmap";
import PoliceStationDetail from "./pages/PoliceStationDetail";
import HelpUsPage from "./pages/HelpUsPage";
import SubmitTipPage from "./pages/SubmitTipPage";
import SubmitEvidence from "./pages/SubmitEvidence";
import AdvisoryPage from "./pages/AdvisoryPage";
import AboutUs from "./pages/AboutUs";
import OfficerLogin from "./pages/OfficerLogin";
import OfficerRegistration from "./pages/OfficerRegistration";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerProfile from "./pages/OfficerProfile";
import OfficerSettings from "./pages/OfficerSettings";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyReports from "./pages/MyReports";
import Notifications from "./pages/Notifications";
import OfficerUserProfiles from "./pages/OfficerUserProfiles";
import OfficerReports from "./pages/OfficerReports";
import OfficerKyc from "./pages/OfficerKyc";
import OfficerAdvisories from "./pages/OfficerAdvisories";
import OfficerCaseMap from "./pages/OfficerCaseMap";
import DiscussionForum from "./pages/DiscussionForum";
import SelfReportForm from './components/SelfReportForm';
import WantedIndividualsPage from './pages/WantedIndividualsPage';

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

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
                <Route path="/continue-report" element={<ContinueReport />} />
                <Route path="/cancel-report" element={<CancelReport />} />
                <Route path="/view-draft-report" element={<ViewDraftReport />} />
                <Route path="/generate-detailed-report" element={<GenerateDetailedReport />} />
                <Route path="/connect-wallet" element={<ConnectWallet />} />
                <Route path="/learn-about-rewards" element={<LearnAboutRewards />} />
                <Route path="/view-all-rewards" element={<ViewAllRewards />} />
                <Route path="/request-demo" element={<RequestDemo />} />
                <Route path="/e-kyc" element={<EKycPage />} />
                <Route path="/police-stations" element={<PoliceStationsMap />} />
                <Route path="/case-heatmap" element={<CaseHeatmap />} />
                <Route path="/case-density-map" element={<CaseHeatmap />} />
                <Route path="/police-station/:id" element={<PoliceStationDetail />} />
                <Route path="/help-us" element={<HelpUsPage />} />
                <Route path="/submit-tip" element={<SubmitTipPage />} />
                <Route path="/submit-evidence" element={<SubmitEvidence />} />
                <Route path="/advisory" element={<AdvisoryPage />} />
                <Route path="/officer-login" element={<OfficerLogin />} />
                <Route path="/officer-registration" element={<OfficerRegistration />} />
                
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
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/forum" element={<DiscussionForum />} />
                <Route path="/self-report" element={<SelfReportForm />} />
                <Route path="/wanted-individuals" element={<WantedIndividualsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OfficerAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
