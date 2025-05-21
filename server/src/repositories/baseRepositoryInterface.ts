import { Types } from "mongoose";

export interface IBaseRepository<T> {
    create(data: T): Promise<T>;
    findOne(query: any): Promise<T | null>;
    findById(id: Types.ObjectId): Promise<T | null>;
    find(query: any): Promise<T[]>;
    update(id: Types.ObjectId, data: Partial<T>): Promise<T | null>;
    delete(id: Types.ObjectId): Promise<boolean>;
}
