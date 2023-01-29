"strict mode"
import { DB } from "../db"
import { buildSelect, buildWhere, buildWhereIn, getBelongsTo, getHasMany } from "./helpers"
import { ModelAttribute, ModelInsertItem, ModelRelation, ModelRelationEagerLoad, ModelWhere, ModelWhereIn } from "./interfaces"

export default class Model {

    /** attributes variables */
    [x: string]: any

    /** the table name of this model */
    protected table: string = `${this.constructor.name.toLowerCase()}s`
    /** list of assigned attributes */
    protected attributes: ModelAttribute[] = []
    /** hidden attributes when converting the object to json */
    protected hidden: string[] = []

    /** list of wheres and where in*/
    protected wheres: ModelWhere[] = []
    protected whereIns: ModelWhereIn[] = []
    /** list of fields should be selected from database */
    protected selects: string[] = []
    /** the command which will be built befor the query */
    protected command: string = ''

    /** relations */
    protected withs: string[] = []
    /** 1 to 1 relations */
    protected belongsTos: ModelRelation[] = []
    /** 1 to many relations */
    protected hasManies: ModelRelation[] = []
    /** factory method */
    public static query() {
        return new this
    }
    /** define this object properties */
    protected setupProperties() {
        this.attributes.map((item) => {
            Object.defineProperty(this, item.key, {
                get: () => item.value,
                set: (value: any) => {
                    item.value = value
                }
            })
        })
    }
    /** build the command */
    protected buildCommand() {
        this.prepareRelations()
        const select = buildSelect(this.selects, this.table)
        const wheres = buildWhere(this.wheres)
        const whereIn = buildWhereIn(this.whereIns)
        this.command = `${select} ${wheres} ${whereIn}`
    }



    /** build an object of type model from database object */
    protected buildObject(source: any) {
        const attrs: ModelAttribute[] = [];
        const model = new (<any>this.constructor)
        Object.entries(source).map(([key, value]) => {
            attrs.push({ key: key, value: value })
        })
        model.attributes = attrs;
        model.setupProperties()
        return model
    }
    /** 1 to 1 relationship */
    protected belongsTo<A extends Model>(c: new () => A, foreignKey?: string, relationName?: string) {
        let foreign = foreignKey
        let name = relationName ?? ''
        let names = c.name.split(/(?=[A-Z])/)
        const model = new c()
        if (!foreign) {
            foreign = ''
            names.map((item, index) => {
                foreign += item.toLowerCase()
                if (index !== names.length - 1) foreign += '_'
            })
            foreign += '_id'
        }
        if (name === '') {
            names.map((item, index) => {
                name += item.toLowerCase()
                if (index !== names.length - 1) name += '_'
            })
        }

        const relation: ModelRelation = {
            name: name,
            foreignKey: foreign,
            target_model: model,
            target_table: model.table
        }
        this.belongsTos.push(relation)
    }
    /** 1 to many relationship */
    protected hasMany<A extends Model>(c: new () => A, foreignKey?: string, relationName?: string) {
        let foreign = foreignKey
        let name = relationName ?? ''
        let names = this.constructor.name.split(/(?=[A-Z])/)
        let relNames = c.name.split(/(?=[A-Z])/)
        const model = new c()
        if (!foreign) {
            foreign = ''
            names.map((item, index) => {
                foreign += item.toLowerCase()
                if (index !== names.length - 1) foreign += '_'
            })
            foreign += '_id'
        }
        if (name === '') {
            relNames.map((item, index) => {
                name += item.toLowerCase()
                if (index !== relNames.length - 1) name += '_'
            })
        }

        const relation: ModelRelation = {
            name: `${name}s`,
            foreignKey: foreign,
            target_model: model,
            target_table: model.table
        }
        this.hasManies.push(relation)
    }
    /** push new where condition to wheres list */
    public where(key: string, value: any, operator: '=' | '!=' | 'IS' | 'IS NOT' | 'LIKE' = '=') {
        this.wheres.push({
            key: key,
            value: value,
            operator: operator
        })
        return this
    }
    /** prepare relationships */
    protected prepareRelations() {

        this.withs.map((item) => {
            try {

                eval(`this.${item}()`)
            } catch (e) {
                console.log(e)
            }
        })
    }

    /** push new where in pairs to where in list */
    public whereIn(key: string, value: any[]) {
        if (!Array.isArray(value))
            throw 'the value must be an array'
        this.whereIns.push({
            key: key,
            value: value
        })
        return this
    }
    /** get list of rows from database */
    public async get() {
        this.buildCommand()
        const result = await DB.fetch(this.command)
        let list: any[] = []
        result.map((item) => {
            if (item) {
                const model = this.buildObject(item)
                list.push(model.toJSON())
            }
        })
        list = await getBelongsTo(list, this.belongsTos)
        list = await getHasMany(list, this.hasManies)
        return list
    }
    /** get single object from database */
    public async first(): Promise<this | null> {
        this.buildCommand()
        this.command += ' LIMIT 1'
        const result = await DB.fetch(this.command)
        if (result.length === 0) return null
        const model = this.buildObject(result[0])
        return model
    }
    /** find by id */
    public async find(id: number) {
        this.where('id', id)

        const result = await this.first()
        return result
    }
    /** create new record in the database */
    public async create(data: ModelInsertItem) {
        let comm = `INSERT INTO ${this.table} `
        let keys = ''
        let values = ''
        const vars = Object.entries(data)

        vars.map(([key, value], index) => {
            keys += key
            if (Number.isInteger(value) || value === null)
                values += value
            else values += `'${value}'`
            if (index !== vars.length - 1) {
                keys += ','
                values += ','
            }
        })
        comm += `(${keys},created_at,updated_at) VALUES (${values},NOW(),NOW())`
        const id = await DB.insert(comm)
        if (id) {
            const created = await this.where('id', id).first()
            return created
        }
        return null
    }
    /** convert model to json data */
    public toJSON() {
        const data: any = {}
        if (this.attributes.length === 0) return null
        this.attributes.map((item) => {
            const checkHidden = this.hidden.find((i => i === item.key))
            if (!checkHidden) data[`${item.key}`] = item.value
        })
        return data
    }
    public with(...name: string[]) {
        this.withs = [...name]
        return this
    }

}
