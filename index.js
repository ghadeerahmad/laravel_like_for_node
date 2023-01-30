"use strict";
// import { ColumnType } from "./database/Migration/enums";
// import Migration from "./database/Migration/Migration";
// import Model from "./database/Model/Model";
// class User extends Model {
//     protected hidden: string[] = ['password']
// }
// const users = new Migration('users', {
//     id: { type: ColumnType.bigint, primary: true, autoIncrement: true },
//     name: { type: ColumnType.string },
//     userName: { type: ColumnType.string, unique: true },
//     password: { type: ColumnType.string }
// })
// class Type extends Model {
//     stores() {
//         this.hasMany(Store)
//     }
// }
// class Store extends Model {
//     user() {
//         this.belongsTo(User)
//     }
//     type() {
//         this.belongsTo(Type)
//     }
// }
// async function test() {
//     await users.run()
//     // console.log(model)
// }
// test()
