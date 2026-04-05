const formatMeta = (meta = {}) => {
  const entries = Object.entries(meta).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return '';
  }

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
};

const logInfo = (message, meta = {}) => {
  process.stdout.write(`[${new Date().toISOString()}] INFO: ${message}${formatMeta(meta)}\n`);
};

const logError = (message, meta = {}) => {
  process.stderr.write(`[${new Date().toISOString()}] ERROR: ${message}${formatMeta(meta)}\n`);
};

module.exports = {
  logInfo,
  logError,
};
