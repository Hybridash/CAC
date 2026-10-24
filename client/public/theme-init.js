// Sets the theme before first paint so dark mode never flashes light.
// A separate file (not inline) so the Content-Security-Policy can forbid inline scripts.
try {
  var t = localStorage.getItem('bioplay.theme');
  if (t !== 'light' && t !== 'dark') {
    t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = t;
} catch (e) {
  document.documentElement.dataset.theme = 'light';
}
