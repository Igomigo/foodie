import "reflect-metadata";
import { config } from "dotenv";
import Container from "typedi";
import { App } from "./app";


const bootstrap = () => {
    config();
    const app = Container.get(App);
    app.start();
}

bootstrap();
