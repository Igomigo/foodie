import { Service } from "typedi";

@Service()
export class Logger {
    constructor() {}

    public log(message: string) {
        console.log(message);
    }

    public error(message: string) {
        console.error(message);
    }

    public warn(message: string) {
        console.warn(message);
    }

    public info(message: string) {
        console.info(message);
    }
}
