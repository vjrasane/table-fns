import { Cell, getCell } from "./cell";
import { RenderableColumnDef } from "./column";
import { Capabilities } from "./factory";
import { RowData } from "./types/types";

export interface RowContext<TData extends RowData, TRender> {
  renderCells: () => TRender[];
}

export interface Row<TData, TRender> {
  cells: Cell<TData, TRender>[];
}

export const getRow = <TData, TCapabilities extends Capabilities, TValue>(
  columnDefs: RenderableColumnDef<TData, TCapabilities, TValue>[],
  data: TData,
): Row<TData, TCapabilities["render"]> => {
  type TRender = TCapabilities["render"];
  const cells: Cell<TData, TRender>[] = columnDefs.map((col) =>
    getCell(col, data),
  );
  return {
    cells,
  };
};
