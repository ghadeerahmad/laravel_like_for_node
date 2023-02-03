import { ColumnType } from "./database/Migration/enums";
import Migration from "./database/Migration/Migration";
import Model from "./database/Model/Model";
class User extends Model {

    protected hidden: string[] = ['password']
}
const users = new Migration('users', {
    id: { type: ColumnType.bigint, primary: true, autoIncrement: true },
    name: { type: ColumnType.string },
    userName: { type: ColumnType.string, unique: true },
    password: { type: ColumnType.string }
})
const captains = new Migration('captains', {
    id: { type: ColumnType.bigint, primary: true, autoIncrement: true },
    user_id: { type: ColumnType.bigint, unsigned: true, foreign: { refrences: users, refrence_key: 'id', onDelete: "NULL" } }
})
class Type extends Model {
    stores() {
        this.hasMany(Store)
    }
}
class Store extends Model {
    user() {
        this.belongsTo(User)
    }
    type() {
        this.belongsTo(Type)
    }
}
async function test() {
    const users = await User.query().orderBy('id', 'ASC').get()
    console.log(users)
}
test()