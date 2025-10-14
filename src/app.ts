import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import session from 'express-session'
import passport from './utils/passport'
import cookieParser from 'cookie-parser'
import userRoutes from './modules/user/user.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use(cookieParser())


app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)


export default app
