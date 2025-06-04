const jwt = require('jsonwebtoken')

function protect(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({ message: 'Token invalid or expired' })
  }
}

module.exports = { protect }
