import DB from "../db";
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
        attributes.id = { type: ColumnType.bigint, primary: true, autoIncrement: true }
        this.attributes = attributes;
        this.table = table;
    }

    async run() {
        let comm = `CREATE TABLE IF NOT EXISTS ${this.table} (`
        const list = Object.entries(this.attributes)
        list.map(([key, value], index) => {
            const type = this.getType(value)
            comm += `${key} ${type}${this.getLength(value)}`
            if (value.choices && type === 'ENUM') {
                comm += '('
                const length = value.choices.length;
                value.choices.map((item, i) => {
                    comm += item
                    if (i != length - 1) { comm += ',' }
                })
                comm += ')'
            }
            if (value.unsigned) comm += ' UNSIGNED'
            if (value.primary) {
                if (!value.unique) comm += ' UNSIGNED'
                comm += ' PRIMARY KEY'
            }
            if (value.foreign) {
                if (!value.unsigned && value.type === ColumnType.bigint) {
                    comm += ' UNSIGNED'
                }
            }
            if (value.nullable === false) comm += ' NOT NULL '
            if (value.autoIncrement) comm += ' AUTO_INCREMENT '
            if (value.unique) comm += ' UNIQUE'
            if (index !== list.length - 1) comm += ','
        })
        const foreign = this.getForeignIds()
        if (foreign !== '')
            comm += `,${foreign}`
        comm += ');'
        await DB.createTable(comm);
    }
    protected getForeignIds() {
        const list = Object.entries(this.attributes)
        let foreigns = ''
        list.map(([key, value], index) => {
            if (value.foreign) {
                const keyName = `${this.table}_${key}_foreign`
                foreigns += `CONSTRAINT ${keyName} FOREIGN KEY `
                foreigns += `(${key}) REFERENCES ${value.foreign.refrences.table}(${value.foreign.refrence_key}) `
                if (value.foreign.onDelete) {
                    foreigns += `ON DELETE`
                    switch (value.foreign.onDelete) {
                        case 'CASCADE':
                            foreigns += ` CASCADE`
                            break;
                        case 'NULL':
                            foreigns += ' SET NULL'
                            break;
                    }
                }
                if (index !== list.length - 1) foreigns += ','
            }
        })
        return foreigns
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