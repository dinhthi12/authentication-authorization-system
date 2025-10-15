import { Router } from 'express'
import { userController } from './user.controller'
import { verifyToken } from '../../middleware/auth.middleware'

const router = Router()

router.get('/me', verifyToken, userController.getMe.bind(userController))

export default router
