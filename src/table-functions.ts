import { Filter, Sorting } from "functions/filters";
import { get, orderBy } from "lodash/fp";
import { Value } from "./data-table";
import { FilterDef } from "./table-column";

export const sortData = <TData, TColumn extends string>(
  sorting: Sorting<TColumn>[] | undefined,
  data: TData[],
): TData[] => {
  return orderBy<TData>(
    sorting?.map(({ fieldName }) => fieldName) ?? [],
    sorting?.map(({ direction }) => direction) ?? [],
    data,
  );
};

export type FilterFn<TData, TFilter> = (
  item: TData,
  filter: TFilter,
) => boolean | undefined;

export const getFilterFn = <
  TData,
  TFilter,
  TValue extends Value,
  TColumn extends string,
  TFilterValue,
>(
  filterDef: FilterDef<TData, TFilter, TValue, TColumn, TFilterValue>,
): FilterFn<TData, TFilter> => {
  const { name, getFilter, getValue, filterValue } = filterDef;
  return (item: TData, filter: TFilter) => {
    const value = getValue ? getValue(item) : get(name, item);
    const filter_ = getFilter ? getFilter(filter) : get(name, filter);

    if (filter_ == null) return true;
    if (filterValue) return filterValue(value, filter_);
    if (Array.isArray(filter_)) {
      if (!filter_.length) return true;
      if (Array.isArray(value)) {
        return value.some((v) => filter_.includes(v));
      }
      return filter_.includes(value);
    }
    return String(value).toLowerCase().includes(String(filter_).toLowerCase());
  };
};

export const filterData = <TData, TFilter>(
  filterFns: FilterFn<TData, TFilter>[],
  filter: TFilter,
  data: TData[],
): TData[] => {
  return data.filter((item) => filterFns.every((fn) => fn(item, filter)));
};
