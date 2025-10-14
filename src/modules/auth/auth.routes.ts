import { validate } from './../../middleware/validate';
import { Router } from 'express'
import { authController } from './auth.controller'
import { LoginSchema, registerSchema } from '../../middleware/authValidator';
import passport from 'passport';

const router = Router()

router.post('/register', validate(registerSchema), authController.register)

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login' }),
  (req, res) => authController.googleLogin(req, res)
)

export default router
