import Model from "./database/Model/Model";
class User extends Model {

    protected hidden: string[] = ['password']
}
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
    const model = await Type.query().with('stores')
        .get()
    console.log(model)
}
test()