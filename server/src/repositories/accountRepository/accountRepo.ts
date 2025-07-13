import { Account, AccountModel } from "../../domain/account.model";
import { IAccountRepository } from "./IAccountRepo";
import { BaseRepository } from "../baseRepository";
import { Service } from "typedi";

@Service()
export class AccountRepository
  extends BaseRepository<Account>
  implements IAccountRepository
{
  constructor() {
    super(AccountModel);
  }

  public async findByEmail(email: string): Promise<Account | null> {
    return this.model.findOne({ email });
  }
}
