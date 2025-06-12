import { Response } from "express";

interface IApiResponse {
    success: boolean,
    message: string,
    data?: any,
    errors?: any
};

export const response = (res: Response, status: number, data: IApiResponse) => {
    return res.status(status).json(data);
}