import { getModelForClass, ModelOptions, Prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

type Location = {
    country: string;
    state: string;
    city: string;
}

@ModelOptions({
    schemaOptions: {
        timestamps: true,
        versionKey: false
    }
})
class User {
    _id?: mongoose.Types.ObjectId;

    @Prop({ required: true, unique: true })
    username!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ required: false })
    phoneNumber?: string;

    @Prop({ required: false })
    profilePicture?: string;

    @Prop({ type: () => Object, required: true })
    location!: Location;

    @Prop({ type: [mongoose.Types.ObjectId], ref: "Vendor", default: [] })
    favourites?: mongoose.Types.ObjectId[];

    @Prop({ required: false, default: false })
    isVerified?: boolean;
}

const UserModel = getModelForClass(User);

export {UserModel, User};
