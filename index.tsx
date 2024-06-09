import { FunctionComponent } from "react";
import React from "react";
import { ColumnDef } from "./core/column";
import { reactRenderer } from "./renderer/react";
import { RowData } from "./core/types/types";
import { columnFactory, shape } from "./core/factory";
import { Table } from "./core/table";

type User = {
  id: number;
  username: string;
  friends: User[];
};

const t = columnFactory<User>().create({
  renderer: reactRenderer(),
  filter: shape<{ id: string }>(),
});

const columns = [
  t.prop("id"),
  t.prop("username"),
  t.accessor((user) => user.friends.length, { id: "friendCount" }),
];

interface UseTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

const useTable = <TData extends RowData>({
  columns,
  data,
}: UseTableProps<TData>): Table<TData, React.ReactNode> => {
  throw new Error();
};

// declare const table: Table<{}[], React.ReactNode>;

const users: User[] = [];
const Component: FunctionComponent<{}> = ({}) => {
  const table = useTable({ columns, data: users });
  return (
    <div>
      <table>
        <thead>
          <tr>
            {table.headers.map(({ render: Header, context }) => (
              <Header {...context} />
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr>
              {row.cells.map(({ render: Cell, context }) => (
                <Cell {...context} />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot></tfoot>
      </table>
    </div>
  );
};
