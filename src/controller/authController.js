// src/controllers/authController.js
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db.js'
import nodemailer from 'nodemailer'

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

// ================= FORGOT PASSWORD =================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Generate token and expiry
    const resetToken = Math.random().toString(36).substring(2, 12)
    const expire = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save token in DB
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpire: expire }
    })

    // Build password reset URL
    const resetUrl = `${process.env.FRONTEND_URL}?token=${resetToken}&email=${email}`

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    console.log(resetToken);
    // Send email
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password (valid for 15 minutes):</p>
             <a href="${resetUrl}">${resetUrl}</a>`
    })

    res.json({ message: 'Reset link sent to your email' });
   
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid token' })
    }

    if (user.resetTokenExpire < new Date()) {
      return res.status(400).json({ message: 'Token expired' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpire: null
      }
    })

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
