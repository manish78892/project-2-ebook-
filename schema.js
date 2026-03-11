const Joi = require('joi');

module.exports.bookSchema = Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    genre: Joi.string().trim(),
    pages: Joi.number().integer().min(1),
    rating: Joi.number().min(0).max(5),
    coverImage: Joi.string().uri().allow(''),
    filePath: Joi.string().required()
});