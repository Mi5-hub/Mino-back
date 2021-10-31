const express = require('express')
const router = express.Router()
const AuthController = require('../Controllers/Auth.Controller')

// All routes

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.post('/refresh-token', AuthController.refreshToken)

router.delete('/logout', AuthController.logout)

router.get('/getAll', AuthController.getAllUsers)

router.get('/getOne', AuthController.getOneUser)

router.put('/update', AuthController.UpdateUser)


module.exports = router
