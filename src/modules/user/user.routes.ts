import { Router } from 'express'
import { userController } from './user.controller'
import { authenticateJWT } from '../../middleware/auth.middleware'

const router = Router()

router.get('/me', authenticateJWT, userController.getMe.bind(userController))


export default router
