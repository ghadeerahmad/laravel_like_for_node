import { ColumnType } from "./enums";
import Migration from "./Migration";


export interface MigrationAttribute {
    type: ColumnType,
    choices?: string[],
    length?: string,
    nullable?: boolean,
    unique?: boolean,
    primary?: boolean,
    autoIncrement?: boolean,
    unsigned?: boolean,
    foreign?: Foreign,
    default?: any
}
export interface Foreign {
    refrences: Migration,
    refrence_key: string,
    onDelete?: "NULL" | "CASCADE"
}
