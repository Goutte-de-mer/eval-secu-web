const { body, validationResult } = require("express-validator");

const contactValidations = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Le message doit contenir entre 1 et 1000 caractères")
    .notEmpty()
    .withMessage("Le message ne peut pas être vide")
    .escape(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.validationErrors = errors.array();
    return res.redirect("/contact");
  }
  next();
};

module.exports = {
  contactValidations,
  handleValidationErrors,
};
