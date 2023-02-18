import { RowDataPacket } from 'mysql2';
declare class DB {
    static fetch(statement: string): Promise<RowDataPacket[]>;
    static insert(statement: string): Promise<number | undefined>;
    static update(statement: string): Promise<boolean>;
    static createTable(statement: string): Promise<number | undefined>;
}
export default DB;
