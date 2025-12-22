// src/controllers/authController.js
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db.js'


const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'
const JWT_EXPIRE = '1d'

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, phone, email, password, usertype } = req.body

    if (!name || !phone || !email || !password || !usertype) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        usertype
      }
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usertype: user.usertype
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.usertype },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usertype: user.usertype
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}







