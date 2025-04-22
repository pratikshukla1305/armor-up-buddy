
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Shield, Lock, Eye, Moon, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OfficerNavbar from '@/components/officer/OfficerNavbar';

const OfficerSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Example settings state
  const [settings, setSettings] = useState({
    notifications: {
      sosAlerts: true,
      kycVerifications: true,
      criminalTips: true,
      systemUpdates: false,
      emailNotifications: true,
      pushNotifications: true
    },
    privacy: {
      showBadgeNumber: true,
      showEmail: false,
      showPhoneNumber: false,
      twoFactorAuth: true
    },
    appearance: {
      darkMode: false,
      highContrast: false,
      largeText: false,
      notifications: {
        sound: true,
        vibration: true
      }
    }
  });

  const updateSettings = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    
    toast({
      title: "Settings Updated",
      description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  // For nested settings like notifications.sound
  const updateNestedSettings = (category, nestedCategory, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nestedCategory]: {
          ...prev[category][nestedCategory],
          [setting]: value
        }
      }
    }));
    
    toast({
      title: "Settings Updated",
      description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Officer Portal Settings</CardTitle>
            <CardDescription>Manage your notification preferences, privacy, and appearance settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Privacy & Security</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Appearance</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Alert Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">SOS Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts when citizens send emergency SOS signals</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.sosAlerts}
                        onCheckedChange={(value) => updateSettings('notifications', 'sosAlerts', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">KYC Verifications</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts for new identity verification requests</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.kycVerifications}
                        onCheckedChange={(value) => updateSettings('notifications', 'kycVerifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Criminal Tips</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts when users submit tips about criminal activity</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.criminalTips}
                        onCheckedChange={(value) => updateSettings('notifications', 'criminalTips', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">System Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications about system updates and maintenance</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.systemUpdates}
                        onCheckedChange={(value) => updateSettings('notifications', 'systemUpdates', value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(value) => updateSettings('notifications', 'emailNotifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on this device</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(value) => updateSettings('notifications', 'pushNotifications', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Badge Number</Label>
                        <p className="text-sm text-muted-foreground">Display your badge number to citizens using the platform</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showBadgeNumber}
                        onCheckedChange={(value) => updateSettings('privacy', 'showBadgeNumber', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Email</Label>
                        <p className="text-sm text-muted-foreground">Make your email address visible to citizens</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showEmail}
                        onCheckedChange={(value) => updateSettings('privacy', 'showEmail', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Phone Number</Label>
                        <p className="text-sm text-muted-foreground">Make your phone number visible to citizens</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.showPhoneNumber}
                        onCheckedChange={(value) => updateSettings('privacy', 'showPhoneNumber', value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require a second form of verification when signing in</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.twoFactorAuth}
                        onCheckedChange={(value) => updateSettings('privacy', 'twoFactorAuth', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Display</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Use dark theme throughout the application</p>
                      </div>
                      <Switch 
                        checked={settings.appearance.darkMode}
                        onCheckedChange={(value) => updateSettings('appearance', 'darkMode', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">High Contrast</Label>
                        <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                      </div>
                      <Switch 
                        checked={settings.appearance.highContrast}
                        onCheckedChange={(value) => updateSettings('appearance', 'highContrast', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Large Text</Label>
                        <p className="text-sm text-muted-foreground">Increase text size throughout the application</p>
                      </div>
                      <Switch 
                        checked={settings.appearance.largeText}
                        onCheckedChange={(value) => updateSettings('appearance', 'largeText', value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Sounds</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Sound Effects</Label>
                        <p className="text-sm text-muted-foreground">Play sound when new notifications arrive</p>
                      </div>
                      <Switch 
                        checked={settings.appearance.notifications.sound}
                        onCheckedChange={(value) => updateNestedSettings('appearance', 'notifications', 'sound', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Vibration</Label>
                        <p className="text-sm text-muted-foreground">Vibrate device when new notifications arrive</p>
                      </div>
                      <Switch 
                        checked={settings.appearance.notifications.vibration}
                        onCheckedChange={(value) => updateNestedSettings('appearance', 'notifications', 'vibration', value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OfficerSettings;
