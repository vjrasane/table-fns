import { RenderableColumnDef } from "./column";
import { Capabilities } from "./factory";

export interface HeaderContext<
  TData,
  TValue,
  TFilter = unknown,
  TSorting = unknown,
> {
  id: string;

  getFilter: () => TFilter;
  setFilter: (filter: TFilter) => void;

  getSorting: () => TSorting;
  setSorting: (sorting: TSorting) => void;
  // /**
  //  * An instance of a column.
  //  */
  // column: Column<TData, TValue>;
  // /**
  //  * An instance of a header.
  //  */
  // header: Header<TData, TValue>;
  // /**
  //  * The table instance.
  //  */
  // table: Table<TData>;
}

export interface Header<TData, TRender, TValue = unknown, TFilter = unknown> {
  render: (props: HeaderContext<TData, TValue, TFilter, unknown>) => TRender;
  context: HeaderContext<TData, TValue, TFilter, unknown>;
}

export const getHeader = <TData, TCapabilities extends Capabilities, TValue>(
  columnDef: RenderableColumnDef<TData, TCapabilities, TValue>,
): Header<TData, TRender, TValue> => {};
