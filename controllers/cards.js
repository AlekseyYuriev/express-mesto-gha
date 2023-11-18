const Card = require('../models/card');

const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера", error: error.message });
  }
}

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    const newCard = await new Card({ name, link, owner: ownerId });
    return res.send(await newCard.save());
  } catch (error) {
    if(error.name === "ValidationError") {
      return res.status(ERROR_CODE_VALIDATION).send({ message: 'Ошибка валидации полей', ...error });
    }
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера", error: error.message });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    await Card.findByIdAndDelete(cardId);
    return res.send({ message: "Карточка удалена" });
  } catch (error) {
    if ((error.message === "NotFound")) {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: "Карточка с таким id не найдена" });
    }
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: "Ошибка на стороне сервера", error: error.message });
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const likedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true },
    )

    return res.send(likedCard);
  } catch (error) {
    if ((error.name === "CastError" || error.name === "ValidationError")) {
      return res.status(ERROR_CODE_VALIDATION).send({ message: "Карточка с таким id не найдена", ...error });
    }

    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка', error });
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const dislikedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    return res.send(dislikedCard);
  } catch (error) {
    if ((error.message === "NotFound")) {
      return res.status(ERROR_CODE_NOT_FOUND).send({ message: "Карточка с таким id не найдена" });
    }
    return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};
