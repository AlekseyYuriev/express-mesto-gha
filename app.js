const express = require('express');
const json = require('express').json();
const mongoose = require('mongoose');
const userRouter = require('./routes/users');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/mestodb")
  .then(() => console.log("MongoDB in process"))
  .catch((err) => console.error('Error connecting to MongoDB:', err))

app.use(json);

app.use(userRouter);

app.use((req, res, next) => {
  req.user = {
    _id: '6558d7431e7891cd7e042d54'
  };

  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
