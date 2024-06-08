const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../db');
const bcrypt = require('bcrypt');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/redirect',
    scope: ['profile'],
    state: true
}, function verify(accessToken, refresToken, profile, cb) {
    console.log('authenticating with google sucessful');
    //vérifier si l'user existe ou non si non le créer
    db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', ['GOOGLE', profile.id], function (err, row) {
        if (err) { return cb(err); }
        //si l'user existe pas on le crée
        if (!row) {
            db.run('INSERT INTO users (name) VALUES (?)', [profile.displayName], function (err) {
                if (err) { return cb(err); }
                var id = this.lastID;
                db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [id, 'GOOGLE', profile.id], function (err) {
                    if (err) { return cb(err); }
                    var user = {id: id, name: profile.displayName}
                    return cb(null, user);
                })
            });
            //si l'user existe
        } else {
            db.get('SELECT * FROM users WHERE id = ?', [row.user_id], function (err, row) {
                if (err) { return cb(err); }
                if (!row) {return cb(null, false);}
                return cb(null, row);
            })
        }
    })
}));

//fonction qui va récupe la callback
// serialization = convertir en binaire
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, {id: user.id, username: user.username, name: user.name});
    })
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    })
})

const router = express.Router();
//quand il clique sur le lien login
router.get('/login', (req, res, next) => {
    res.render('login');
});

router.get('/register/without', (req, res, next) => {
    res.render('registerWithoutGoogle');
});

router.get('/login/without', (req, res, next) => {
    const messages = req.session.messages;
    req.session.messages = [];
    res.render('loginWithoutGoogle', {messages: messages});
});

router.post('/logout', (req, res, next) => {
    // vient de passport, logout détruit la session
    req.logout();
    res.redirect('/');
});

router.get('/login/federated/google', passport.authenticate('google', {scope: ['profile']}));

router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
});

router.post('/register/without', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        req.session.messages = ['Please enter both username and password.'];
        return res.redirect('/register/without');
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) { return next(err); }
        if (row) {
            req.session.messages = ['Username already exists.'];
            return res.redirect('/register/without');
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) { return next(err); }

            // Insert the new user into the database
            db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hash], function (err) {
                if (err) { return next(err); }

                // Log the user in
                req.login({id: this.lastID, username: username}, (err) => {
                    if (err) { return next(err); }
                    return res.redirect('/');
                });
            });
        });
    });
});

router.post('/login/without', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) { return next(err); }
        if (!row) {
            req.session.messages = ['Incorrect username.'];
            return res.redirect('/login/without');
        }

        bcrypt.compare(password, row.hashed_password, (err, result) => {
            if (err) { return next(err); }
            if (!result) {
                req.session.messages = ['Incorrect password.'];
                return res.redirect('/login/without');
            }

            req.login({id: row.id, username: row.username}, (err) => {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        });
    });
});

module.exports = router;