"use strict";
"strict mode";
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
const mysql2_1 = require("mysql2");
const db_1 = __importDefault(require("../db"));
const helpers_1 = require("./helpers");
class Model {
    constructor() {
        /** the table name of this model */
        this.table = `${this.constructor.name.toLowerCase()}s`;
        /** list of assigned attributes */
        this.attributes = [];
        /** hidden attributes when converting the object to json */
        this.hidden = [];
        /** list of wheres and where in*/
        this.wheres = [];
        this.orWheres = [];
        this.whereIns = [];
        this.joins = [];
        /** list of fields should be selected from database */
        this.selects = [];
        /** the command which will be built befor the query */
        this.command = '';
        /** relations */
        this.withs = [];
        /** 1 to 1 relations */
        this.belongsTos = [];
        /** 1 to many relations */
        this.hasManies = [];
    }
    /** factory method */
    static query() {
        return new this;
    }
    /** define this object properties */
    setupProperties() {
        this.attributes.map((item) => {
            Object.defineProperty(this, item.key, {
                get: () => item.value,
                set: (value) => {
                    item.value = value;
                }
            });
        });
    }
    /** build update command */
    buildUpdateCommand(data) {
        let comm = `UPDATE ${this.table} SET `;
        const wehres = (0, helpers_1.buildWhere)(this.wheres);
        const orWheres = (0, helpers_1.buildOrWhere)(this.orWheres);
        const whereIn = (0, helpers_1.buildWhereIn)(this.whereIns);
        const list = Object.entries(data);
        list.map(([key, value], index) => {
            comm += `${key}=${(0, mysql2_1.escape)(value)}`;
            if (index !== list.length - 1)
                comm += ',';
        });
        this.command = `${comm} ${wehres} ${whereIn} ${orWheres}`;
    }
    /** build the command */
    buildCommand() {
        this.prepareRelations();
        const select = (0, helpers_1.buildSelect)(this.selects, this.table);
        const joins = (0, helpers_1.buildJoin)(this.joins);
        const wheres = (0, helpers_1.buildWhere)(this.wheres);
        const whereIn = (0, helpers_1.buildWhereIn)(this.whereIns);
        this.command = `${select} ${joins} ${wheres} ${whereIn}`;
        if (this.order_by) {
            this.command += ` ORDER BY ${this.order_by.orderBy} ${this.order_by.sort}`;
        }
        if (this.lmt) {
            this.command += ` LIMIT ${this.lmt}`;
        }
    }
    /** build upsert commane */
    buildUpsert(fields, values, checkFields) {
        this.command = `INSERT INTO ${this.table} (`;
        fields.map((item, index) => {
            this.command += item;
            if (index !== fields.length - 1)
                this.command += ',';
        });
        this.command += ') VALUES';
        values.map((item, index) => {
            this.command += '(';
            const itemList = Object.entries(item);
            itemList.map(([key, value], index) => {
                this.command += (0, mysql2_1.escape)(value);
                if (index !== itemList.length - 1)
                    this.command += ',';
            });
            this.command += ')';
            if (index !== values.length - 1)
                this.command += ',';
        });
        this.command += ' ON DUPLICATE KEY UPDATE ';
        fields.map((col, i) => {
            const check = checkFields.find((item => item === col));
            if (!check) {
                this.command += `${col} = VALUES(${col})`;
                if (i !== fields.length - 1)
                    this.command += ',';
            }
        });
    }
    /** build insert command */
    buildInsertCommand(data) {
        if (data.length === 0)
            return;
        const fields = [];
        Object.entries(data[0]).map(([key, value]) => {
            fields.push(key);
        });
        this.command = `INSERT INTO ${this.table} (`;
        fields.map((item, index) => {
            this.command += item;
            if (index !== fields.length - 1)
                this.command += ',';
        });
        this.command += ') VALUES';
        data.map((item, index) => {
            this.command += '(';
            const itemList = Object.entries(item);
            itemList.map(([key, value], index) => {
                this.command += (0, mysql2_1.escape)(value);
                if (index !== itemList.length - 1)
                    this.command += ',';
            });
            this.command += ')';
            if (index !== data.length - 1)
                this.command += ',';
        });
    }
    /** build delete command */
    buildDeleteCommand() {
        const wheres = (0, helpers_1.buildWhere)(this.wheres);
        const whereIn = (0, helpers_1.buildWhereIn)(this.whereIns);
        this.command = `DELETE FROM ${this.table} ${wheres} ${whereIn}`;
    }
    /** build an object of type model from database object */
    buildObject(source) {
        const attrs = [];
        const model = new this.constructor;
        Object.entries(source).map(([key, value]) => {
            attrs.push({ key: key, value: value });
        });
        model.attributes = attrs;
        model.setupProperties();
        return model;
    }
    /** 1 to 1 relationship */
    belongsTo(c, foreignKey, relationName) {
        let foreign = foreignKey;
        let name = relationName !== null && relationName !== void 0 ? relationName : '';
        let names = c.name.split(/(?=[A-Z])/);
        const model = new c();
        if (!foreign) {
            foreign = '';
            names.map((item, index) => {
                foreign += item.toLowerCase();
                if (index !== names.length - 1)
                    foreign += '_';
            });
            foreign += '_id';
        }
        if (name === '') {
            names.map((item, index) => {
                name += item.toLowerCase();
                if (index !== names.length - 1)
                    name += '_';
            });
        }
        const relation = {
            name: name,
            foreignKey: foreign,
            target_model: model,
            target_table: model.table
        };
        this.belongsTos.push(relation);
    }
    /** 1 to many relationship */
    hasMany(c, foreignKey, relationName) {
        let foreign = foreignKey;
        let name = relationName !== null && relationName !== void 0 ? relationName : '';
        let names = this.constructor.name.split(/(?=[A-Z])/);
        let relNames = c.name.split(/(?=[A-Z])/);
        const model = new c();
        if (!foreign) {
            foreign = '';
            names.map((item, index) => {
                foreign += item.toLowerCase();
                if (index !== names.length - 1)
                    foreign += '_';
            });
            foreign += '_id';
        }
        if (name === '') {
            relNames.map((item, index) => {
                name += item.toLowerCase();
                if (index !== relNames.length - 1)
                    name += '_';
            });
        }
        const relation = {
            name: `${name}s`,
            foreignKey: foreign,
            target_model: model,
            target_table: model.table
        };
        this.hasManies.push(relation);
    }
    /** limit function */
    limit(number) {
        this.lmt = number;
        return this;
    }
    /** order by function */
    orderBy(order_by, sort = "ASC") {
        this.order_by = { orderBy: order_by, sort: sort };
        return this;
    }
    /** push new where condition to wheres list */
    where(key, value, operator = '=') {
        this.wheres.push({
            key: key,
            value: value,
            operator: operator
        });
        return this;
    }
    orWhere(key, value, operator = '=') {
        this.orWheres.push({
            key: key,
            value: value,
            operator: operator
        });
        return this;
    }
    /** prepare relationships */
    prepareRelations() {
        this.withs.map((item) => {
            try {
                eval(`this.${item}()`);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    /** push new where in pairs to where in list */
    whereIn(key, value) {
        if (!Array.isArray(value))
            throw 'the value must be an array';
        this.whereIns.push({
            key: key,
            value: value
        });
        return this;
    }
    /** get list of rows from database */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buildCommand();
            const result = yield db_1.default.fetch(this.command);
            let list = [];
            result.map((item) => {
                if (item) {
                    const model = this.buildObject(item);
                    list.push(model.toJSON());
                }
            });
            list = yield (0, helpers_1.getBelongsTo)(list, this.belongsTos);
            list = yield (0, helpers_1.getHasMany)(list, this.hasManies);
            return list;
        });
    }
    /** get single object from database */
    first() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield this.limit(1).get();
            return model[0];
        });
    }
    /** find by id */
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.where('id', id);
            this.buildCommand();
            const result = yield this.first();
            return result;
        });
    }
    /** create new record in the database */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let comm = `INSERT INTO ${this.table} `;
            let keys = '';
            let values = '';
            const vars = Object.entries(data);
            vars.map(([key, value], index) => {
                const val = (0, mysql2_1.escape)(value);
                keys += key;
                values += (0, mysql2_1.escape)(value);
                if (index !== vars.length - 1) {
                    keys += ',';
                    values += ',';
                }
            });
            comm += `(${keys},created_at,updated_at) VALUES (${values},NOW(),NOW())`;
            const id = yield db_1.default.insert(comm);
            if (id) {
                const created = yield this.where('id', id).first();
                return created;
            }
            return null;
        });
    }
    /** update */
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.buildUpdateCommand(data);
            const result = yield db_1.default.execute(this.command);
            return result ? true : false;
        });
    }
    /** convert model to json data */
    toJSON() {
        const data = {};
        if (this.attributes.length === 0)
            return null;
        this.attributes.map((item) => {
            const checkHidden = this.hidden.find((i => i === item.key));
            if (!checkHidden)
                data[`${item.key}`] = item.value;
        });
        return data;
    }
    /** get eager load relations */
    with(...name) {
        this.withs = [...name];
        return this;
    }
    /** upsert function */
    upsert(data, checkKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.length === 0)
                return;
            const fields = [];
            Object.entries(data[0]).map(([key, value]) => {
                fields.push(key);
            });
            this.buildUpsert(fields, data, checkKeys);
            const result = yield db_1.default.execute(this.command);
            return result;
        });
    }
    /** insert many function */
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.length === 0)
                return;
            this.buildInsertCommand(data);
            const result = yield db_1.default.execute(this.command);
            return result;
        });
    }
    select(...args) {
        this.selects = args;
        return this;
    }
    join(table, left, right, operator = '=') {
        this.joins.push({
            table: table,
            left: left,
            right: right,
            operator: operator
        });
        return this;
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.buildDeleteCommand();
            const result = yield db_1.default.execute(this.command);
            return result;
        });
    }
}
exports.default = Model;
