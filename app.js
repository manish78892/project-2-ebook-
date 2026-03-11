require("dotenv").config();

const express = require("express");
const app = express();
const port = 7889;

const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Book = require("./models/book");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { bookSchema } = require("./schema");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");

const userRoutes = require("./routes/user");
const booksRoutes = require("./routes/book");
const adminRoutes = require("./routes/admin");

app.use(methodOverride("_method"));

/* ======================
   MongoDB Connection
====================== */

const MONGO_URL = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log(err);
  });

/* ======================
   Express Setup
====================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/* ======================
   Session Config
====================== */

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

/* ======================
   Passport Auth
====================== */

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ======================
   Flash + User Middleware
====================== */

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/* ======================
   Routes
====================== */

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const books = await Book.find().sort({ createdAt: -1 }).limit(6);
    res.render("BOOKS/home", { books });
  })
);

app.use("/admin", adminRoutes);
app.use("/books", booksRoutes);
app.use("/", userRoutes);

/* ======================
   404 Error
====================== */

app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

/* ======================
   Global Error Handler
====================== */

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

/* ======================
   Server Start
====================== */

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});