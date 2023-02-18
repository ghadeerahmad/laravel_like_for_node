"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnType = void 0;
var ColumnType;
(function (ColumnType) {
    ColumnType[ColumnType["string"] = 0] = "string";
    ColumnType[ColumnType["text"] = 1] = "text";
    ColumnType[ColumnType["float"] = 2] = "float";
    ColumnType[ColumnType["double"] = 3] = "double";
    ColumnType[ColumnType["boolean"] = 4] = "boolean";
    ColumnType[ColumnType["enum"] = 5] = "enum";
    ColumnType[ColumnType["int"] = 6] = "int";
    ColumnType[ColumnType["bigint"] = 7] = "bigint";
})(ColumnType = exports.ColumnType || (exports.ColumnType = {}));
