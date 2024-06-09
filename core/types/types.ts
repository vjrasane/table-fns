export type RowData = unknown | object | any[];

export type AccessorFn<TData extends RowData, TValue = unknown> = (
  originalRow: TData,
  index: number,
) => TValue;
