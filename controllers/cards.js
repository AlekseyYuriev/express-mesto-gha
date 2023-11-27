const Card = require('../models/card');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    const newCard = new Card({ name, link, owner: ownerId });
    return res.send(await newCard.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Ошибка валидации полей' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId).populate('owner');

    if (!card) {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    const ownerId = card.owner.id;
    const userId = req.user._id;

    if (ownerId !== userId) {
      throw new Error('Нельзя удалять карточки других пользователей');
    }

    await Card.findByIdAndDelete(cardId);

    return res.send(card);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const likedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true },
    );

    if (!likedCard) {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    return res.send(likedCard);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const dislikedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    );

    if (!dislikedCard) {
      res.status(ERROR_CODE_NOT_FOUND);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    return res.send(dislikedCard);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION);
      return res.send({ message: 'Карточка с таким id не найдена' });
    }

    res.status(ERROR_CODE_SERVER_ERROR);
    return res.send({ message: 'Ошибка на стороне сервера' });
  }
};
