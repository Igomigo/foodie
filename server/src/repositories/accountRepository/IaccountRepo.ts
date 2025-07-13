import { Account } from "../../domain/account.model";
import { IBaseRepository } from "../baseRepositoryInterface";

export interface IAccountRepository extends IBaseRepository<Account> {
  findByEmail(email: string): Promise<Account | null>;
  findByEmailOrUsername(email: string, username: string): Promise<Account | null>;
}
