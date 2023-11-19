const User = require('../models/user');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера', ...error });
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
    return res.send({ message: 'Ошибка на стороне сервера', ...error });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const newUser = new User({ name, about, avatar });
    return res.send(await newUser.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Ошибка валидации полей', ...error });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера', ...error });
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
      return res.send({ message: 'Ошибка валидации полей', ...error });
    }

    if (error.message === 'NotFound') {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Пользователь по id не найден' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера', ...error });
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
      return res.send({ message: 'Ошибка валидации полей', ...error });
    }

    if (error.message === 'NotFound') {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Пользователь по id не найден' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера', ...error });
  }
};
