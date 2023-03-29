import { ModelAttribute, ModelInsertItem, ModelRelation, ModelWhere, ModelWhereIn } from "./interfaces";
interface OrderBy {
    orderBy: string;
    sort: "ASC" | "DESC";
}
export default class Model {
    /** attributes variables */
    [x: string]: any;
    /** the table name of this model */
    protected table: string;
    /** list of assigned attributes */
    protected attributes: ModelAttribute[];
    /** hidden attributes when converting the object to json */
    protected hidden: string[];
    /** list of wheres and where in*/
    protected wheres: ModelWhere[];
    protected whereIns: ModelWhereIn[];
    /** list of fields should be selected from database */
    protected selects: string[];
    /** define limit */
    protected lmt: number | undefined;
    /** order by */
    protected order_by?: OrderBy;
    /** the command which will be built befor the query */
    protected command: string;
    /** relations */
    protected withs: string[];
    /** 1 to 1 relations */
    protected belongsTos: ModelRelation[];
    /** 1 to many relations */
    protected hasManies: ModelRelation[];
    /** factory method */
    static query(): Model;
    /** define this object properties */
    protected setupProperties(): void;
    /** build update command */
    protected buildUpdateCommand(data: ModelInsertItem): void;
    /** build the command */
    protected buildCommand(): void;
    /** build upsert commane */
    protected buildUpsert(fields: string[], values: ModelInsertItem[], checkFields: string[]): void;
    /** build insert command */
    protected buildInsertCommand(data: ModelInsertItem[]): void;
    /** build delete command */
    protected buildDeleteCommand(): void;
    /** build an object of type model from database object */
    protected buildObject(source: any): any;
    /** 1 to 1 relationship */
    protected belongsTo<A extends Model>(c: new () => A, foreignKey?: string, relationName?: string): void;
    /** 1 to many relationship */
    protected hasMany<A extends Model>(c: new () => A, foreignKey?: string, relationName?: string): void;
    /** limit function */
    limit(number: number): this;
    /** order by function */
    orderBy(order_by: string, sort?: "ASC" | "DESC"): this;
    /** push new where condition to wheres list */
    where(key: string, value: any, operator?: '=' | '!=' | 'IS' | 'IS NOT' | 'LIKE'): this;
    /** prepare relationships */
    protected prepareRelations(): void;
    /** push new where in pairs to where in list */
    whereIn(key: string, value: any[]): this;
    /** get list of rows from database */
    get(): Promise<any[]>;
    /** get single object from database */
    first(): Promise<any>;
    /** find by id */
    find(id: number): Promise<any>;
    /** create new record in the database */
    create(data: ModelInsertItem): Promise<any>;
    /** update */
    update(data: ModelInsertItem): Promise<boolean>;
    /** convert model to json data */
    toJSON(): any;
    /** get eager load relations */
    with(...name: string[]): this;
    /** upsert function */
    upsert(data: ModelInsertItem[], checkKeys: string[]): Promise<boolean | undefined>;
    /** insert many function */
    insert(data: ModelInsertItem[]): Promise<boolean | undefined>;
    select(...args: string[]): this;
    delete(): Promise<boolean>;
}
export {};
