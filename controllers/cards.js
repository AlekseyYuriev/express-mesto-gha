const Card = require('../models/card');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const BanError = require('../errors/BanError');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return next(error);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    const newCard = new Card({ name, link, owner: ownerId });
    return res.send(await newCard.save());
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new ValidationError('Ошибка валидации полей'));
    }

    return next(error);
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId).populate('owner');

    if (!card) {
      throw new NotFoundError('Карточка с таким id не найдена');
    }

    const ownerId = card.owner.id;
    const userId = req.user._id;

    if (ownerId !== userId) {
      throw new BanError('Нельзя удалять карточки других пользователей');
    }

    await Card.findByIdAndDelete(cardId);

    return res.send(card);
  } catch (error) {
    return next(error);
  }
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const likedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true },
    );

    if (!likedCard) {
      throw new NotFoundError('Карточка с таким id не найдена');
    }

    return res.send(likedCard);
  } catch (error) {
    return next(error);
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const dislikedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    );

    if (!dislikedCard) {
      throw new NotFoundError('Карточка с таким id не найдена');
    }

    return res.send(dislikedCard);
  } catch (error) {
    return next(error);
  }
};
