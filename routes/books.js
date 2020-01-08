const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}


/* GET books listing. Home Route redirects to /books route (index.js) and shows full list of books */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll(); //find every book and render the page with the books info
  res.render("./index", { books });
}));

/* Add a new book. just the render of the page */
router.get('/new', (req, res) => {
  res.render("./new-book");
});

/* POST Add book. create a book with the body of the request and post it*/
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking if the error is a sequelize error
      book = await Book.build(req.body);
      res.render("./new-book", { book, errors: error.errors})
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }
  }
}));

/* GET individual book. Renders detail form*/
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); //find the id of the book that matches the params.id
 if(book) {
   res.render("./book-detail", { book });
 } else {
   res.sendStatus(404); //If the id doesn't exist the page will display 404 error
 }
}));

/* Update the book info to the database. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("./book-detail", { book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
}));

/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
}));

module.exports = router;
