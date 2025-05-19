import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { response } from "../interfaces/response";

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message.replace(/['"]/g, "")).join(", ");
            return response(res, 400, {
                success: false,
                message: 'validation error',
                errors: errorMessage
            });
        }

        next();
    }
}