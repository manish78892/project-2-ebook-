const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    pages: {
        type: Number,
        min: 1
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },

    // VERY IMPORTANT
    filePath: {
        type: String,
        required: true
    },

    coverImage: {
        type: String,
        default: "/images/cover.jpg",
        set: (v) => v === "" ? "/images/cover.jpg" : v,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;