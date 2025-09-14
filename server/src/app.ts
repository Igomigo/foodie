import "reflect-metadata";
import express from "express";
import { Service } from "typedi";
import morgan from "morgan";
import { BaseRoute } from "./base/base.route";
import { Db } from "./config/mongo";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AuthRoute } from "./auth/auth.route";
import { UserRoute } from "./user/user.route";
import { AIRoute } from "./ai/ai.route";

@Service()
export class App {
  private readonly apiVersion: string = "api/v1";
  private readonly port: number = process.env.PORT
    ? parseInt(process.env.PORT)
    : 2000;
  private readonly app: express.Application;

  constructor(
    private readonly baseRoute: BaseRoute,
    private readonly db: Db,
    private readonly authRoute: AuthRoute,
    private readonly userRoute: UserRoute,
    private readonly aiRoute: AIRoute
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
    const allowedOrigin = process.env.CLIENT_URL;
    this.app.use(
      cors({
        origin: allowedOrigin,
        credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }

  private initializeRoutes() {
    this.app.use(`/${this.apiVersion}`, this.baseRoute.router);
    this.app.use(`/${this.apiVersion}/auth`, this.authRoute.router);
    this.app.use(`/${this.apiVersion}/users`, this.userRoute.router);
    this.app.use(`/${this.apiVersion}/ai`, this.aiRoute.router);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }

  private async handleGracefulShutdown() {
    process.on("SIGINT", async () => {
      await this.db.disconnect();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      await this.db.disconnect();
      process.exit(0);
    });
  }
}
