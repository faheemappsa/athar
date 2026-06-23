export const tapHaptic = () => {
  try {
    if (navigator.vibrate) navigator.vibrate(8);
  } catch {}
};

export const successHaptic = () => {
  try {
    if (navigator.vibrate) navigator.vibrate([10, 25, 10]);
  } catch {}
};
