const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/mestodb")
  .then(() => console.log("MongoDB in process"))
  .catch((err) => console.error('Error connecting to MongoDB:', err))

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
