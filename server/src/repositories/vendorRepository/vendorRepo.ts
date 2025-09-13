import { Vendor, VendorModel } from "../../domain/vendor.model";
import { BaseRepository } from "../baseRepository";
import { IVendorRepository } from "./IvendorRepo";
import { Service } from "typedi";

@Service()
export class VendorRepository
  extends BaseRepository<Vendor>
  implements IVendorRepository
{
  constructor() {
    super(VendorModel);
  }

  public async findByBusinessName(
    businessName: string
  ): Promise<Vendor | null> {
    return this.model.findOne({ businessName });
  }
}
