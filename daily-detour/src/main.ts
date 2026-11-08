import './styles/main.css';
import { wireBackButton } from './platform/native';
import { App } from './ui/app';

const host = document.getElementById('app');
if (host) new App(host);
void wireBackButton();

// Offline play: register the service worker in production builds served over http(s),
// but not when embedded in another page's frame.
const embedded = (() => { try { return window.self !== window.top; } catch { return true; } })();
if (import.meta.env.PROD && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !embedded) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* offline play unavailable */ });
}

// Show the map's focus ring only to keyboard users; a tap or click hides it again.
window.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) document.documentElement.classList.add('kbd'); }, true);
window.addEventListener('pointerdown', () => document.documentElement.classList.remove('kbd'), true);
