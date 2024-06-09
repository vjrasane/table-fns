import { RowData } from "./types";

export interface Cell<TData extends RowData, TValue> {
  id: string;
}

export interface CellContext<TData extends RowData, TValue> {
  value: TValue;
  // export interface CellContext<TData extends RowData, TValue> {
  //   cell: Cell<TData, TValue>;
  //   column: Column<TData, TValue>;
  //   getValue: Getter<TValue>;
  //   renderValue: Getter<TValue | null>;
  //   row: Row<TData>;
  //   table: Table<TData>;
  // }
}
