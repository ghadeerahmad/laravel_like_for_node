"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHasMany = exports.getBelongsTo = exports.buildWhereIn = exports.buildJoin = exports.buildWhere = exports.buildSelect = void 0;
/** build select clause */
function buildSelect(selects, table) {
    let command = 'SELECT ';
    if (selects.length === 0)
        command += `*`;
    else
        selects.map((item, index) => {
            command += item;
            if (index !== selects.length - 1)
                command += ',';
        });
    command += ` FROM ${table}`;
    return command;
}
exports.buildSelect = buildSelect;
/** build where clause */
function buildWhere(wheres) {
    let command = '';
    if (wheres.length > 0)
        command += 'WHERE ';
    wheres.map((item, index) => {
        if (Number.isInteger(item.value) || item.value === null)
            command += `${item.key} ${item.operator} ${item.value}`;
        else
            command += `${item.key} ${item.operator} '${item.value}'`;
        if (index !== wheres.length - 1)
            command += ' and ';
    });
    return command;
}
exports.buildWhere = buildWhere;
function buildJoin(join) {
    let command = '';
    join.map((item, index) => {
        command += `JOIN ${item.table} ON ${item.left} ${item.operator} ${item.right}`;
        if (index != join.length - 1)
            command += ',';
    });
    return command;
}
exports.buildJoin = buildJoin;
/** build whereIn statement */
function buildWhereIn(whereIns) {
    let command = '';
    if (whereIns.length > 0) {
        if (!command.includes('WHERE'))
            command += 'WHERE ';
        else
            command += ' and ';
        whereIns.map((item, index) => {
            command += `${item.key} IN (`;
            item.value.map((val, index) => {
                command += val;
                if (index !== item.value.length - 1)
                    command += ',';
            });
            command += ')';
            if (index !== whereIns.length - 1)
                command += ' AND ';
        });
    }
    return command;
}
exports.buildWhereIn = buildWhereIn;
/** get belongs to result */
function getBelongsTo(models, belongsTos) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = [];
        belongsTos.map((rel) => {
            const ids = [];
            models.map((item) => {
                if (item[`${rel.foreignKey}`]) {
                    const check = ids.find((id => id === item[`${rel.foreignKey}`]));
                    if (!check)
                        ids.push(item[`${rel.foreignKey}`]);
                }
            });
            if (ids.length > 0) {
                list.push({ model: rel.target_model, ids: ids });
            }
        });
        const result = [];
        for (const item of list) {
            const res = yield item.model.whereIn('id', item.ids).get();
            result.push(res);
        }
        belongsTos.map((rel) => {
            for (const model of models) {
                result.map((item) => {
                    item.map((i) => {
                        if (i.id === model[`${rel.foreignKey}`]) {
                            model[`${rel.name}`] = i;
                        }
                    });
                });
            }
        });
        return models;
    });
}
exports.getBelongsTo = getBelongsTo;
/** get hasMany relations */
function getHasMany(models, hasManies) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = [];
        hasManies.map((rel) => {
            const ids = [];
            models.map((item) => {
                const check = ids.find((id => id === item.id));
                if (!check)
                    ids.push(item.id);
            });
            if (ids.length > 0) {
                list.push({ model: rel.target_model, ids: ids, target_column: rel.foreignKey });
            }
        });
        const result = [];
        for (const item of list) {
            if (item.target_column) {
                const res = yield item.model.whereIn(item.target_column, item.ids).get();
                result.push(res);
            }
        }
        hasManies.map((rel) => {
            for (const model of models) {
                const vars = [];
                result.map((item) => {
                    item.map((i) => {
                        if (i[`${rel.foreignKey}`] === model.id) {
                            vars.push(i);
                        }
                    });
                });
                model[`${rel.name}`] = vars;
            }
        });
        return models;
    });
}
exports.getHasMany = getHasMany;
