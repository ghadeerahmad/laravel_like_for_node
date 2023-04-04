import { ModelJoinItem, ModelRelation, ModelRelationEagerLoad, ModelWhere, ModelWhereIn } from "./interfaces"
import Model from "./Model"

/** build select clause */
export function buildSelect(selects: string[], table: string) {
    let command = 'SELECT '
    if (selects.length === 0)
        command += `*`
    else
        selects.map((item, index) => {
            command += item
            if (index !== selects.length - 1) command += ','
        })
    command += ` FROM ${table}`
    return command
}

/** build where clause */
export function buildWhere(wheres: ModelWhere[]) {
    let command = ''
    if (wheres.length > 0) command += 'WHERE '
    wheres.map((item, index) => {
        if (Number.isInteger(item.value) || item.value === null)
            command += `${item.key} ${item.operator} ${item.value}`
        else
            command += `${item.key} ${item.operator} '${item.value}'`
        if (index !== wheres.length - 1) command += ' and '
    })
    return command
}
export function buildOrWhere(wheres: ModelWhere[]) {
    let command = ''
    if (wheres.length > 0) command += 'Or WHERE '
    wheres.map((item, index) => {
        if (Number.isInteger(item.value) || item.value === null)
            command += `${item.key} ${item.operator} ${item.value}`
        else
            command += `${item.key} ${item.operator} '${item.value}'`
        if (index !== wheres.length - 1) command += ' and '
    })
    return command
}
export function buildJoin(join: ModelJoinItem[]) {
    let command = ''
    join.map((item, index) => {
        command += ` JOIN ${item.table} ON ${item.left} ${item.operator} ${item.right}`
        // if (index != join.length - 1) command += ','
    })
    return command
}
/** build whereIn statement */
export function buildWhereIn(whereIns: ModelWhereIn[]) {
    let command = ''
    if (whereIns.length > 0) {
        if (!command.includes('WHERE'))
            command += 'WHERE '
        else command += ' and '
        whereIns.map((item, index) => {
            command += `${item.key} IN (`
            item.value.map((val, index) => {
                command += val
                if (index !== item.value.length - 1)
                    command += ','
            })
            command += ')'
            if (index !== whereIns.length - 1)
                command += ' AND '
        })
    }
    return command
}

/** get belongs to result */
export async function getBelongsTo(models: Model[], belongsTos: ModelRelation[]) {
    const list: ModelRelationEagerLoad[] = []
    belongsTos.map((rel) => {
        const ids: number[] = []
        models.map((item) => {
            if (item[`${rel.foreignKey}`]) {
                const check = ids.find((id => id === item[`${rel.foreignKey}`]))
                if (!check)
                    ids.push(item[`${rel.foreignKey}`])
            }
        })
        if (ids.length > 0) {

            list.push({ model: rel.target_model, ids: ids })
        }
    })
    const result: any[] = []
    for (const item of list) {
        const res = await item.model.whereIn('id', item.ids).get()

        result.push(res)
    }
    belongsTos.map((rel) => {
        for (const model of models) {
            result.map((item) => {
                item.map((i: any) => {
                    if (i.id === model[`${rel.foreignKey}`]) {
                        model[`${rel.name}`] = i
                    }
                })
            })
        }
    })
    return models
}

/** get hasMany relations */
export async function getHasMany(models: Model[], hasManies: ModelRelation[]) {
    const list: ModelRelationEagerLoad[] = []
    hasManies.map((rel) => {
        const ids: number[] = []
        models.map((item) => {
            const check = ids.find((id => id === item.id))
            if (!check)
                ids.push(item.id)
        })
        if (ids.length > 0) {

            list.push({ model: rel.target_model, ids: ids, target_column: rel.foreignKey })
        }
    })
    const result: any[] = []
    for (const item of list) {
        if (item.target_column) {
            const res = await item.model.whereIn(item.target_column, item.ids).get()

            result.push(res)
        }
    }
    hasManies.map((rel) => {
        for (const model of models) {
            const vars: any[] = []
            result.map((item) => {
                item.map((i: any) => {
                    if (i[`${rel.foreignKey}`] === model.id) {
                        vars.push(i)
                    }
                })
            })
            model[`${rel.name}`] = vars
        }
    })
    return models
}