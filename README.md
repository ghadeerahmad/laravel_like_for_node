# library for node js to deal with mysql 
a library similar to laravel functionalties written in node js

# Features
- model for mysql tabels functionalties
- migrations
- query builder (create,update,delete and fetch data)
- create new record with auto timestamps
- eagerload for 1 to 1 relationship
- eagerload for 1 to many relationship

# Usage
### to create new migration file
```
const users = new Migration('users', {
    id: { type: ColumnType.bigint, primary: true, autoIncrement: true },
    name: { type: ColumnType.string },
    userName: { type: ColumnType.string, unique: true },
    password: { type: ColumnType.string }
})
```
the migration constructor takes 2 arguments: the first is table name and the second is columns and thier properties
- type: this is the column type
supported types:
    - string
    - int
    - bigint
    - double
    - float
    - boolean
    - text
    - enum
- length: spicify the length of the column 
- default: spicify default value for column
- primary: set the column as primary key
- autoIncrement: set the column as auto increment
- nullable: set the column to accept null values
- foreign: set constraints as foriegn key, this property accepts:
    - refrences: migration instance of refrenced table
    - refrence_key: the column refrenced in the refrenced table
    - onDelete: set what happened on delete, accepts: "NULL" or "DELETE"
- choices: this option used when you set the column type as enum to set the allowed values. this argument accepts list of strings.

### Model Usage
every model points to a table in the database.
to create new model:
```
export class User extends Model{
    constructo(){
        super()
        this.table = 'users'
    }
}
```
- this.table property sets the target table in the database, By default this property takes the ploral name of the model with lower case letters, i,e:User => users
- to perform query using model: i,e
```
// get single record
const user = await User.query().first()
// get multiple records
const users = await User.query().get()
// apply where statment
const users = await User.query().where('id',1).get()
const users = await User.query().where('id',1).first()

// to create new record
// this function returns created record
const user = await User.query().create({
name:'Jhon Doe',
username:'jgondoe',
password:'somepassword'
})
// perfrom update
// this function return true or false
const resutl = await User.query().where('id',1).update({name:'new name'})
```
# more details will be inserted as soom as possible