import { getModelForClass, ModelOptions, Prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

interface Location {
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
    username?: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ type: () => Location, required: true })
    location?: Location;

    @Prop({ type: [mongoose.Types.ObjectId], ref: "Vendor", default: [] })
    favourites?: mongoose.Types.ObjectId[];

    @Prop({ required: false, default: false })
    isVerified?: boolean;
}

const UserModel = getModelForClass(User);

export {UserModel, User};
