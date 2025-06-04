const User   = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')

async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required.' })
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await User.create({ name, email, password: hashed })

    return res.status(201).json({ message: 'User created', userId: user._id })
  } catch (err) {
    console.error('Register Error:', err)
    return res.status(500).json({ message: 'Server error, check logs for details.' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.json({ token })
  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ message: 'Server error, check logs for details.' })
  }
}

async function dashboard(req, res) {
  try {
    // `req.userId` was set by authMiddleware
    const user = await User.findById(req.userId).select('-password')
    return res.json({ data: user })
  } catch (err) {
    console.error('Dashboard Error:', err)
    return res.status(401).json({ message: 'Token invalid' })
  }
}

module.exports = { register, login, dashboard }
