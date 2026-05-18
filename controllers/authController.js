const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
  return jwt.sign(
    {id: user._id, role: user.role},
    process.env.JWT_SECRET,
    { expriesIn: '5d'}
  )
}

const register = async(req,res) =>{
  try{
    const{name, email, password, role} = req.body

    const existingUser = await User.findOne({email})
    if(existingUser){
      return res.status(400).json({message:'Email already registered'})
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  }
  catch(error) {
    res.status(500).json({message:'Server error', error:error.message})
  }
}

const login = async (req,res) => {
    try{
      const{email,password} = req.body

      const user = await User.findOne({email})
      if(!user){
        return res.status(400).json({message: 'Invalid email'})
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if(!isMatch){
        return res.send(400).json({message: 'Invalid email or password'})
      }

      const token = generateToken(user)

      res.send(200).json({
        message: 'Login successful',
        token,
        user:{is: user_id, name: user.name, email: user.email, role: user.role}
      })
    }
    catch(error){
      res.status(500).json({message:'Server error',error:error.message})
    }
}

module.exports = {register,login}