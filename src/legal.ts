import './style.css';
import './legal.css';

const network = document.getElementById('network-status');
if (network) network.textContent = navigator.onLine ? 'Offline ready' : 'You are offline';

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
