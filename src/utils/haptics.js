export const haptic = (type = 'light') => {
  if (!window.navigator || !window.navigator.vibrate) return;
  
  switch (type) {
    case 'soft':
      window.navigator.vibrate(8);
      break;
    case 'light':
      window.navigator.vibrate(12);
      break;
    case 'medium':
      window.navigator.vibrate(50);
      break;
    case 'heavy':
      window.navigator.vibrate([50, 30, 50]);
      break;
    case 'error':
      window.navigator.vibrate([100, 50, 100]);
      break;
    default:
      window.navigator.vibrate(20);
  }
};
