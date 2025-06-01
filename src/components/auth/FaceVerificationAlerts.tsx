
import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FaceVerificationAlertsProps {
  showDifferentPersonAlert: boolean;
  showNoFaceAlert: boolean;
  onCloseDifferentPersonAlert: () => void;
  onCloseNoFaceAlert: () => void;
}

const FaceVerificationAlerts: React.FC<FaceVerificationAlertsProps> = ({
  showDifferentPersonAlert,
  showNoFaceAlert,
  onCloseDifferentPersonAlert,
  onCloseNoFaceAlert
}) => {
  return (
    <>
      {/* Different person alert dialog */}
      <AlertDialog open={showDifferentPersonAlert} onOpenChange={onCloseDifferentPersonAlert}>
        <AlertDialogContent className="border-red-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Security Alert!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              A different person has been detected. For security reasons, verification may be required to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={onCloseDifferentPersonAlert}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Acknowledge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* No face detected alert dialog */}
      <AlertDialog open={showNoFaceAlert} onOpenChange={onCloseNoFaceAlert}>
        <AlertDialogContent className="border-amber-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Face Not Detected</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              No face is currently visible. Please position yourself clearly in front of the camera to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={onCloseNoFaceAlert}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FaceVerificationAlerts;
