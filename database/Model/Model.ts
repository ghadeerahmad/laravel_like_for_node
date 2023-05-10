"strict mode"
import { escape } from "mysql2"
import DB from "../db"
import { buildJoin, buildOrWhere, buildSelect, buildWhere, buildWhereIn, getBelongsTo, getHasMany } from "./helpers"
import { ModelAttribute, ModelInsertItem, ModelJoinItem, ModelRelation, ModelWhere, ModelWhereIn } from "./interfaces"

interface OrderBy {
    orderBy: string,
    sort: "ASC" | "DESC"
}
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
    protected orWheres: ModelWhere[] = []
    protected whereIns: ModelWhereIn[] = []
    protected joins: ModelJoinItem[] = []
    /** list of fields should be selected from database */
    protected selects: string[] = []
    /** define limit */
    protected lmt: number | undefined
    /** order by */
    protected order_by?: OrderBy;
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
    /** build update command */
    protected buildUpdateCommand(data: ModelInsertItem) {
        let comm = `UPDATE ${this.table} SET `
        const wehres = buildWhere(this.wheres)
        const orWheres = buildOrWhere(this.orWheres)
        const whereIn = buildWhereIn(this.whereIns)
        const list = Object.entries(data)
        list.map(([key, value], index) => {
            comm += `${key}=${escape(value)}`
            if (index !== list.length - 1) comm += ','
        })
        this.command = `${comm} ${wehres} ${whereIn} ${orWheres}`
    }
    /** build the command */
    protected buildCommand() {
        this.prepareRelations()
        const select = buildSelect(this.selects, this.table)
        const joins = buildJoin(this.joins)
        const wheres = buildWhere(this.wheres)
        const whereIn = buildWhereIn(this.whereIns)
        this.command = `${select} ${joins} ${wheres} ${whereIn}`
        if (this.order_by) {
            this.command += ` ORDER BY ${this.order_by.orderBy} ${this.order_by.sort}`
        }
        if (this.lmt) {
            this.command += ` LIMIT ${this.lmt}`
        }
    }
    /** build upsert commane */
    protected buildUpsert(fields: string[], values: ModelInsertItem[], checkFields: string[]) {
        this.command = `INSERT INTO ${this.table} (`
        fields.map((item, index) => {
            this.command += item
            if (index !== fields.length - 1) this.command += ','
        })
        this.command += ') VALUES'
        values.map((item, index) => {
            this.command += '('
            const itemList = Object.entries(item)
            itemList.map(([key, value], index) => {
                this.command += escape(value)
                if (index !== itemList.length - 1) this.command += ','
            })
            this.command += ')'
            if (index !== values.length - 1) this.command += ','
        })
        this.command += ' ON DUPLICATE KEY UPDATE '
        fields.map((col, i) => {
            const check = checkFields.find((item => item === col))
            if (!check) {
                this.command += `${col} = VALUES(${col})`

                if (i !== fields.length - 1) this.command += ','
            }
        })
    }
    /** build insert command */
    protected buildInsertCommand(data: ModelInsertItem[]) {
        if (data.length === 0) return
        const fields: string[] = []
        Object.entries(data[0]).map(([key, value]) => {
            fields.push(key)
        })
        this.command = `INSERT INTO ${this.table} (`
        fields.map((item, index) => {
            this.command += item
            if (index !== fields.length - 1) this.command += ','
        })
        this.command += ') VALUES'
        data.map((item, index) => {
            this.command += '('
            const itemList = Object.entries(item)
            itemList.map(([key, value], index) => {
                this.command += escape(value)
                if (index !== itemList.length - 1) this.command += ','
            })
            this.command += ')'
            if (index !== data.length - 1) this.command += ','
        })
    }
    /** build delete command */
    protected buildDeleteCommand() {
        const wheres = buildWhere(this.wheres)
        const whereIn = buildWhereIn(this.whereIns)
        this.command = `DELETE FROM ${this.table} ${wheres} ${whereIn}`

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
    /** limit function */
    public limit(number: number) {
        this.lmt = number
        return this
    }
    /** order by function */
    public orderBy(order_by: string, sort: "ASC" | "DESC" = "ASC") {
        this.order_by = { orderBy: order_by, sort: sort }
        return this
    }
    /** push new where condition to wheres list */
    public where(key: string, value: any, operator: '=' | '!=' | 'IS' | 'IS NOT' | 'LIKE' | '>' | '<' | '>=' | '<=' = '=') {
        this.wheres.push({
            key: key,
            value: value,
            operator: operator
        })
        return this
    }
    public orWhere(key: string, value: any, operator: '=' | '!=' | 'IS' | 'IS NOT' | 'LIKE' = '=') {
        this.orWheres.push({
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
    public async first() {
        const model = await this.limit(1).get()
        return model[0]
    }
    /** find by id */
    public async find(id: number) {
        this.where('id', id)
        this.buildCommand()
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
            const val = escape(value)
            keys += key
            values += escape(value)

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
    /** update */
    public async update(data: ModelInsertItem) {
        this.buildUpdateCommand(data)
        const result = await DB.execute(this.command)
        return result ? true : false
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
    /** get eager load relations */
    public with(...name: string[]) {
        this.withs = [...name]
        return this
    }
    /** upsert function */
    public async upsert(data: ModelInsertItem[], checkKeys: string[]) {
        if (data.length === 0) return
        const fields: string[] = []
        Object.entries(data[0]).map(([key, value]) => {
            fields.push(key)
        })
        this.buildUpsert(fields, data, checkKeys)
        const result = await DB.execute(this.command)
        return result
    }
    /** insert many function */
    public async insert(data: ModelInsertItem[]) {
        if (data.length === 0) return

        this.buildInsertCommand(data)
        const result = await DB.execute(this.command)
        return result

    }
    select(...args: string[]) {
        this.selects = args
        return this
    }
    join(table: String, left: String, right: String, operator: '=' | '!=' | '>' | '<' = '=') {
        this.joins.push({
            table: table,
            left: left,
            right: right,
            operator: operator
        })
        return this
    }
    async delete() {
        this.buildDeleteCommand()
        const result = await DB.execute(this.command)
        return result;
    }
}

