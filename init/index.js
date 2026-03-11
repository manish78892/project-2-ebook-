const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const bookData = require('./bookdata.js');
const Book = require('../models/book.js');

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("Connection error:", err);
    }
}

const initDB = async () => {
    try {
        await Book.deleteMany({});
        console.log("Existing books deleted");

        await Book.insertMany(bookData.bookdata);
        console.log("Books inserted");

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

main().then(() => {
    initDB();
});