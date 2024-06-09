export interface HeaderContext<TData, TValue, TFilter, TSorting> {
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
