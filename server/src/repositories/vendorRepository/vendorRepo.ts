import { ClientSession } from "mongoose";
import { Vendor, VendorModel } from "../../domain/vendor.model";

type NewVendor = Pick<
  Vendor,
  "ownerId" | "businessName" | "address" | "businessPhone"
>;

export const vendorRepository = {
  async create(data: NewVendor, session: ClientSession) {
    const vendor = new VendorModel(data);
    return vendor.save({ session });
  },
  findByOwnerId(ownerId: string, session: ClientSession) {
    return VendorModel.findOne({ ownerId }).session(session).exec();
  },
};
