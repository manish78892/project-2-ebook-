const express = require('express');
const app = express();
const port = 7889;
const mongoose = require('mongoose');
const path = require('path');
const multer = require("multer");
const Book = require('./models/book');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { bookSchema } = require('./schema');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/book');
const adminRoutes = require("./routes/admin");

const MONGO_URL = 'mongodb://127.0.0.1:27017/ebook';

main()
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.error(err);clear

});
async function main (){
    await mongoose.connect(MONGO_URL);
}

// MIDDLEWARE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));



// Session configuration
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: false,  
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};


app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
// Flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', wrapAsync(async (req, res) => {
    const books = await Book.find().sort({ createdAt: -1 }).limit(6);
    res.render('BOOKS/home', { books });
}));

app.use("/admin", adminRoutes);
app.use("/books", booksRoutes);
app.use("/", userRoutes);


// 404 handler
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error handling middleware
app.use((err, req, res, next ) => {
  let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).send(message);
});
// PORT
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
