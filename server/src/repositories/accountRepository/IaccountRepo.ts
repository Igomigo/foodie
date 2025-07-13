import { Account } from "../../domain/account.model";
import { BaseRepository } from "../baseRepository";

export interface IAccountRepository extends BaseRepository<Account> {
  findByEmail(email: string): Promise<Account | null>;
}
