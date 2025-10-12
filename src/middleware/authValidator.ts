import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(1, { message: 'Name cannot be empty' }).optional()
})

export const LoginSchema = z.union([
  z.object({
    email: z.string().email({message: 'Invalid email'}),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
  }),
  z.object({
    provider: z.literal('google'),
    token: z.string()
  })
])

export const RefreshSchema = z.object({
  refreshToken: z.string()
})
