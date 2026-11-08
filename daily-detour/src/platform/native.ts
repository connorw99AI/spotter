import { Capacitor } from '@capacitor/core';

/**
 * Native-only features. In a browser every function here is a no-op and
 * isNative() is false, so the interface never offers them there.
 */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

const REMINDER_ID = 1;

/** Schedule (or cancel) a daily local notification at `hour`:00 device time. Returns whether it is now on. */
export async function setDailyReminder(on: boolean, hour: number): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  if (!on) return false;
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;
  await LocalNotifications.schedule({
    notifications: [{
      id: REMINDER_ID,
      title: 'Today’s detour is ready',
      body: 'A new route through town is waiting. Missing a day is fine: one rest day never breaks your run.',
      schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
    }],
  });
  return true;
}

export async function nativeTap(strength: 'light' | 'medium' | 'heavy'): Promise<boolean> {
  if (!isNative()) return false;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  await Haptics.impact({ style: strength === 'light' ? ImpactStyle.Light : strength === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy });
  return true;
}

/** Android back button: go back through the game's screens, leave the app from the home screen. */
export async function wireBackButton(): Promise<void> {
  if (!isNative()) return;
  const { App } = await import('@capacitor/app');
  await App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && location.hash && location.hash !== '#town') history.back();
    else void App.exitApp();
  });
}
