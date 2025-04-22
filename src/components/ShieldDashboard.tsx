
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldIcon } from "./ShieldIcon";
import { SecurityLevel } from "./SecurityLevel";
import { ShieldControls } from "./ShieldControls";
import { ShieldCustomizer } from "./ShieldCustomizer";
import { SecurityCard } from "./SecurityCard";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export function ShieldDashboard() {
  const [shieldActive, setShieldActive] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(65);

  const handleShieldToggle = (status: boolean) => {
    setShieldActive(status);
    // Simulate security level change when shield is toggled
    setSecurityLevel(status ? 85 : 45);
  };

  const recommendations = [
    {
      title: "Enable Advanced Protection",
      description: "Add an extra layer of security with advanced features.",
      severity: "medium" as const,
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />
    },
    {
      title: "Update Shield Definitions",
      description: "Latest definitions help protect against new threats.",
      severity: "high" as const,
      icon: <ShieldAlert className="w-5 h-5 text-shield-red" />
    },
    {
      title: "Regular Shield Scans",
      description: "Schedule automatic scans for better protection.",
      severity: "low" as const,
      icon: <Shield className="w-5 h-5 text-green-500" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Shield Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 pb-6">
            <ShieldIcon 
              status={shieldActive ? "active" : "inactive"}
              animation={shieldActive ? "pulse" : "none"}
              size={96}
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {shieldActive ? "Shield Active" : "Shield Inactive"}
              </h3>
              <p className="text-muted-foreground">
                {shieldActive 
                  ? "Your protection is enabled and active" 
                  : "Your protection is currently disabled"}
              </p>
            </div>
          </div>
          
          <SecurityLevel level={securityLevel} />
          
          <ShieldControls 
            initialStatus={shieldActive} 
            onStatusChange={handleShieldToggle} 
          />
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shield Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customize">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="customize" className="flex-1">Customize</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customize">
                <ShieldCustomizer />
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your shield settings here. Advanced settings will be available in a future update.
                  </p>
                  <div className="text-center py-8">
                    <ShieldIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Advanced settings coming soon</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <SecurityCard
                  key={index}
                  title={rec.title}
                  description={rec.description}
                  severity={rec.severity}
                  icon={rec.icon}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
