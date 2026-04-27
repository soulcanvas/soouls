declare module 'postgres' {
  const postgres: any;
  export default postgres;
}

declare module 'drizzle-orm/postgres-js' {
  export const drizzle: any;
}

declare module 'drizzle-orm' {
  export const eq: any;
  export const desc: any;
  export const sql: any;
  export const and: any;
  export const or: any;
  export const gt: any;
  export const lt: any;
  export const gte: any;
  export const lte: any;
  export const isNull: any;
  export const isNotNull: any;
  export const inArray: any;
  export const notInArray: any;
}

declare module 'drizzle-orm/pg-core' {
  type AnyBuilder = {
    [key: string]: any;
    $type: <_T>() => AnyBuilder;
    primaryKey: () => AnyBuilder;
    defaultRandom: () => AnyBuilder;
    notNull: () => AnyBuilder;
    unique: () => AnyBuilder;
    default: (...args: any[]) => AnyBuilder;
    defaultNow: () => AnyBuilder;
    references: (...args: any[]) => AnyBuilder;
  };

  export function boolean(...args: any[]): AnyBuilder;
  export function customType<_T = any>(config: any): (...args: any[]) => AnyBuilder;
  export function integer(...args: any[]): AnyBuilder;
  export function jsonb(...args: any[]): AnyBuilder;
  export function pgEnum(...args: any[]): (...innerArgs: any[]) => AnyBuilder;
  export function pgTable(...args: any[]): any;
  export function real(...args: any[]): AnyBuilder;
  export function text(...args: any[]): AnyBuilder;
  export function timestamp(...args: any[]): AnyBuilder;
  export function uuid(...args: any[]): AnyBuilder;
}
