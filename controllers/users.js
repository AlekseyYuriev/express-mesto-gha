const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const SOLT_ROUNDS = 10;

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;
const ERROR_CODE_UNAUTHORIZED = 401;
const MONGO_DUPLACATE_ERROR_CODE = 11000;
const ERROR_CODE_CONFLICT_CODE = 409;

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('NotFound');
    }
    return res.send(user);
  } catch (error) {
    if (error.message === 'NotFound') {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Пользователь по id не найден' });
    }

    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Передан не валидный id' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, SOLT_ROUNDS);
    const newUser = new User({
      name, about, avatar, email, password: hash,
    });
    return res.send(await newUser.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Ошибка валидации полей' });
    }

    if (error.code === MONGO_DUPLACATE_ERROR_CODE) {
      res.status(ERROR_CODE_CONFLICT_CODE);
      return res.send({ message: 'Такой пользователь уже существует' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.updateUser = async (req, res) => {
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
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Ошибка валидации полей' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.updateAvatar = async (req, res) => {
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
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Ошибка валидации полей' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userLogin = await User.findOne({ email })
      .select('+password')
      .orFail(() => new Error('NotAutanticate'));

    if (!userLogin) {
      throw new Error('NotAutanticate');
    }

    const matched = await bcrypt.compare(String(password), userLogin.password);
    if (!matched) {
      throw new Error('NotAutanticate');
    }

    const token = jwt.sign({ _id: userLogin._id }, 'secret-key', { expiresIn: '7d' });

    return res.send({ token });
  } catch (error) {
    if (error.message === 'NotAutanticate') {
      res.status(ERROR_CODE_UNAUTHORIZED);
      return res.send({ message: 'Неправильные email или password' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('NotFound');
    }

    return res.send(user);
  } catch (error) {
    if (error.message === 'NotFound') {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Пользователь по id не найден' });
    }

    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Передан не валидный id' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};
