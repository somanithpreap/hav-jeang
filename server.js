// server.js
import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './src/config/db.js'
import router from './src/routes/authenroutes.js'

dotenv.config()

const app = express()

app.use(express.json())

// Routes
app.use('/api/auth', router)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}
console.log('Server now:', new Date())


startServer()
