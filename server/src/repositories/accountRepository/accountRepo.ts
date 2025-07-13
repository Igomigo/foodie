import { Account, AccountModel } from "../../domain/account.model";
import { IAccountRepository } from "./IaccountRepo";
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

  public async findByEmailOrUsername(
    email: string,
    username: string
  ): Promise<Account | null> {
    return this.model.findOne({
      $or: [{ email }, { username }],
    });
  }
}
