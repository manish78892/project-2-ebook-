const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { bookSchema } = require('../schema');
const Book = require('../models/book');
const multer = require("multer");
const { isLoggedIn, isAdmin } = require('../middleware');


// MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/books");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});



// validation middleware
   const validationBook =  (req, res, next) => {
   let {error} = bookSchema.validate(req.body);
   if(error){ 
    let errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
   } else{
     next();
   }
   }

// INDEX: list all books

router.get('/',
  wrapAsync(async (req, res) => {

    const { search } = req.query;
    let books;

    if (search) {
      books = await Book.find({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } }
        ]
      }).sort({ createdAt: -1 });   // 🔥 Latest First
    } else {
      books = await Book.find().sort({ createdAt: -1 });  // 🔥 Latest First
    }

    res.render('BOOKS/index.ejs', { books });
  })
);

// CREATE: show form to create a new book
router.get('/new', isLoggedIn, isAdmin, (req, res) => {
    
    res.render('BOOKS/new.ejs');
});

// READ: Show redirect to the file path of the book
router.get('/:id/read', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const book = await Book.findById(id);
    res.render('BOOKS/show.ejs', { book });
}));

// CREATE: handle form submission to create a new book
router.post("/", isLoggedIn, isAdmin, upload.single("pdf"), 
wrapAsync(async (req, res, next) => {
  const { title, description, genre, pages, rating, coverImage } = req.body;
  const newBook = new Book({
    title,
    description,
    genre,
    pages,
    rating,
    coverImage,
    filePath: `/books/${req.file.filename}`
  });
    await newBook.save();
    req.flash('success', 'Book created successfully!');
  res.redirect("/books");
})
);

// EDIT: show form to edit an existing book
router.get('/:id/edit', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const book = await Book.findById(id);
    req.flash('success', 'Book Edit successfully!');
    res.render('BOOKS/edit.ejs', { book });
}));

// UPDATE: handle form submission to update an existing book
router.put('/:id', isLoggedIn, isAdmin, validationBook, upload.single("pdf"),
wrapAsync(async (req, res) => {
    let { id } = req.params;
    const { title, description, genre, pages, rating, coverImage } = req.body;
    const book = await Book.findById(id);
    book.title = title;
    book.description = description;
    book.genre = genre;
    book.pages = pages;
    book.rating = rating;
    book.coverImage = coverImage;
    if (req.file) {
        book.filePath = `/books/${req.file.filename}`;
    }
    await book.save();
    res.redirect(`/books/${id}/read`);
}));

// DELETE: handle form submission to delete an existing book
router.delete('/:id', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedBook = await Book.findByIdAndDelete(id);
    console.log('Deleted book:', deletedBook);
    req.flash('success', 'Book Delete successfully!');
    res.redirect('/books');
}));

module.exports = router; 