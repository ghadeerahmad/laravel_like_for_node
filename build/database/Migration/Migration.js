"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const enums_1 = require("./enums");
class Migration {
    /** migration constructor */
    constructor(table, attributes) {
        attributes.id = { type: enums_1.ColumnType.bigint, primary: true, autoIncrement: true };
        this.attributes = attributes;
        this.table = table;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let comm = `CREATE TABLE IF NOT EXISTS ${this.table} (`;
            const list = Object.entries(this.attributes);
            list.map(([key, value], index) => {
                comm += `${key} ${this.getType(value)}${this.getLength(value)}`;
                if (value.unsigned)
                    comm += ' UNSIGNED';
                if (value.primary) {
                    if (!value.unique)
                        comm += ' UNSIGNED';
                    comm += ' PRIMARY KEY';
                }
                if (value.foreign) {
                    if (!value.unsigned && value.type === enums_1.ColumnType.bigint) {
                        comm += ' UNSIGNED';
                    }
                }
                if (value.nullable === false)
                    comm += ' NOT NULL ';
                if (value.autoIncrement)
                    comm += ' AUTO_INCREMENT ';
                if (value.unique)
                    comm += ' UNIQUE';
                if (index !== list.length - 1)
                    comm += ',';
            });
            const foreign = this.getForeignIds();
            if (foreign !== '')
                comm += `,${foreign}`;
            comm += ');';
            yield db_1.DB.createTable(comm);
        });
    }
    getForeignIds() {
        const list = Object.entries(this.attributes);
        let foreigns = '';
        list.map(([key, value], index) => {
            if (value.foreign) {
                const keyName = `${this.table}_${key}_foreign`;
                foreigns += `CONSTRAINT ${keyName} FOREIGN KEY `;
                foreigns += `(${key}) REFERENCES ${value.foreign.refrences.table}(${value.foreign.refrence_key}) `;
                if (value.foreign.onDelete) {
                    foreigns += `ON DELETE`;
                    switch (value.foreign.onDelete) {
                        case 'CASCADE':
                            foreigns += ` CASCADE`;
                            break;
                        case 'NULL':
                            foreigns += ' SET NULL';
                            break;
                    }
                }
                if (index !== list.length - 1)
                    foreigns += ',';
            }
        });
        return foreigns;
    }
    getType(attr) {
        switch (attr.type) {
            case enums_1.ColumnType.string:
                return "VARCHAR";
            case enums_1.ColumnType.text:
                return "TEXT";
            case enums_1.ColumnType.int:
                return "INT";
            case enums_1.ColumnType.bigint:
                return "BIGINT";
            case enums_1.ColumnType.boolean:
                return "BOOLEAN";
            case enums_1.ColumnType.double:
                return "DOUBLE";
            case enums_1.ColumnType.float:
                return "FLOAT";
            case enums_1.ColumnType.enum:
                return 'ENUM';
        }
    }
    getLength(attr) {
        var _a, _b, _c;
        switch (attr.type) {
            case enums_1.ColumnType.string:
                return (_a = attr.length) !== null && _a !== void 0 ? _a : "(255)";
            case enums_1.ColumnType.bigint:
            case enums_1.ColumnType.int:
                return (_b = attr.length) !== null && _b !== void 0 ? _b : "(20)";
            case enums_1.ColumnType.float:
                return (_c = attr.length) !== null && _c !== void 0 ? _c : "(8,2)";
            default:
                return '';
        }
    }
}
exports.default = Migration;
