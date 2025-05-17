import mongoose from "mongoose";
import { Service } from "typedi";
import { Logger } from "../utils/logger";

@Service()
export class Db {
    constructor(private logger: Logger) {}

    public async connect() {
        const uri: any = process.env.MONGO_URI;
        if (!uri) {
            this.logger.error("[mongoDB] MONGO_URI is not defined");
            throw new Error("MONGO_URI is not defined");
        }

        try {
            await mongoose.connect(uri);
            this.logger.log("[mongoDB] connected to database");
        } catch (error) {
            this.logger.error("[mongoDB] failed to connect to database");
            process.exit(1);
        }
    }

    public async disconnect() {
        try {
            await mongoose.disconnect();
            this.logger.log("[mongoDB] disconnected from database");
        } catch (error) {
            this.logger.error("[mongoDB] failed to disconnect from database");
            process.exit(1);
        }
    }
}
