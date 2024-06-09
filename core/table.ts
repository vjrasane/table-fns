export interface TableContext<TData, TRender> {
  renderContent: () => TRender[];
}

export interface TableHeaderContext<TData, TRender> {
  renderRows: () => TRender[];
}

export interface TableHeaderRowContext<TData, TRender> {
  renderHeaders: () => TRender[];
}

export interface TableBodyContext<TData, TRender> {
  renderRows: () => TRender[];
}

export interface TableFooterContext<TData, TRender> {
  renderRows: () => TRender[];
}
