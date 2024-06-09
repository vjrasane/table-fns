import { noop } from "lodash/fp";
import { CellContext } from "./cell";
import { ColumnDef } from "./column";
import { HeaderContext } from "./header";
import { RowContext } from "./row";
import {
  TableBodyContext,
  TableContext,
  TableFooterContext,
  TableHeaderContext,
  TableHeaderRowContext,
} from "./table";
import { RowData } from "./types";

export const renderStringValue = (value: any): string => {
  if (Array.isArray(value)) return value.map(renderStringValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (value == null) return "";
  return String(value);
};

export interface Renderer<TData extends RowData, TRender> {
  table: (props: TableContext<TData, TRender>) => TRender;
  thead: (props: TableHeaderContext<TData, TRender>) => TRender;
  headerRow: (props: TableHeaderRowContext<TData, TRender>) => TRender;
  tbody: (props: TableBodyContext<TData, TRender>) => TRender;
  tfoot: (props: TableFooterContext<TData, TRender>) => TRender;
  header: <TValue, TFilter, TSorting>(
    props: HeaderContext<TData, TValue, TFilter, TSorting>,
  ) => TRender;
  cell: <TValue>(props: CellContext<TData, TValue>) => TRender;
  row: (props: RowContext<TData, TRender>) => TRender;
}

type Entries<T> = {
  [P in keyof T]: [P, T[P]];
}[keyof T];

type DataItem<TData extends RowData> = TData extends (infer T)[]
  ? T
  : TData extends object
    ? Entries<TData>
    : unknown;

const toDataArray = <TData extends RowData>(data: TData): DataItem<TData>[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === "object")
    return Object.entries(data as object) as DataItem<TData>[];
  return data as DataItem<TData>[];
};

export const render = <TData extends RowData, TRender>(
  renderer: Renderer<TData, TRender>,
  columns: ColumnDef<DataItem<TData>, unknown>[],
  data: TData,
): TRender => {
  type TItem = DataItem<TData>;

  const renderHeaders = () =>
    columns.map((c) =>
      renderer.header({
        id: String(c.id),
        getFilter: noop,
        setFilter: noop,
        getSorting: noop,
        setSorting: noop,
      }),
    );

  /* TODO: header rows */
  const renderHeaderRows = () => [
    renderer.headerRow({
      renderHeaders,
    }),
  ];

  const renderDataCells = (item: TItem) =>
    columns.map((c, cindx) =>
      renderer.cell({
        value: c.accessorFn(item, cindx),
      }),
    );

  const renderBodyRows = () =>
    toDataArray(data).map((item) =>
      renderer.row({
        renderCells: () => renderDataCells(item),
      }),
    );

  const renderTableContent = () => [
    renderer.thead({
      renderRows: renderHeaderRows,
    }),
    renderer.tbody({
      renderRows: renderBodyRows,
    }),
    renderer.tfoot({
      renderRows: () => [],
    }),
  ];

  return renderer.table({
    renderContent: renderTableContent,
  });
};
