import mongoose from "mongoose";
import { Service } from "typedi";
import { Logger } from "../utils/logger";

@Service()
export class Db {
    constructor(private logger: Logger) {}

    public async connect() {
        const uri: any = process.env.MONGODB_URI;

        if (!uri) {
            this.logger.error("MONGO_URI is not defined", this);
            throw new Error("MONGO_URI is not defined");
        }

        try {
            await mongoose.connect(uri);
            this.logger.log("connected to database", this);
        } catch (error) {
            this.logger.error("failed to connect to database", this);
            process.exit(1);
        }
    }

    public async disconnect() {
        try {
            await mongoose.disconnect();
            this.logger.log("disconnected from database", this);
        } catch (error) {
            this.logger.error("failed to disconnect from database", this);
            process.exit(1);
        }
    }
}
