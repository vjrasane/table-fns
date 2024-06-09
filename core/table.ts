import { RowData } from "../src/column-factory";
import { ColumnDef } from "./column";
import { Capabilities } from "./factory";
import { Header } from "./header";
import { Row, getRow } from "./row";

export interface TableContext<TData, TRender> {
  renderContent: () => TRender[];
}

export interface TableHeaderContext<TData, TRender> {
  renderRows: () => TRender[];
}

export interface TableHeaderRowContext<TData, TRender> {
  renderHeaders: () => TRender[];
}

export interface TableBodyContext<TData, TRender> {
  renderRows: () => TRender[];
}

export interface TableFooterContext<TData, TRender> {
  renderRows: () => TRender[];
}

export interface Table<TData, TRender> {
  headers: Header<TData, TRender>[];
  rows: Row<TData, TRender>[];
}

export const getTable = <
  TData extends RowData,
  TCapabilities extends Capabilities,
>(
  columnDefs: RenderableColumnDef<TData, TCapabilities>[],
  data: TData[],
): Table<TData, TCapabilities["render"]> => {
  type TRender = TCapabilities["render"];
  const rows: Row<TData, TRender>[] = data.map((data) =>
    getRow(columnDefs, data),
  );
  const headers: Header<TData, TRender>[] = columnDefs.map((col) =>
    getHeader(col),
  );
  return {
    headers,
    rows,
  };
};
