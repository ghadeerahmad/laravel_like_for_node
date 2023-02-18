import { MigrationAttribute } from "./interfaces";
export interface Attribute {
    [x: string]: MigrationAttribute;
}
export default class Migration {
    protected attributes: Attribute;
    protected table: string;
    /** migration constructor */
    constructor(table: string, attributes: Attribute);
    run(): Promise<void>;
    protected getForeignIds(): string;
    protected getType(attr: MigrationAttribute): "VARCHAR" | "TEXT" | "INT" | "BIGINT" | "BOOLEAN" | "DOUBLE" | "FLOAT" | "ENUM";
    protected getLength(attr: MigrationAttribute): string;
}
