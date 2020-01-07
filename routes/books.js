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

/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({order: [["createdAt", "DESC"]]});
  res.render("/index", { books, title: "Sequelize-It!" });
}));

/* Add a new book. */
router.get('/books/new', (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

/* POST Add book. */
router.post('/', asyncHandler(async (req, res) => {
  let book;
try {
  book = await Book.create(req.body);
  res.redirect("/books/new/" + book.id);
} catch (error) {
  if(error.name === "SequelizeValidationError") { // checking the error
    book = await Book.build(req.body);
    res.render("new-book", { book, errors: error.errors, title: "New Book" })
  } else {
    throw error; // error caught in the asyncHandler's catch block
  }
}
}));

/* GET individual book. */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
 if(book) {
   res.render("layout", { book, title: book.title });
 } else {
   res.sendStatus(404);
 }
}));

/* Update a book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("update-book", { book, errors: error.errors, title: "Edit Book" })
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
