import mongoose from "mongoose";
import { userRepository } from "../../repositories/userRepository/userRepo";
import { vendorRepository } from "../../repositories/vendorRepository/vendorRepo";
import { publicUser } from "../../user/user.presenter";
import { comparePassword, hashPassword } from "../../utils/bcrypt";
import { httpError } from "../../utils/httpError";
import { VendorSignupInput } from "./vendorSignup.dto";

export async function signupVendor(data: VendorSignupInput) {
  return mongoose.connection.transaction(async (session) => {
    let owner = await userRepository.findForLogin(data.email, session);
    if (owner) {
      if (
        !owner.isActive ||
        !(await comparePassword(data.password, owner.passwordHash))
      ) {
        throw httpError(401, "Invalid email or password");
      }
      if (await vendorRepository.findByOwnerId(owner.id, session)) {
        throw httpError(409, "This account already owns a vendor");
      }
      if (!owner.roles.includes("vendor")) {
        owner.roles.push("vendor");
        await owner.save({ session });
      }
    } else {
      owner = await userRepository.create(
        {
          email: data.email,
          passwordHash: await hashPassword(data.password),
          roles: ["user", "vendor"],
        },
        session,
      );
    }

    const vendor = await vendorRepository.create(
      {
        ownerId: owner._id,
        businessName: data.businessName,
        businessPhone: data.businessPhone,
        address: data.location,
      },
      session,
    );

    return { ...publicUser(owner), vendor: vendor.toObject() };
  });
}
