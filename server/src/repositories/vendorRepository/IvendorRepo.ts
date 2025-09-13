import { Vendor } from "../../domain/vendor.model";
import { IBaseRepository } from "../baseRepositoryInterface";

export interface IVendorRepository extends IBaseRepository<Vendor> {
  findByBusinessName(businessName: string): Promise<Vendor | null>;
}
