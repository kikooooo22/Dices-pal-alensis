export const formatNumber = (num: number): string => {
  const floored = Math.floor(num);
  if (floored >= 1e9) return (floored / 1e9).toFixed(2) + 'B';
  if (floored >= 1e6) return (floored / 1e6).toFixed(2) + 'M';
  return floored.toLocaleString('en-US');
};
