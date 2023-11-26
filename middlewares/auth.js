const jwt = require('jsonwebtoken');

const ERROR_CODE_UNAUTHORIZED = 401;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(ERROR_CODE_UNAUTHORIZED);
    return res.send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'secret-key');
  } catch (error) {
    res.status(ERROR_CODE_UNAUTHORIZED);
    return res.send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  next();
};
