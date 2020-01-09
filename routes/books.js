const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
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
  const allBooks = await Book.findAll(); //find every book and render the page with the books info
  var books = await Book.findAll({limit: 10}); //display on the page only the first 5
  res.render("./index", { books, allBooks });
}));

/*Get search results*/
router.post('/', asyncHandler(async (req, res) => {
  const search = req.body.search;
  const allBooks = await Book.findAll(); //find every book and render the page with the books info
  console.log(search)
  var options = {
    where: {
      [Op.or]:
        [
          {
            title: {
              [Op.substring]:search
            }
          },
          {
            author: {
              [Op.substring]:search
            }
          },
          {
            genre: {
              [Op.substring]:search
            }
          },
          {
            year: {
              [Op.substring]:search
            }
          },

      ]
    }
  };
  const books = await Book.findAll(options);
  res.render("./index", { books, allBooks:books });
}));


/* Get page*/
router.get('/page/:page', asyncHandler(async (req, res) => {
  const allBooks = await Book.findAll(); //find every book and render the page with the books info
  const pageNumber = req.params.page-1;
  const offset = pageNumber * 10;
  const books = await Book.findAll({limit: 10, offset: offset });
  if ( pageNumber <= (allBooks.length/10) ) {
    res.render("./index", { books, allBooks });
  } else {
    res.sendStatus(404);
  }
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
      res.render("./new-book", { book, errors: error.errors })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }
  }
}));

/* GET individual book. Renders detail form*/
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); //find the id of the book that matches the params.id
 if(book) {
   res.render("./update-book", { book });
 } else {
   res.sendStatus(404);
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
      res.render("./update-book", { book, errors: error.errors  })
    } else {
      throw error; // error caught in the asyncHandler's catch block
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
