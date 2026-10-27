const express = require("express");
const books = require("./booksdb.js");
const users = require("./auth_users.js").users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const usernameExists = users.some((user) => user.username === username);

  if (usernameExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  return res.json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book);
});

// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );

  return res.json(matches);
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.title.toLowerCase().includes(title)
  );

  return res.json(matches);
});

// Get book reviews
public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.json(book.reviews);
});

module.exports.general = public_users;