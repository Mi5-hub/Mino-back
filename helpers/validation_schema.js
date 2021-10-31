const Joi = require('@hapi/joi')

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  firstname: Joi.string().min(2).lowercase().required(),
  password: Joi.string().min(2).required()
})

module.exports = {
  authSchema,
}


