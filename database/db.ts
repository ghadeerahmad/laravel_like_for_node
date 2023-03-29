import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const db = mysql.createPool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD
})
class DB {
    public static async fetch(statement: string): Promise<RowDataPacket[]> {
        return new Promise((resolve, reject) => {
            db.query(statement, function (err, result, fields) {
                if (err) throw err;
                const list = <any>[];
                const rows = <RowDataPacket[]>result;
                rows.map((item) => list.push(item))
                resolve(rows)
            })
        })
    }
    public static async insert(statement: string): Promise<number | undefined> {
        return new Promise<number | undefined>((resolve, reject) => {

            db.query(statement, function (err, result, fields) {
                if (err) throw err;
                const res = <ResultSetHeader>result

                return resolve(res.insertId);
            })
        });
    }
    // public static async update(statement: string): Promise<boolean> {
    //     return new Promise<boolean>((resolve, reject) => {

    //         db.query(statement, function (err, result, fields) {
    //             if (err) throw err;
    //             const res = <ResultSetHeader>result
    //             if (err) return resolve(false)
    //             return resolve(true);
    //         })
    //     });
    // }
    public static async execute(statement: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

            db.query(statement, function (err, result, fields) {
                if (err) throw err;
                const res = <ResultSetHeader>result
                if (err) return resolve(false)
                return resolve(true);
            })
        });
    }

    public static async createTable(statement: string) {
        return new Promise<number | undefined>((resolve, reject) => {

            db.query(statement, function (err, result, fields) {
                if (err) throw err;
                const res = <ResultSetHeader>result

                return resolve(res.insertId);
            })
        });
    }
}

export default DB 