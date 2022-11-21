const express = require('express');
const router = express.Router();
const User = require('../models/user')
const catchAsync = require("../utils/catchAsync")
const passport = require('passport');
const users = require('../controllers/users')
const {checkRetunTo} = require('../middleware')



router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(checkRetunTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;