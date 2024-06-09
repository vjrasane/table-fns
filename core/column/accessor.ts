import { BaseColumnDef } from "../column";
import { AccessorFn } from "../types/types";

export interface AccessorColumnDef<TData, TValue = unknown>
  extends BaseColumnDef {
  columnType: "accessor";
  accessorFn: AccessorFn<TData, TValue>;
}
