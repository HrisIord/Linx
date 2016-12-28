module.exports = {
  register: register,
  login: login
};

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function register(params) {
  var errorMsgs = [];

  if (params.username == null || params.username == "") {
    errorMsgs.push("Your username cannot be empty.");
  }

  if (params.password == null || params.password == "") {
    errorMsgs.push("Your password cannot be empty.");
  }

  if (params.email == null || params.email == "") {
    errorMsgs.push("Your email cannot be empty.");
  } else if (!isEmail(params.email)) {
    errorMsgs.push("This email is not valid.");
  }

  if (params.passwordConfirmation == null || params.passwordConfirmation == "") {
    errorMsgs.push("Your password confirmation cannot be empty.");
  } else if (params.password !== params.passwordConfirmation) {
    errorMsgs.push("Your password confirmation does not match.");
  }

  return errorMsgs;
}

function login(params) {
  var errorMsgs = [];

  if (params.username == null || params.username == "") {
    errorMsgs.push("Your username cannot be empty.");
  }

  if (params.password == null || params.password == "") {
    errorMsgs.push("Your password cannot be empty.");
  }

  return errorMsgs;
}