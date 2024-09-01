import { Router } from "express"
import {registerUser } from '../controllers/user.controller.js'
const router = Router()

// Change .get() to .post() since you're handling a registration (which typically involves POST requests)
router.route("/register").post(registerUser)

export default router
