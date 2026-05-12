function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomNumberInRange(min, max) {
  const safeMin = Math.max(0, Number(min) || 0);
  const safeMax = Math.max(safeMin, Number(max) || safeMin);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

module.exports = {
  randomNumberInRange,
  sleep
};
