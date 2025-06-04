const express = require('express')
const router  = express.Router()

const { register, login, dashboard } = require('../controllers/authController')
const { protect }                   = require('../middleware/authMiddleware')

// POST /api/auth/register
router.post('/register', register)

// POST /api/auth/login
router.post('/login', login)

// GET /api/auth/dashboard  (protected)
router.get('/dashboard', protect, dashboard)

module.exports = router

