const {Router} = require('express')
const {registerValidator} = require('./validator')
const bcrypt = require('bcrypt')
const DbController = require('./db')

const router = Router()

const AuthController = require('./controller')
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)

module.exports = router
