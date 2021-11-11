const Joi = require('@hapi/joi')

const authSchema = Joi.object({
  email: Joi.string().email().lowercase(),
  firstname: Joi.string().min(2).lowercase(),
  lastname: Joi.string().min(2).lowercase(),
  datenaissance: Joi.string().lowercase(),
  sexe: Joi.string().min(2).lowercase(),
  password: Joi.string().min(2).required()
})

module.exports = {
  authSchema,
}


