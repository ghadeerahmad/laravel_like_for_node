import Model from "./Model";
export interface ModelAttribute {
    key: string;
    value: any;
}
export interface ModelWhere {
    key: string;
    value: string | number | null;
    operator: '=' | '!=' | 'IS' | 'IS NOT' | 'LIKE' | '>' | '<' | '>=' | '<=';
}
export interface ModelWhereIn {
    key: string;
    value: any[];
}
export interface ModelInsertItem {
    [x: string]: any;
}
export interface ModelRelation {
    name: string;
    foreignKey: string;
    target_table: string;
    target_model: Model;
}
export interface ModelRelationEagerLoad {
    model: Model;
    ids: number[];
    target_column?: string;
}
export interface ModelJoinItem {
    table: String;
    left: String;
    right: String;
    operator: '=' | '!=' | '>' | '<';
}
