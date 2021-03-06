const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  firstname: {
    type: String,
    default: "",
    unique: false
  },
  lastname: {
    type: String,
    default: "",
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  datenaissance: {
    type:String,
    default:"",

  },
  password: {
    type: String,
    required: true
  },
  sexe: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
})

UserSchema.pre('save', async function (next) {
  try {

    if (this.isNew) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(this.password, salt)
      this.password = hashedPassword
    }
    next()
  } catch (error) {
    next(error)
  }
})

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) {
    throw error
  }
}

const User = mongoose.model('user', UserSchema)
module.exports = User
