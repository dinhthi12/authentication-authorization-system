import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import { registerSchema } from './middleware/authValidator'
import { validate } from './middleware/validate'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', validate(registerSchema), authRoutes)

export default app
