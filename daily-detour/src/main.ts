import './styles/main.css';
import { App } from './ui/app';

const host = document.getElementById('app');
if (host) new App(host);
