'use strict'

const { Writable } = require('readable-stream')
const fastify = require('fastify')
const pino = require('pino')
const target = require('../src')

const HOUR = 20
const TIME = `2017-02-14 ${HOUR}:51:48.000+0800`
const EPOCH = 1487076708000
const TIMEZONE_OFFSET = -8 * 60
const MESSAGE_KEY = 'message'

const pinoFactory = (opts) => {
  const level = opts.minimumLevel || 'info'

  return pino(
    { level },
    target({
      colorize: false,
      ...opts
    })
  )
}

const serverFactory = (messages, opts, fastifyOpts) => {
  const destination = new Writable({
    write (chunk, enc, cb) {
      messages.push(chunk.toString())

      process.nextTick(cb)
    }
  })

  const pino = pinoFactory({ destination, ...opts })

  return fastify({
    logger: pino,
    ...fastifyOpts
  })
}

const mockTime = () => {
  Date.originalNow = Date.now
  Date.now = () => EPOCH

  // eslint-disable-next-line
  Date.prototype.originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
  // eslint-disable-next-line
  Date.prototype.getTimezoneOffset = () => TIMEZONE_OFFSET;

  // eslint-disable-next-line
  Date.prototype.getHours = Date.prototype.getHours
  // eslint-disable-next-line
  Date.prototype.getHours = () => HOUR;
}

const unmockTime = () => {
  Date.now = Date.originalNow
  // eslint-disable-next-line
  Date.prototype.getTimezoneOffset = Date.prototype.originalGetTimezoneOffset
  // eslint-disable-next-line
  Date.prototype.getHours = Date.prototype.originalGetHours

  delete Date.originalNow
  // eslint-disable-next-line
  delete Date.prototype.originalGetTimezoneOffset
  delete Date.prototype.originalGetHours
}

module.exports = {
  TIME,
  EPOCH,
  MESSAGE_KEY,
  TIMEZONE_OFFSET,
  pinoFactory,
  serverFactory,
  mockTime,
  unmockTime
}
