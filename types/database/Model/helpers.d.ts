import { ModelJoinItem, ModelRelation, ModelWhere, ModelWhereIn } from "./interfaces";
import Model from "./Model";
/** build select clause */
export declare function buildSelect(selects: string[], table: string): string;
/** build where clause */
export declare function buildWhere(wheres: ModelWhere[]): string;
export declare function buildOrWhere(wheres: ModelWhere[]): string;
export declare function buildJoin(join: ModelJoinItem[]): string;
/** build whereIn statement */
export declare function buildWhereIn(whereIns: ModelWhereIn[]): string;
/** get belongs to result */
export declare function getBelongsTo(models: Model[], belongsTos: ModelRelation[]): Promise<Model[]>;
/** get hasMany relations */
export declare function getHasMany(models: Model[], hasManies: ModelRelation[]): Promise<Model[]>;
