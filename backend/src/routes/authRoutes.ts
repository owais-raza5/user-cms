import { Router } from 'express'
import {
  register,
  login,
  refresh,
  logout,
  profile,
} from '../controllers/authController'
import { authenticate } from '../middleware/authenticate'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)

router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, profile)

export default router
