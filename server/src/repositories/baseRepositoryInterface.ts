export interface IBaseRepository<T> {
    create(data: T): Promise<T>;
    findOne(query: any): Promise<T | null>;
    findById(id: string): Promise<T | null>;
    find(query: any): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
