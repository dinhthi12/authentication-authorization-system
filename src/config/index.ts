import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'PORT'
]

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`)
  }
}

export const config = {
  app: {
    port: parseInt(process.env.PORT || '4000', 10)
  },

  db: {
    url: process.env.DATABASE_URL as string
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpire: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpire: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
}
