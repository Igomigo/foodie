import { Service } from "typedi";
import jwt from "jsonwebtoken";

@Service()
export class JwtService {
    private readonly secretKey: string;
    
    constructor() {
        this.secretKey = process.env.JWT_SECRET_KEY || "secret";
    }

    public async generateAccessToken(payload: any): Promise<string> {
        try {
            return jwt.sign(payload, this.secretKey, { expiresIn: "5m" });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async generateRefreshToken(payload: any): Promise<string> {
        try {
            return jwt.sign(payload, this.secretKey, { expiresIn: "7d" });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async verify(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}