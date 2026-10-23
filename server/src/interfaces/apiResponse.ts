import { Response } from "express";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string | null;
}

export function response(res: Response, status: number, data: ApiResponse) {
  res.status(status).json(data);
}
