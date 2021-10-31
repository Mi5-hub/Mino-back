const createError = require('http-errors')
const User = require('../Models/User.model')
const { authSchema } = require('../helpers/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_helper')
const client = require('../helpers/init_redis')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body
      // if (!email || !password) throw createError.BadRequest()
      const result = await authSchema.validateAsync(req.body)

      const doesExist = await User.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`L'email ${result.email} est déjà utilisé`)

      const user = new User(result)
      const savedUser = await user.save()
      const accessToken = await signAccessToken(savedUser.id)
      const refreshToken = await signRefreshToken(savedUser.id)

      res.send({ 
        error:false,
        message: "L'utilisateur a bien été créé avec succès",
        tokens:{
          token:accessToken,
          refreshtoken:refreshToken,
          createdAt: Date.now()
        }
       })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body)
      const user = await User.findOne({ email: result.email })
      if (!user) throw createError.NotFound('utilisateur non identifié')

      const isMatch = await user.isValidPassword(result.password)
      if (!isMatch)
        throw createError.Unauthorized("votre nom d'utilisateur/password est erroné")

      const accessToken = await signAccessToken(user.id)
      const refreshToken = await signRefreshToken(user.id)

      res.send({ accessToken, refreshToken })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("nom d'utililisateur/Password invalidé"))
      next(error)
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)

      const accessToken = await signAccessToken(userId)
      const refToken = await signRefreshToken(userId)
      res.send({ accessToken: accessToken, refreshToken: refToken })
    } catch (error) {
      next(error)
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message)
          throw createError.InternalServerError()
        }
        console.log(val)
        res.sendStatus(204)
      })
    } catch (error) {
      next(error)
    }
  },
}



exports.getAllUsers = async (req, res) => {
  try{Date.now()
      await User.find({}, (err, data)=>{
          if(err) res.status(400).json("Erreur de chargement");
          res.status(200).json(data)
      });
  }catch(err){
      res.send({status: 500, message: "Data vide"})
  }
}

exports.getOneUser = async (req, res) => {
  try{

      const validation = jwt.verify(req.headers.token, process.env.jWT_KEY);
      !validation && res.status(401).json({
          error:true,
          message:"Le token envoyé n'est pas valide"
      })

      const user = await User.findById(req.params.id);
      const { password, ...others} = user._doc;
      // res.status(200).json(others);

      res.status(200).json({
          error: false,
          user:others
      })
  }catch(err){
      res.send({status: 500, message: "Cette user n'existe pas"})
  }
}

exports.UpdateUser = async (req, res) => {
  if(req.body.userId === req.params.id){
      if(req.body.password){
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      try{
          const updateUser = await User.findByIdAndUpdate(req.params.id, {
              $set: req.body,
          }, {new: true})
          res.status(200).json({
              error:false,
              message:"L'utilisateur a été modifié avec succès"
          });
      }catch(err){
          res.send({status: 500, message: "err"})
      }
  }else{
      res.send({status: 400, message: "Vous pouvez seulement modifier votre profile!"});
  }
  
}
