const express = require('express')
const router = express.Router()
const {verifyToken, authorizeRoles} = require('../middleware/authMiddleware')


router.get('/dashboard', verifyToken, authorizeRoles('vendor', 'superadmin'),(req,res) =>{
  res.json({
    message: 'Welcome to vendor dashboard',
    user: req.user,
  })
})

module.exports = router