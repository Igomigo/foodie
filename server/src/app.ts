import "reflect-metadata";
import express from 'express';
import { Service } from "typedi";
import morgan from 'morgan';
import { BaseRoute } from "./base/base.route";
import { Db } from "./config/mongo";
import cors from 'cors';
import helmet from "helmet";
import cookieParser from 'cookie-parser';
import { AuthRoute } from "./auth/auth.route";

@Service()
export class App {
    private readonly apiVersion: string = 'api/v1';
    private readonly port: number = process.env.PORT ? parseInt(process.env.PORT) : 2000;
    private readonly app: express.Application;

    constructor (
        private readonly baseRoute: BaseRoute,
        private readonly db: Db,
        private readonly authRoute: AuthRoute
    ) {
        this.app = express();
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.handleGracefulShutdown();
    }

    private async connectToDatabase() {
        this.db.connect();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morgan('dev'));
    }

    private initializeRoutes() {
        this.app.use(`/${this.apiVersion}`, this.baseRoute.router);
        this.app.use(`/${this.apiVersion}/auth`, this.authRoute.router);
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

    private async handleGracefulShutdown() {
        process.on('SIGINT', async () => {
            await this.db.disconnect();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.db.disconnect();
            process.exit(0);
        });
    }
}
