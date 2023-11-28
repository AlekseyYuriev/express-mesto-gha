const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const AuthorisationError = require('../errors/AuthorisationError');

const SOLT_ROUNDS = 10;

const MONGO_DUPLACATE_ERROR_CODE = 11000;

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return next(error);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Пользователь по id не найден');
    }
    return res.send(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new ValidationError('Ошибка валидации полей'));
    }

    return next(error);
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, SOLT_ROUNDS);
    let newUser = await User.create({
      name, about, avatar, email, password: hash,
    });
    newUser = newUser.toObject();
    delete newUser.password;
    return res.send(newUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new ValidationError('Ошибка валидации полей'));
    }

    if (error.code === MONGO_DUPLACATE_ERROR_CODE) {
      next(new ConflictError('Такой пользователь уже существует'));
    }

    return next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    return res.send(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new ValidationError('Ошибка валидации полей'));
    }

    return next(error);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const userAvatar = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    return res.send(userAvatar);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new ValidationError('Ошибка валидации полей'));
    }

    return next(error);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userLogin = await User.findOne({ email })
      .select('+password')
      .orFail(() => new Error('NotAutanticate'));

    if (!userLogin) {
      throw new AuthorisationError('Неверный email или пароль');
    }

    const matched = await bcrypt.compare(String(password), userLogin.password);
    if (!matched) {
      throw new AuthorisationError('Неверный email или пароль');
    }

    const token = jwt.sign({ _id: userLogin._id }, 'secret-key', { expiresIn: '7d' });

    return res.send({ token });
  } catch (error) {
    return next(error);
  }
};

module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Пользователь по id не найден');
    }

    return res.send(user);
  } catch (error) {
    return next(error);
  }
};
