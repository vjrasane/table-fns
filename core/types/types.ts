export type RowData = unknown | object | any[];

export type AccessorFn<TData extends RowData, TValue = unknown> = (
  originalRow: TData,
) => TValue;

export type RenderFn<TProps, TRender> = (props: TProps) => TRender;
