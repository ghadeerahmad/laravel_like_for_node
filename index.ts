import Model from "./database/Model/Model";

class User extends Model { }
async function test() {
    const users = await User.query().get()
}

test()