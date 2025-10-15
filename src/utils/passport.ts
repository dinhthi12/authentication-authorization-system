import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from '../config'
import { authService } from '../modules/auth/auth.service'

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.googleClientId!,
      clientSecret: config.oauth.googleClientSecret!,
      callbackURL: 'http://localhost:4000/api/v1/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { user, accessToken: jwtToken, refreshToken: jwtRefresh } = await authService.loginWithGoogle(profile)
        return done(null, { ...user, accessToken: jwtToken, refreshToken: jwtRefresh })
      } catch (error) {
        console.error('Google OAuth Error:', error)
        return done(error, undefined)
      }
    }
  )
)

export default passport
