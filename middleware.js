// middleware.js

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    // check if user exists AND role is admin
    if (!req.user || req.user.role !== 'admin') {
        req.flash('error', 'Access Denied! Admin only.');
        return res.redirect('/books');
    }
    next();
};
