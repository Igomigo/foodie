import { Service } from "typedi";
import { IBaseRepository } from "./baseRepositoryInterface";
import { Types } from "mongoose";
import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class BaseRepository<T> implements IBaseRepository<T> {
    private readonly model: ReturnModelType<any>;

    constructor(
        model: ReturnModelType<any>,
    ) {
        this.model = model;
    }

    public async create(data: T): Promise<T> {
        return this.model.create(data);
    }

    public async findOne(query: any): Promise<T | null> {
        return this.model.findOne(query);
    }

    public async findById(id: Types.ObjectId): Promise<T | null> {
        return this.model.findById(id);
    }

    public async find(query: any): Promise<T[]> {
        return this.model.find(query);
    }

    public async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    public async delete(id: Types.ObjectId): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return result !== null;
    }
}
