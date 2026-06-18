const Joi = require("joi");

const userRegistrationSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const moodSchema = Joi.object({
    moodLevel: Joi.number().min(1).max(5).required(),
    note: Joi.string().allow('', null).optional()
});

const surveySchema = Joi.object({
    favoriteActivities: Joi.array().items(Joi.string()).optional()
    // Add more fields depending on what a full survey contains
}).unknown(true); // Allow unknown for now if the survey has dynamic fields

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    moodSchema,
    surveySchema
};
