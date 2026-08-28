if (location.pathname.replace(/\/$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1') {
  document.documentElement.classList.add('demo-boot');
}
