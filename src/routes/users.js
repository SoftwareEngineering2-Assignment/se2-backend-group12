const express = require('express');
const {validation, authorization} = require('../middlewares');
const {helpers: {jwtSign}} = require('../utilities/authentication');

const {mailer: {mail, send}} = require('../utilities');

const router = express.Router();

const User = require('../models/user');
const Reset = require('../models/reset');

async function createUser(req, res, next) {
  const {username, password, email} = req.body;
  try {
    const user = await User.findOne({$or: [{username}, {email}]});
    if (user) {
      return res.json({
        status: 409,
        message: 'Registration Error: A user with that e-mail or username already exists.'
      });
    }
    const newUser = await new User({
      username,
      password,
      email
    }).save();
    return res.json({success: true, id: newUser._id});
  } catch (error) {
    return next(error);
  }
}

async function authenticateUser(req, res, next) {
  const {username, password} = req.body;
  try {
    const user = await User.findOne({username}).select('+password');
    if (!user) {
      return res.json({
        status: 401,
        message: 'Authentication Error: User not found.'
      });
    }
    if (!user.comparePassword(password, user.password)) {
      return res.json({
        status: 401,
        message: 'Authentication Error: Password does not match!'
      });
    }
    return res.json({
      user: {
        username, 
        id: user._id, 
        email: user.email
      },
      token: jwtSign({username, id: user._id, email: user.email})
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  const {username} = req.body;
  try {
    const user = await User.findOne({username});
    if (!user) {
      return res.json({
        status: 404,
        message: 'Resource Error: User not found.'
      });
    }
    const token = jwtSign({username});
    await Reset.findOneAndRemove({username});
    await new Reset({
      username,
      token,
    }).save();

    const email = mail(token);
    send(user.email, 'Forgot Password', email);
    return res.json({
      ok: true,
      message: 'Forgot password e-mail sent.'
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next)  {
  const {password} = req.body;
  const {username} = req.decoded;
  try {
    const user = await User.findOne({username});
    if (!user) {
      return res.json({
        status: 404,
        message: 'Resource Error: User not found.'
      });
    }
    const reset = await Reset.findOneAndRemove({username});
    if (!reset) {
      return res.json({
        status: 410,
        message: ' Resource Error: Reset token has expired.'
      });
    }
    user.password = password;
    await user.save();
    return res.json({
      ok: true,
      message: 'Password was changed.'
    });
  } catch (error) {
    return next(error);
  }
}

router.post('/create',
  (req, res, next) => validation(req, res, next, 'register'), createUser);

router.post('/authenticate',
  (req, res, next) => validation(req, res, next, 'authenticate'),
  authenticateUser);

router.post('/resetpassword',
  (req, res, next) => validation(req, res, next, 'request'),
  resetPassword);

router.post('/changepassword',
  (req, res, next) => validation(req, res, next, 'change'),
  authorization, changePassword
  );

module.exports = router;
