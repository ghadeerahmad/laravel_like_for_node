import { ColumnType } from "./enums"

export interface MigrationAttribute {
    type: ColumnType,
    choices?: string[],
    length?: string,
    nullable?: boolean,
    unique?: boolean,
    primary?: boolean,
    autoIncrement?: boolean
}
