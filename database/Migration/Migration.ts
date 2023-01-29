import { DB } from "../db";
import { ColumnType } from "./enums";
import { MigrationAttribute } from "./interfaces";

export interface Attribute {
    [x: string]: MigrationAttribute
}

export default class Migration {
    protected attributes: Attribute;
    protected table: string;

    /** migration constructor */
    constructor(table: string, attributes: Attribute) {
        this.attributes = attributes;
        this.table = table;
    }

    async run() {
        let comm = `CREATE TABLE IF NOT EXISTS ${this.table} (`
        const list = Object.entries(this.attributes)
        list.map(([key, value], index) => {
            comm += `${key} ${this.getType(value)}${this.getLength(value)}`
            if (value.primary) comm += ' UNSIGNED PRIMARY KEY '
            if (value.nullable === false) comm += ' NOT NULL '
            if (value.autoIncrement) comm += ' AUTO_INCREMENT '
            if (value.unique) comm += ' UNIQUE'
            if (index !== list.length - 1) comm += ','
        })
        comm += ');'
        await DB.createTable(comm);
    }
    protected getType(attr: MigrationAttribute) {
        switch (attr.type) {
            case ColumnType.string:
                return "VARCHAR"
            case ColumnType.text:
                return "TEXT"
            case ColumnType.int:
                return "INT"
            case ColumnType.bigint:
                return "BIGINT"
            case ColumnType.boolean:
                return "BOOLEAN"
            case ColumnType.double:
                return "DOUBLE"
            case ColumnType.float:
                return "FLOAT"
            case ColumnType.enum:
                return 'ENUM'
        }
    }
    protected getLength(attr: MigrationAttribute) {
        switch (attr.type) {
            case ColumnType.string:
                return attr.length ?? "(255)"
            case ColumnType.bigint:
            case ColumnType.int:
                return attr.length ?? "(20)"
            case ColumnType.float:
                return attr.length ?? "(8,2)"
            default:
                return ''
        }
    }
}