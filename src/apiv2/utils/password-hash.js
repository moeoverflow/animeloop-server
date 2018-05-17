const bcrypt = require('bcryptjs');

module.exports = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};
