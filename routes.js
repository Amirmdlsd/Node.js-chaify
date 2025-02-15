const { Router } = require('express')
const { registerValidator } = require('./validator')
const bcrypt = require('bcrypt')
const DbController = require('./db')
const router = Router()

router.post('/register', async (req, res) => {
  const { full_name, user_name } = req.body
  const salt = await bcrypt.genSalt(10)
  const { error, value } = registerValidator.validate(req.body)

  if (error) {
    return res.status(400).json({
      error: error.details[0].message
    })
  }
  const password = await bcrypt.hash(req.body.password, salt)

  const data = await DbController.create({ full_name, user_name, password })
  if (!data.success) {
    return res.status(400).json({ data })
  }else{
    return res.status(200).json({
        message: 'user registered',
        data
      })
  }

})
module.exports = router
