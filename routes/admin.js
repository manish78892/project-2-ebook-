const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const User = require("../models/user");
const { isLoggedIn, isAdmin } = require("../middleware");

// Admin Dashboard
router.get("/dashboard", isLoggedIn, isAdmin, async (req, res) => {
    const books = await Book.find().sort({ createdAt: -1 });
    const users = await User.find();

    res.render("admin/dashboard", {
        books,
        users
    });
});

module.exports = router;