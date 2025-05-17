import { Service } from "typedi";

@Service()
export class BaseService {
    public async greet(): Promise<string> {
        return "Hello World, welcome to flavourCompass";
    }
}
