
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.af8e0851c6d245fb8674f364ff0aa133',
  appName: 'secure-report-evolve-now',
  webDir: 'dist',
  server: {
    url: 'https://af8e0851-c6d2-45fb-8674-f364ff0aa133.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;

