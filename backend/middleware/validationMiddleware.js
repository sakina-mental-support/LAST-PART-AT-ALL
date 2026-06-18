const Joi = require("joi");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((details) => details.message).join(", ");
            const err = new Error(errorMessage);
            err.statusCode = 400;
            return next(err);
        }
        next();
    };
};

module.exports = validateRequest;
