const mongoose = require('mongoose');
const bookData = require('./bookdata.js');
const Book = require('../models/book.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/ebook';

main()
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.error(err);
});
async function main (){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        await Book.deleteMany({});
        console.log('Existing books deleted');
        await Book.insertMany(bookData.bookdata);
        console.log('Books inserted');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

initDB();