const Joi = require("joi");

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(40).required().email(),
    password: Joi.string().min(8).max(50).required(),
  });

  return schema.validate(data);
};

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).max(30).required(),
    email: Joi.string().min(6).max(40).required().email(),
    password: Joi.string().min(8).max(50).required(),
    role: Joi.string().required().valid("customer", "restaurateur"),
  });

  return schema.validate(data);
};
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
