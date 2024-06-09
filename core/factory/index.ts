import { get } from "lodash/fp";
import { DeepValue } from "../../src/column-factory";
import { BaseColumnDef, SortingDirection } from "../column";
import { Renderer } from "../renderer";
import { AccessorFn, RenderFn, RowData } from "../types/types";
import { DeepKeys } from "../types/utils";
import { AccessorColumnDef } from "../column/accessor";
import { HeaderContext } from "../header";

export interface Capabilities<TRender = any> {
  render: TRender;
  // filter: TFilter;
}

type ColumnOpts = {
  // translationKey?: string;
  // columnOptions?: ColumnOptions;
};

type SortingOpts = {
  sortingKey?: string;
  defaultSorting?: SortingDirection;
  invertSorting?: boolean;
};

type RenderingOpts<TData, TValue, TRender> = {
  header?: RenderFn<HeaderContext<TData, TValue>, TRender>;
};

type BaseColumnOpts<
  TData,
  TValue,
  TCapabilities extends Capabilities,
> = ColumnOpts &
  SortingOpts &
  RenderingOpts<TData, TValue, TCapabilities["render"]>;

type AccessorColumnOpts<TData, TValue, TCapabilities extends Capabilities> = {
  id: string;
} & BaseColumnOpts<TData, TValue, TCapabilities>;

interface AccessorColumnConstructor<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  <TValue>(
    accessor: AccessorFn<TData, TValue>,
    opts: AccessorColumnOpts<TData, TValue, TCapabilities>,
  ): AccessorColumnDef<TData, TValue>;
  // &
  //   ColumnRenderingDef<TData, TValue, TCapabilities>;
}

const getDefaultColumnDef = (
  id: string | number,
  opts: BaseColumnOpts<any, any, any> | undefined,
): BaseColumnDef => {
  return {
    id,
    // translationKey: undefined,
    // columnOptions: DEFAULT_COLUMN_OPTIONS,
    sortingKey: String(id),
    invertSorting: false,
    defaultSorting: SortingDirection.Asc,
    ...(opts ?? {}),
  };
};

const accessorColumnConstructor = <
  TData extends RowData,
  TValue,
  TCapabilities extends Capabilities,
>(
  acc: AccessorFn<TData, TValue>,
  opts: AccessorColumnOpts<TData, TValue, TCapabilities>,
  // renderer?: Renderer<TData, TCapabilities["render"]>,
): AccessorColumnDef<TData, TValue> =>
  // &
  //   ColumnRenderingDef<TData, TValue, TCapabilities>
  {
    // type TRender = TCapabilities["render"];
    return {
      columnType: "accessor",
      accessorFn: acc,
      ...getDefaultColumnDef(opts.id, opts),
      // header: (props) => renderer?.header(props) as TRender,
    };
  };

const propertyColumnConstructor = <
  TData extends RowData,
  TAccessor extends DeepKeys<TData>,
  TCapabilities extends Capabilities,
>(
  propertyName: TAccessor,
  opts?: PropertyColumnOpts<TData, DeepValue<TData, TAccessor>, TCapabilities>,
  // renderer?: Renderer<TData, TCapabilities["render"]>,
): AccessorColumnDef<TData, DeepValue<TData, TAccessor>> =>
  // &
  /* ColumnRenderingDef<TData, DeepValue<TData, TAccessor>, TCapabilities>  */ {
    // type TRender = TCapabilities["render"];
    const id = opts?.id ?? propertyName;
    return {
      columnType: "accessor",
      ...getDefaultColumnDef(id, opts),
      accessorFn: (data) => get(propertyName, data),
      // header: (props) => renderer?.header(props) as TRender,
    };
  };

interface PropertyColumnOpts<
  TData extends RowData,
  TValue,
  TCapabilities extends Capabilities,
> extends BaseColumnOpts<TData, TValue, TCapabilities> {
  id?: string;
}

interface PropertyColumnConstructor<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  <TAccessor extends DeepKeys<TData>>(
    propertyName: TAccessor,
    opts?: PropertyColumnOpts<
      TData,
      DeepValue<TData, TAccessor>,
      TCapabilities
    >,
  ): AccessorColumnDef<TData, DeepValue<TData, TAccessor>>;
}

interface ColumnFactory<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  prop: PropertyColumnConstructor<TData, TCapabilities>;
  accessor: AccessorColumnConstructor<TData, TCapabilities>;
}

type Shape<T> = {};

export const shape = <T>(): Shape<T> => {
  return {};
};

interface ColumnFactoryOpts<TData extends RowData, TRender> {
  renderer?: Renderer<TData, TRender>;
}

export const columnFactory = <TData extends RowData>() => {
  return {
    create: <TRender>(
      opts?: ColumnFactoryOpts<TData, TRender>,
    ): ColumnFactory<
      TData,
      {
        render: unknown extends TRender ? never : TRender;
        // filter: unknown extends TFilter ? FilterItem[] : TFilter;
      }
    > => {
      return {
        prop: propertyColumnConstructor,
        accessor: accessorColumnConstructor,
      };
    },
  };
};
