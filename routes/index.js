const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const db = require('../db');

const ensureLoggedIn = ensureLogIn();

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    //même objet user que dans le deserializeUser
    if (!req.user) {return res.render('home');}
    //middleware suivant
    next();
}, function (req, res, next) {
    res.locals.filter = null;
    res.render('index', {user: req.user});
})

router.post('/', ensureLoggedIn, function (req, res, next) {
    req.body.title = req.body.title.trim();
    next();
}, function (req, res, next) {
    if (req.body.title !== '') { return next(); }
    return res.redirect('/' + (req.body.filter || ''));
})

module.exports = router;
