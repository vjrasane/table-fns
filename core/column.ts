import { get } from "lodash/fp";
import { Renderer } from "./renderer";
import { AccessorFn, DeepKeys, DeepValue, RowData } from "./types/types";

// export type StringOrTemplateHeader<TData, TValue> =
//   | string
//   | ColumnDefTemplate<HeaderContext<TData, TValue>>;

export interface StringHeaderIdentifier {
  header: string;
  id?: string;
}

// export interface IdIdentifier<TData extends RowData, TValue> {
//   id: string;
//   header?: StringOrTemplateHeader<TData, TValue>;
// }

// type ColumnIdentifiers<TData extends RowData, TValue> =
//   | IdIdentifier<TData, TValue>
//   | StringHeaderIdentifier;

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type Getter<TValue> = <TTValue = TValue>() => NoInfer<TTValue>;
export interface ColumnDefBase<TData extends RowData, TValue = unknown> {
  getUniqueValues?: AccessorFn<TData, unknown[]>;
  // footer?: ColumnDefTemplate<HeaderContext<TData, TValue>>;
  // cell?: ColumnDefTemplate<CellContext<TData, TValue>>;
}
export interface IdentifiedColumnDef<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  id?: string;
  // header?: StringOrTemplateHeader<TData, TValue>;
}

// type DisplayColumnDef<TData extends RowData, TValue = unknown> = ColumnDefBase<
//   TData,
//   TValue
// > &
//   ColumnIdentifiers<TData, TValue>;

export enum SortingDirection {
  Asc = "asc",
  Desc = "desc",
}

interface SortableColumnDef {
  invertSorting: boolean;
  defaultSorting: SortingDirection;
  sortingKey: string;
}

type RenderFn<TProps, TRender> = (props: TProps) => TRender;

// interface ColumnRenderingDef<
//   TData,
//   TValue,
//   TCapabilities extends Capabilities,
// > {
//   // header: RenderFn<HeaderContext<TData, TValue>, TCapabilities["render"]>;
// }

export interface BaseColumnDef extends SortableColumnDef {
  id: string | number;
}

export interface AccessorColumnDef<TData extends RowData, TValue = unknown>
  extends BaseColumnDef {
  columnType: "accessor";
  accessorFn: AccessorFn<TData, TValue>;
}

export type ColumnDef<
  TData extends RowData,
  TValue = unknown,
> = AccessorColumnDef<TData, TValue>;

// const stringRenderer = <TData>(): Renderer<TData, string | null> => ({
//   header: <TValue>(props: HeaderContext<TData, TValue>) => {
//     return String(props.header.id);
//   },
// });

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
