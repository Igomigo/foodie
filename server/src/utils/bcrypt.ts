import { Service } from "typedi";
import * as bcrypt from "bcrypt";
import { Logger } from "./logger";

@Service()
export class Bcrypt {
  constructor(private readonly logger: Logger) {}

  public async hash(password: string) {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error: any) {
      this.logger.error(error.message, "Hash Password");
      throw new Error(error.message);
    }
  }

  public async compare(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: any) {
      this.logger.error(error.message, "Compare Password");
      throw new Error(error.message);
    }
  }
}
