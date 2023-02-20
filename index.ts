import { ColumnType } from "./database/Migration/enums";
import Migration from "./database/Migration/Migration";
import Model from "./database/Model/Model";

class User extends Model { }
const users = new Migration('users', { type: { type: ColumnType.enum, choices: ['user', 'customer'] } })
async function test() {
    await users.run()
}

test()