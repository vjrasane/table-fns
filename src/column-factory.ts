export type RowData = unknown | object | any[];
type ComputeRange<
  N extends number,
  Result extends Array<unknown> = [],
> = Result["length"] extends N
  ? Result
  : ComputeRange<N, [...Result, Result["length"]]>;
type Index40 = ComputeRange<40>[number];
// Is this type a tuple?
type IsTuple<T> = T extends readonly any[] & { length: infer Length }
  ? Length extends Index40
    ? T
    : never
  : never;

// If this type is a tuple, what indices are allowed?
type AllowedIndexes<
  Tuple extends ReadonlyArray<any>,
  Keys extends number = never,
> = Tuple extends readonly []
  ? Keys
  : Tuple extends readonly [infer _, ...infer Tail]
    ? AllowedIndexes<Tail, Keys | Tail["length"]>
    : Keys;

type DeepKeysPrefix<
  T,
  TPrefix,
  TDepth extends any[],
> = TPrefix extends keyof T & (number | string)
  ? `${TPrefix}.${DeepKeys<T[TPrefix], [...TDepth, any]> & string}`
  : never;

export type DeepKeys<T, TDepth extends any[] = []> = TDepth["length"] extends 5
  ? never
  : unknown extends T
    ? string
    : T extends readonly any[] & IsTuple<T>
      ? AllowedIndexes<T> | DeepKeysPrefix<T, AllowedIndexes<T>, TDepth>
      : T extends any[]
        ? DeepKeys<T[number], [...TDepth, any]>
        : T extends Date
          ? never
          : T extends object
            ? (keyof T & string) | DeepKeysPrefix<T, keyof T, TDepth>
            : never;

export type DeepValue<T, TProp> =
  T extends Record<string | number, any>
    ? TProp extends `${infer TBranch}.${infer TDeepProp}`
      ? DeepValue<T[TBranch], TDeepProp>
      : T[TProp & string]
    : never;
export type AccessorFn<TData extends RowData, TValue = unknown> = (
  originalRow: TData,
  index: number,
) => TValue;
export interface AccessorKeyColumnDef<TData extends RowData, TValue = unknown> {
  id?: string;
  accessorKey: (string & {}) | keyof TData;
}

export interface AccessorFnColumnDef<TData extends RowData, TValue = unknown> {
  accessorFn: AccessorFn<TData, TValue>;
}
export type ColumnDefTemplate<TProps extends object> =
  | string
  | ((props: TProps) => any);

export interface Table<TData extends RowData> {}

export interface Header<TData extends RowData, TValue> {
  id: string;
  column: Column<TData, TValue>;
  index: number;
}

export interface Column<TData extends RowData, TValue = unknown> {
  id: string;
  accessorFn: AccessorFn<TData, TValue>;
}

export type StringOrTemplateHeader<TData, TValue> =
  | string
  | ColumnDefTemplate<HeaderContext<TData, TValue>>;

export interface StringHeaderIdentifier {
  header: string;
  id?: string;
}

export interface IdIdentifier<TData extends RowData, TValue> {
  id: string;
  header?: StringOrTemplateHeader<TData, TValue>;
}

type ColumnIdentifiers<TData extends RowData, TValue> =
  | IdIdentifier<TData, TValue>
  | StringHeaderIdentifier;

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type Getter<TValue> = <TTValue = TValue>() => NoInfer<TTValue>;
export interface ColumnDefBase<TData extends RowData, TValue = unknown> {
  getUniqueValues?: AccessorFn<TData, unknown[]>;
  footer?: ColumnDefTemplate<HeaderContext<TData, TValue>>;
  cell?: ColumnDefTemplate<CellContext<TData, TValue>>;
}
export interface IdentifiedColumnDef<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  id?: string;
  header?: StringOrTemplateHeader<TData, TValue>;
}

type DisplayColumnDef<TData extends RowData, TValue = unknown> = ColumnDefBase<
  TData,
  TValue
> &
  ColumnIdentifiers<TData, TValue>;

type ColumnOpts = {
  translationKey?: string;
  columnOptions?: ColumnOptions;
};

type SortingOpts = {
  sortingKey?: string;
  defaultSorting?: SortingDirection;
  invertSorting?: boolean;
};

type RenderingOpts<TData, TValue, TRender> = {
  header?: (props: HeaderContext<TData, TValue>) => TRender;
};

type BaseColumnOpts<
  TData,
  TValue,
  TCapabilities extends Capabilities,
> = ColumnOpts &
  SortingOpts &
  RenderingOpts<TData, TValue, TCapabilities["render"]>;

type AccessorFnColumnOpts<TData, TValue, TCapabilities extends Capabilities> = {
  id: string;
} & BaseColumnOpts<TData, TValue, TCapabilities>;

type AccessorKeyColumnOpts<
  TData,
  TValue,
  TCapabilities extends Capabilities,
> = {
  id?: string;
} & BaseColumnOpts<TData, TValue, TCapabilities>;

interface ColumnDef {
  id: string | number;
  translationKey: string | undefined;
  columnOptions: ColumnOptions;
}

export enum SortingDirection {
  Asc = "asc",
  Desc = "desc",
}

interface SortableColumnDef {
  invertSorting: boolean;
  defaultSorting: SortingDirection;
  sortingKey: string;
}

interface Capabilities<TRender = any> {
  render: TRender;
}
type RenderFn<TProps, TRender> = (props: TProps) => TRender;

interface ColumnRenderingDef<
  TData,
  TValue,
  TCapabilities extends Capabilities,
> {
  header: RenderFn<HeaderContext<TData, TValue>, TCapabilities["render"]>;
}

interface BaseColumnDef extends ColumnDef, SortableColumnDef {}

export interface AccessorColumnDef<TData extends RowData, TValue = unknown>
  extends BaseColumnDef {
  columnType: "accessor";
  accessorFn: AccessorFn<TData, TValue>;
}

interface AccessorFnColumnFactory<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  <TValue, TAccessor extends AccessorFn<TData, TValue>>(
    accessor: TAccessor,
    opts: AccessorFnColumnOpts<TData, TValue, TCapabilities>,
  ): AccessorColumnDef<TData, TValue> &
    ColumnRenderingDef<TData, TValue, TCapabilities>;
}

interface AccessorKeyColumnFactory<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  <TAccessor extends DeepKeys<TData>>(
    accessor: TAccessor,
    opts?: AccessorKeyColumnOpts<
      TData,
      DeepValue<TData, TAccessor>,
      TCapabilities
    >,
  ): AccessorColumnDef<TData, DeepValue<TData, TAccessor>> &
    ColumnRenderingDef<TData, DeepValue<TData, TAccessor>, TCapabilities>;
}

interface AccessorColumnFactory<
  TData extends RowData,
  TCapabilities extends Capabilities,
> extends AccessorFnColumnFactory<TData, TCapabilities>,
    AccessorKeyColumnFactory<TData, TCapabilities> {}

interface BaseColumnFactory<
  TData extends RowData,
  TCapabilities extends Capabilities,
> {
  accessor: AccessorColumnFactory<TData, TCapabilities>;
}

const DEFAULT_COLUMN_OPTIONS: ColumnOptions = {
  width: "auto",
};

const getDefaultColumnDef = (
  id: string | number,
  opts: BaseColumnOpts<any, any, any> | undefined,
): BaseColumnDef => {
  return {
    id,
    translationKey: undefined,
    columnOptions: DEFAULT_COLUMN_OPTIONS,
    sortingKey: String(id),
    invertSorting: false,
    defaultSorting: SortingDirection.Asc,
    ...(opts ?? {}),
  };
};

const accessorFnColFactory = <
  TData extends RowData,
  TValue,
  TCapabilities extends Capabilities,
>(
  acc: AccessorFn<TData, TValue>,
  opts: AccessorFnColumnOpts<TData, TValue, TCapabilities>,
  renderer?: Renderer<TData, TCapabilities["render"]>,
): AccessorColumnDef<TData, TValue> &
  ColumnRenderingDef<TData, TValue, TCapabilities> => {
  type TRender = TCapabilities["render"];
  return {
    columnType: "accessor",
    accessorFn: acc,
    ...getDefaultColumnDef(opts.id, opts),
    header: (props) => renderer?.header(props) as TRender,
  };
};

const accessorKeyColFactory = <
  TData extends RowData,
  TAccessor extends DeepKeys<TData>,
  TCapabilities extends Capabilities,
>(
  acc: TAccessor,
  opts?: AccessorKeyColumnOpts<
    TData,
    DeepValue<TData, TAccessor>,
    TCapabilities
  >,
  renderer?: Renderer<TData, TCapabilities["render"]>,
): AccessorColumnDef<TData, DeepValue<TData, TAccessor>> &
  ColumnRenderingDef<TData, DeepValue<TData, TAccessor>, TCapabilities> => {
  type TRender = TCapabilities["render"];
  const id = opts?.id ?? acc;
  return {
    columnType: "accessor",
    ...getDefaultColumnDef(id, opts),
    accessorFn: (data) => get(acc, data),
    header: (props) => renderer?.header(props) as TRender,
  };
};

type Renderer<TData, TRender> = {
  header: <TValue>(props: HeaderContext<TData, TValue>) => TRender;
};

const reactRenderer = <TData>(): Renderer<TData, React.ReactNode> => ({
  header: <TValue>(props: HeaderContext<TData, TValue>) => {
    return null;
  },
});

const stringRenderer = <TData>(): Renderer<TData, string | null> => ({
  header: <TValue>(props: HeaderContext<TData, TValue>) => {
    return String(props.header.id);
  },
});

// const createBaseColumnFactory = <TData extends RowData, TRender>(
//   renderer: Renderer<TData, TRender>
// ): BaseColumnFactory<TData, TRender> => {
//   return {
//     accessor: (acc: any, col?: any): any => {
//       if (typeof acc === 'function') return accessorFnColFactory(renderer, acc, col)
//       return accessorKeyColFactory( acc, col, )
//     },
//   }
// }

interface ColumnFactoryOpts<TData extends RowData, TRender> {
  renderer?: Renderer<TData, TRender>;
}

const columnFactory = <TData extends RowData>() => {
  return {
    create: <TRender>(
      opts?: ColumnFactoryOpts<TData, TRender>,
    ): BaseColumnFactory<
      TData,
      { render: unknown extends TRender ? never : TRender }
    > => {
      return {
        accessor: (acc: any, col?: any): any => {
          if (typeof acc === "function")
            return accessorFnColFactory(acc, col, opts?.renderer);
          return accessorKeyColFactory(acc, col, opts?.renderer);
        },
      };
    },
  };
};

const factory = columnFactory<TicketMetaDataFragment>().create({
  renderer: reactRenderer(),
});

const col = factory.accessor((data) => data.id, {
  id: "asd",
  header: () => null,
});
