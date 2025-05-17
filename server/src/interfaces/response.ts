import { Response } from "express";

interface IResponse {
    success: boolean,
    message: string,
    data?: any,
    errors?: any
};

export const response = (res: Response, status: number, data: IResponse) => {
    return res.status(status).json(data);
}