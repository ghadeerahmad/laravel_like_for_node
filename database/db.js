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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = mysql2_1.default.createPool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD
});
class DB {
    static fetch(statement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                db.query(statement, function (err, result, fields) {
                    if (err)
                        throw err;
                    const list = [];
                    const rows = result;
                    rows.map((item) => list.push(item));
                    resolve(rows);
                });
            });
        });
    }
    static insert(statement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                db.query(statement, function (err, result, fields) {
                    if (err)
                        throw err;
                    const res = result;
                    return resolve(res.insertId);
                });
            });
        });
    }
    static update(statement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                db.query(statement, function (err, result, fields) {
                    if (err)
                        throw err;
                    const res = result;
                    if (err)
                        return resolve(false);
                    return resolve(true);
                });
            });
        });
    }
    static createTable(statement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                db.query(statement, function (err, result, fields) {
                    if (err)
                        throw err;
                    const res = result;
                    return resolve(res.insertId);
                });
            });
        });
    }
}
exports.default = DB;
