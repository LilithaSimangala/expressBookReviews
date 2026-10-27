const axios = require("axios");

const API_URL = "http://localhost:5000";

// Async function using a callback to retrieve all books
async function getAllBooks(callback) {
  try {
    const response = await axios.get(API_URL);
    callback(null, response.data);
  } catch (error) {
    callback(error, null);
  }
}

// Promise-based searches
function getBookByISBN(isbn) {
  return axios
    .get(`${API_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data);
}

function getBooksByAuthor(author) {
  return axios
    .get(`${API_URL}/author/${encodeURIComponent(author)}`)
    .then((response) => response.data);
}

function getBooksByTitle(title) {
  return axios
    .get(`${API_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => response.data);
}

// Run examples when this file is executed directly
if (require.main === module) {
  getAllBooks((error, books) => {
    if (error) {
      console.error("Could not retrieve books:", error.message);
      return;
    }

    console.log("All books:", books);
  });

  getBookByISBN("1")
    .then((book) => console.log("Book by ISBN:", book))
    .catch((error) => console.error(error.message));

  getBooksByAuthor("Chinua Achebe")
    .then((books) => console.log("Books by author:", books))
    .catch((error) => console.error(error.message));

  getBooksByTitle("Pride and Prejudice")
    .then((books) => console.log("Books by title:", books))
    .catch((error) => console.error(error.message));
}

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle,
};