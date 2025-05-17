import { Service } from "typedi";

@Service()
export class Logger {
    constructor() {}

    public log(message: string, context: any) {
        console.log(`[${context.constructor.name}] ${message}`);
    }

    public error(message: string, context: any) {
        console.error(`[${context.constructor.name}] ${message}`);
    }

    public warn(message: string, context: any) {
        console.warn(`[${context.constructor.name}] ${message}`);
    }

    public info(message: string, context: any) {
        console.info(`[${context.constructor.name}] ${message}`);
    }
}
