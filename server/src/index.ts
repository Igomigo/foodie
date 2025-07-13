import "reflect-metadata";
import { config } from "dotenv";
import Container from "typedi";
import { App } from "./app";
import { initModels } from "./config/models";


const bootstrap = () => {
    config(); // Load environment variables
    initModels(); // Initialize discriminators
    const app = Container.get(App); // Get the app instance
    app.start(); // Start the app
}

bootstrap();
