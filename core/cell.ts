import { RenderableColumnDef } from "./column";
import { Capabilities } from "./factory";
import { RowData } from "./types/types";
import { Getter } from "./types/utils";

export interface CellContext<TData extends RowData, TValue> {
  id: string;
  getValue: () => TValue;
}

export interface Cell<TData, TRender, TValue = unknown> {
  render: (props: CellContext<TData, TValue>) => TRender;
  context: CellContext<TData, TValue>;
}

export const getCell = <
  TData extends RowData,
  TCapabilities extends Capabilities,
  TValue,
>(
  columnDef: RenderableColumnDef<TData, TCapabilities, TValue>,
  data: TData,
): Cell<TData, TCapabilities["render"], TValue> => {
  type TRender = TCapabilities["render"];

  const context: CellContext<TData, TValue> = {
    id: String(columnDef.id), // TODO:
    getValue: () => columnDef.accessorFn(data),
  };

  const render = (props: CellContext<TData, TValue>): TRender => {
    return columnDef.cell(props);
  };

  return {
    render,
    context,
  };
};
