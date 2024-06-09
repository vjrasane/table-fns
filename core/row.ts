import { RowData } from "./types/types";

export interface Row<TData extends RowData> {
  id: string;
}

export interface RowContext<TData extends RowData, TRender> {
  renderCells: () => TRender[];
}
