import { validate } from './../../middleware/validate'
import { Router } from 'express'
import { authController } from './auth.controller'
import { LoginSchema, registerSchema } from '../../middleware/authValidator'
import passport from 'passport'
import { verifyToken } from '../../middleware/auth.middleware'

const router = Router()

router.post('/register', validate(registerSchema), authController.register.bind(authController))
router.post('/login', validate(LoginSchema), authController.login.bind(authController))
router.post('/logout', verifyToken, authController.logout.bind(authController))

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login', session: false }),
  (req, res) => authController.googleLogin(req, res)
)

export default router
