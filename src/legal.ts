import './style.css';
import './legal.css';

const network = document.getElementById('network-status');
if (network) network.textContent = navigator.onLine ? 'Offline ready' : 'You are offline';

function announceRoute(): void {
  const heading = document.querySelector<HTMLHeadingElement>('h1[tabindex="-1"]');
  if (!heading) return;
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    const announcer = document.getElementById('route-announcer');
    if (announcer) announcer.textContent = heading.textContent ?? '';
  });
}

announceRoute();
window.addEventListener('pageshow', (event) => {
  if (event.persisted) announceRoute();
});

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
