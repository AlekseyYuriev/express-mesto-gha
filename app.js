const express = require('express');
const dotenv = require('dotenv');
const { celebrate, Joi, errors } = require('celebrate');
const json = require('express').json();
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');
const NotFoundError = require('./errors/NotFoundError');

dotenv.config();

const app = express();

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB in process'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(json);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/https?:\/\/(www)?[0-9a-z\-._~:/?#[\]@!$&'()*+,;=]+#?$/i),
  }),
}), createUser);

app.use(auth);

app.use(userRouter);
app.use(cardRouter);

app.all('*', (req, res, next) => {
  next(new NotFoundError('Неверный адрес запроса'));
});

app.use(errors());

app.use(handleError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
