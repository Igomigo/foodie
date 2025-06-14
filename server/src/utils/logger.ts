import { Service } from "typedi";

@Service()
export class Logger {
    constructor() {}

    public log(message: string, context: any) {
        console.log(`[${context}] ${message}`);
    }

    public error(message: string, context: any) {
        console.error(`[${context}] ${message}`);
    }

    public warn(message: string, context: any) {
        console.warn(`[${context}] ${message}`);
    }

    public info(message: string, context: any) {
        console.info(`[${context}] ${message}`);
    }
}
