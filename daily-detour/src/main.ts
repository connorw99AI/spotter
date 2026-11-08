import './styles/main.css';
import { App } from './ui/app';

const host = document.getElementById('app');
if (host) new App(host);

// Show the map's focus ring only to keyboard users; a tap or click hides it again.
addEventListener('keydown', (e) => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) document.documentElement.classList.add('kbd'); }, true);
addEventListener('pointerdown', () => document.documentElement.classList.remove('kbd'), true);
