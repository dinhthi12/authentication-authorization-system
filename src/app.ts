import { config } from './config'
import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import passport from './utils/passport'
import cookieParser from 'cookie-parser'
import userRoutes from './modules/user/user.routes'

const app = express()

app.use(cors({
  origin: config.url.clientUrl,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use(passport.initialize())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)

export default app
