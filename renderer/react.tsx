import React, { FunctionComponent } from "react";
import { Renderer, renderStringValue } from "../core/renderer";
import { CellContext } from "../core/cell";
import { RowContext } from "../core/row";
import { HeaderContext } from "../core/header";
import {
  TableBodyContext,
  TableContext,
  TableFooterContext,
  TableHeaderContext,
} from "../core/table";

export const reactRenderer = <TData,>(): Renderer<TData, React.ReactNode> => ({
  table: (props: TableContext<TData, React.ReactNode>) => (
    <table> {props.renderContent()} </table>
  ),
  thead: (props: TableHeaderContext<TData, React.ReactNode>) => (
    <thead>{props.renderRows()}</thead>
  ),
  tbody: (props: TableBodyContext<TData, React.ReactNode>) => (
    <thead>{props.renderRows()}</thead>
  ),
  tfoot: (props: TableFooterContext<TData, React.ReactNode>) => (
    <thead>{props.renderRows()}</thead>
  ),
  header: <TValue, TFilter, TSorting>(
    props: HeaderContext<TData, TValue, TFilter, TSorting>,
  ) => <th>{props.id}</th>,
  row: (props: RowContext<TData, React.ReactNode>) => (
    <tr>{props.renderCells()}</tr>
  ),
  cell: <TValue,>(props: CellContext<TData, TValue>) => (
    <td>{renderStringValue(props.value)}</td>
  ),
});
