function isUsername(username) {
  const pattern = /^[a-zA-Z0-9_-]{5,15}$/;
  return pattern.test(username);
}

function isPassword(password) {
  const pattern = /^\w{8,32}$/;
  return pattern.test(password);
}

function isEmail(email) {
  const pattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  return pattern.test(email);
}

module.exports = {
  isUsername,
  isPassword,
  isEmail,
};