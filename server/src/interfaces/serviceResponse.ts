export interface serviceResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    error?: string;
}

