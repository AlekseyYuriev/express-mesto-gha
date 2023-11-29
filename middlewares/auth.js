const jwt = require('jsonwebtoken');

const AuthorisationError = require('../errors/AuthorisationError');

const { JWT_SECRET = 'secret-key' } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorisationError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return next(new AuthorisationError('Необходима авторизация'));
  }

  req.user = payload;
  return next();
};
