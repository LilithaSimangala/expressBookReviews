const axios = require("axios");

const API_URL = "http://localhost:5000";

function normalizeBooks(data) {
  if (Array.isArray(data)) return data;

  return Object.entries(data || {}).map(([isbn, book]) => ({
    isbn,
    ...book,
  }));
}

function notFoundError(type, value) {
  const error = new Error(`${type} not found: ${value}`);
  error.code = "NOT_FOUND";
  return error;
}

// Async function with a callback to retrieve all books
async function getAllBooks(callback) {
  try {
    const response = await axios.get(API_URL);
    const books = normalizeBooks(response.data);
    callback(null, books);
    return books;
  } catch (error) {
    const message = new Error(`Could not retrieve books: ${error.message}`);
    callback(message, null);
    throw message;
  }
}

// Promise-based ISBN search
function getBookByISBN(isbn) {
  const value = String(isbn).trim();

  if (!value) {
    return Promise.reject(new Error("ISBN is required"));
  }

  return axios
    .get(`${API_URL}/isbn/${encodeURIComponent(value)}`)
    .then((response) => {
      if (!response.data || response.data.message === "Book not found") {
        throw notFoundError("Book", value);
      }

      return { isbn: value, ...response.data };
    })
    .catch((error) => {
      if (error.code === "NOT_FOUND") throw error;
      if (error.response?.status === 404) throw notFoundError("Book", value);
      throw new Error(`ISBN search failed: ${error.message}`);
    });
}

// Promise-based author search with explicit filtering
function getBooksByAuthor(author) {
  const value = author.trim();

  if (!value) {
    return Promise.reject(new Error("Author is required"));
  }

  return axios
    .get(`${API_URL}/author/${encodeURIComponent(value)}`)
    .then((response) => {
      const matches = normalizeBooks(response.data).filter(
        (book) => book.author?.toLowerCase() === value.toLowerCase()
      );

      if (matches.length === 0) throw notFoundError("Author", value);
      return matches;
    })
    .catch((error) => {
      if (error.code === "NOT_FOUND") throw error;
      if (error.response?.status === 404) throw notFoundError("Author", value);
      throw new Error(`Author search failed: ${error.message}`);
    });
}

// Promise-based title search with explicit filtering
function getBooksByTitle(title) {
  const value = title.trim();

  if (!value) {
    return Promise.reject(new Error("Title is required"));
  }

  return axios
    .get(`${API_URL}/title/${encodeURIComponent(value)}`)
    .then((response) => {
      const matches = normalizeBooks(response.data).filter(
        (book) => book.title?.toLowerCase().includes(value.toLowerCase())
      );

      if (matches.length === 0) throw notFoundError("Title", value);
      return matches;
    })
    .catch((error) => {
      if (error.code === "NOT_FOUND") throw error;
      if (error.response?.status === 404) throw notFoundError("Title", value);
      throw new Error(`Title search failed: ${error.message}`);
    });
}

if (require.main === module) {
  getAllBooks((error, books) => {
    if (error) console.error(error.message);
    else console.log("All books:", books);
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