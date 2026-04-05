const formatMeta = (meta = {}) => {
  const entries = Object.entries(meta).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return '';
  }

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
};

const logInfo = (message, meta = {}) => {
  console.log(`[${new Date().toISOString()}] INFO: ${message}${formatMeta(meta)}`);
};

const logError = (message, meta = {}) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}${formatMeta(meta)}`);
};

module.exports = {
  logInfo,
  logError,
};
