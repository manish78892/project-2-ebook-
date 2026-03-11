const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');


router.get('/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/signup', wrapAsync(async (req, res) => {
    console.log("hitting");

    try {
        const { username, email, password } = req.body;
        console.log(req.body);

        let role = 'user';

const userCount = await User.countDocuments();

if (userCount === 0) {
    role = 'admin'; // first registered user becomes admin
}

const newUser = new User({ username, email, role });

        console.log('Creating user:', newUser);

        // 🔥 Instead of User.register()
        await newUser.setPassword(password);
        await newUser.save();

        console.log('User saved:', newUser);

        req.login(newUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the ebooks world!');
            res.redirect('/login');
        });

    } catch (e) {
        console.log("Signup Error:", e);

        // 🔥 Check if duplicate username
        if (e.name === 'UserExistsError') {
            req.flash('error', 'Username already registered');
        } 
        // 🔥 Check duplicate email
        else if (e.code === 11000) {
            req.flash('error', 'Email already registered');
        } 
        else {
            req.flash('error', e.message);
        }

        res.redirect('/signup');
    }
}));


router.get('/login', (req,  res) => { 
    res.render('users/login');
});
 
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), 
wrapAsync(async (req, res) => {
    req.flash('success', 'welcome back!');
    res.redirect('/books');
}));

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/login');
    });
});

module.exports = router;