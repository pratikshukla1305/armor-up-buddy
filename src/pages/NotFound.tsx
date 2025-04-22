
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const isOfficerRoute = location.pathname.includes('officer');
  
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-stripe-blue-dark rounded-full p-3">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-3 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="bg-stripe-blue-dark hover:bg-stripe-blue-dark/90 inline-flex items-center">
          <Link to={isOfficerRoute ? "/officer-dashboard" : "/"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isOfficerRoute ? "Return to Officer Dashboard" : "Return to Home"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
