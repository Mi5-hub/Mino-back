const Joi = require('@hapi/joi')

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  firstname: Joi.string().min(2).lowercase().required(),
  lastname: Joi.string().min(2).lowercase(),
  date_naissance: Joi.string().min(2).lowercase(),
  sexe: Joi.string().min(2).lowercase(),
  password: Joi.string().min(2).required()
})

module.exports = {
  authSchema,
}


