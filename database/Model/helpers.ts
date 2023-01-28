import { ModelWhere, ModelWhereIn } from "./interfaces"

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
        if (Number.isInteger(item.value))
            command += `${item.key} ${item.operator} ${item.value}`
        else
            command += `${item.key} ${item.operator} '${item.value}'`
        if (index !== wheres.length - 1) command += ','
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