const User = require('../models/user');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера", error: error.message });
  }
}

module.exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("NotFound");
    }
    res.send(user);
  } catch (error) {
    if ((error.message === "NotFound")) {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: "Пользователь по id не найден" });
    }

    if(error.name === "CastError") {
      return res.status(ERROR_CODE_VALIDATION).send({ message: "Передан не валидный id" });
    }

    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера" });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const newUser = await new User({ name, about, avatar });
    return res.send(await newUser.save());
  } catch (error) {
    if(error.name === "ValidationError") {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера" });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true });
    return res.send(await user);
  } catch (error) {
    if(error.name === "ValidationError") {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }

    if ((error.message === "NotFound")) {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: "Пользователь по id не найден" });
    }

    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера" });
  }
};

module.exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userAvatar = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true });
    return res.send(await userAvatar);
  } catch (error) {
    if(error.name === "ValidationError") {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }

    if ((error.message === "NotFound")) {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: "Пользователь по id не найден" });
    }

    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера" });
  }
};
