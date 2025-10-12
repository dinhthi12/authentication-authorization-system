import debug from 'debug'

export const logApp = debug('app:main')
export const logAuth = debug('app:auth')
export const logUser = debug('app:user')
export const logDB = debug('app:db')
export const logMiddleware = debug('app:middleware')

export const createLogger = (namespace: string) => debug(`app:${namespace}`)
