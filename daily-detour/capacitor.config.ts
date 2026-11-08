import type { CapacitorConfig } from '@capacitor/cli';

// Change appId to a reverse-domain name you own before submitting to the stores.
const config: CapacitorConfig = {
  appId: 'app.dailydetour.game',
  appName: 'The Daily Detour',
  webDir: 'dist',
  backgroundColor: '#FBF4E4',
  ios: { contentInset: 'never' },
  android: { backgroundColor: '#FBF4E4' },
  plugins: {
    LocalNotifications: { smallIcon: 'ic_stat_detour', iconColor: '#2F5D46' },
  },
};

export default config;
