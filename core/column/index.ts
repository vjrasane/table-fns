import { CellContext } from "../cell";
import { Capabilities } from "../factory";
import { HeaderContext } from "../header";
import { RenderFn, RowData } from "../types/types";
import { AccessorColumnDef } from "./accessor";

export enum SortingDirection {
  Asc = "asc",
  Desc = "desc",
}

interface SortingDef {
  invertSorting: boolean;
  defaultSorting: SortingDirection;
  sortingKey: string;
}

export type FilterItem<
  TKey extends string | number | symbol = string,
  TFilterValue = any,
> = {
  id: TKey;
  value: TFilterValue;
};

interface FilterDef<
  TFilter extends object | FilterItem[] = FilterItem[],
  TFilterValue = unknown,
> {
  getFilter: (filter: TFilter) => TFilterValue;
  setFilter: (flter: TFilter, value: TFilterValue) => TFilter;
}

interface RenderingDef<TData, TValue, TCapabilities extends Capabilities> {
  header: RenderFn<HeaderContext<TData, TValue>, TCapabilities["render"]>;
  cell: RenderFn<CellContext<TData, TValue>, TCapabilities["render"]>;
}

export interface BaseColumnDef extends SortingDef {
  id: string | number;
}

export type ColumnDef<
  TData extends RowData,
  TValue = unknown,
> = AccessorColumnDef<TData, TValue>;

export type FullColumnDef<
  TData extends RowData,
  TCapabilities extends Capabilities,
  TFilter extends object | FilterItem[] = FilterItem[],
  TValue = unknown,
  TFilterValue = unknown,
> = ColumnDef<TData, TValue> &
  FilterDef<TFilter, TFilterValue> &
  RenderingDef<TData, TValue, TCapabilities>;
