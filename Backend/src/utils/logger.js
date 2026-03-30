// Logger simple con timestamp, nivel y formato consistente
// Niveles: info, warn, error, debug

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

// En producción omitir debug; en desarrollo mostrar todo
const MIN_LEVEL = process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug

function timestamp() {
  return new Date().toISOString()
}

function format(level, message, meta) {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`
  if (!meta || Object.keys(meta).length === 0) return base
  try {
    return `${base} ${JSON.stringify(meta)}`
  } catch {
    return base
  }
}

function log(level, message, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return

  const output = format(level, message, meta)

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info:  (message, meta) => log('info',  message, meta),
  warn:  (message, meta) => log('warn',  message, meta),
  error: (message, meta) => log('error', message, meta),
}

module.exports = logger
