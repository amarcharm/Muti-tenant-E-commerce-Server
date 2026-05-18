const express = require('express')
const router = express.Router()
const {verifyToken, authorizeRoles} = require('../middleware/authMiddleware')


router.get('/dashboard', verifyToken, authorizeRoles('superadmin'),(req,res) => {
  res.json({
    message: 'Welcome to admin dashboard',
    user: req.user,
  })
})

module.exports = router