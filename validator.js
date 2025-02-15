const Joi = require('joi')

const registerValidator = Joi.object({
  full_name: Joi.string().required(),
  user_name: Joi.string().required(),
  password: Joi.string().min(4).required()
})

module.exports = {
  registerValidator
}
