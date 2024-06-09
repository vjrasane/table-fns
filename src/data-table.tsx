import { Checkbox, Radio } from 'antd'
import { ColumnOptions } from 'components/vihi-table/table'
import {
  invertSortingDirection,
  Sorting,
  cycleSorting,
  getSortingOrder,
  getInvertedSortingOrder,
} from 'functions/filters'
import { StateUpdate } from 'functions/helpers'
import { SortingDirection } from 'graphql/__generated__'
import { get, set, xorBy } from 'lodash/fp'
import { FunctionComponent, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tbody, Td, Th, Thead, ThSplitted, Tr, VihiTable } from '../vihi-table'
import { TableColumn } from './table-column'

export const DEFAULT_COLUMN_OPTIONS: ColumnOptions = {
  width: 'auto',
}
export interface Identifiable {
  id: string | number
}
export type Value = string | string[] | number | boolean | object | Date | null | undefined
export type SelectionProps<T> =
  | {
      selectionMode: 'none'
    }
  | {
      selectionMode: 'radio'
      selected: T | undefined
      setSelected: StateUpdate<T | undefined>
    }
  | {
      selectionMode: 'checkbox'
      selected: T[]
      setSelected: StateUpdate<T[]>
    }
export type ActionOptions<T> = FunctionComponent<{ item: T }>

const HeaderCheckboxSelector = <T extends Identifiable>({
  data,
  selected,
  setSelected,
}: PropsWithChildren<{
  data: T[]
  selected: T[]
  setSelected: StateUpdate<T[]>
}>) => {
  const allSelected = useMemo(
    () => !!data.length && data.every((d) => selected.some(({ id }) => id === d.id)),
    [data, selected]
  )
  const toggleSelectAll = () => setSelected(allSelected ? [] : data)

  return (
    <ThSplitted
      style={{ width: '40px' }}
      second={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Checkbox
            onClick={toggleSelectAll}
            disabled={!data.length}
            checked={allSelected}
            style={{ border: 'none', paddingTop: '1px', background: 'transparent' }}
          ></Checkbox>
        </div>
      }
    />
  )
}
const HeaderSelector = <T extends Identifiable>({
  data,
  ...props
}: PropsWithChildren<{
  data: T[]
}> &
  SelectionProps<T>) => {
  switch (props.selectionMode) {
    case 'checkbox': {
      const { selected, setSelected } = props
      return <HeaderCheckboxSelector data={data} selected={selected} setSelected={setSelected} />
    }
    case 'radio':
    case 'none':
    default:
      return <Th></Th>
  }
}

const BodyCheckboxSelector = <T extends Identifiable>({
  item,
  selected,
  setSelected,
}: PropsWithChildren<{ selected: T[]; setSelected: StateUpdate<T[]>; item: T }>) => {
  const toggleSelection = () =>
    setSelected((prev) => {
      const res = xorBy('id', prev, [item])
      return res
    })
  const isSelected = selected.some(({ id }) => item.id === id)
  return (
    <Td onClick={toggleSelection}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Checkbox
          style={{ border: 'none', paddingTop: '1px', background: 'transparent' }}
          checked={isSelected}
        ></Checkbox>
      </div>
    </Td>
  )
}

const BodyRadioSelector = <T extends Identifiable>({
  item,
  selected,
  setSelected,
}: PropsWithChildren<{
  item: T
  selected: T | undefined
  setSelected: StateUpdate<T | undefined>
}>) => {
  const toggleSelection = () =>
    setSelected((prev) => {
      return prev?.id === item.id ? undefined : item
    })
  const isSelected = selected?.id === item.id
  return (
    <Td onClick={toggleSelection}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Radio checked={isSelected}></Radio>
      </div>
    </Td>
  )
}

const BodySelector = <T extends Identifiable>({
  item,
  ...props
}: PropsWithChildren<{
  item: T
}> &
  SelectionProps<T>) => {
  switch (props.selectionMode) {
    case 'checkbox': {
      const { selected, setSelected } = props
      return <BodyCheckboxSelector item={item} selected={selected} setSelected={setSelected} />
    }
    case 'radio': {
      const { selected, setSelected } = props
      return <BodyRadioSelector item={item} selected={selected} setSelected={setSelected} />
    }
    case 'none':
    default:
      return <Td></Td>
  }
}

const DataTableHeaderColumn = <
  TData extends Identifiable,
  TFilter,
  TFilterValue,
  TColumn extends string,
  TCtx
>({
  column,
  filter,
  setFilter,
  sorting,
  setSorting,
  translationPrefix,
  context,
}: {
  column: TableColumn<TData, TFilter, any, TColumn, TFilterValue, TCtx>
  filter: TFilter | undefined
  setFilter: StateUpdate<TFilter | undefined>
  sorting: Sorting<TColumn>[] | undefined
  setSorting: StateUpdate<Sorting<TColumn>[] | undefined>
  translationPrefix?: string
  context: TCtx
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: translationPrefix })
  const { name, FilterInputComponent, defaultSorting = SortingDirection.Asc } = column
  const onToggleSorting = () => setSorting((prev) => cycleSorting(name, defaultSorting, prev))

  const onSetFilter = (value: TFilterValue) =>
    setFilter((prev: TFilter | undefined) =>
      column.setFilter ? column.setFilter(value, prev) : (set(name, value, prev ?? {}) as TFilter)
    )
  const columnSorting = useMemo(() => {
    if (column.invertSorting) return getInvertedSortingOrder(name, sorting)
    return getSortingOrder(name, sorting)
  }, [sorting, name, column.invertSorting])

  return (
    <ThSplitted
      key={name}
      first={column.translationKey ? t(column.translationKey) : t(name)}
      onClick={onToggleSorting}
      sorted={columnSorting}
      second={
        <FilterInputComponent
          filter={column.getFilter ? column.getFilter(filter) : get(name, filter)}
          setFilter={onSetFilter}
          context={context}
        />
      }
    />
  )
}

const DataTableHeader = <TData extends Identifiable, TFilter, TColumn extends string, TContext>({
  data,
  sorting,
  setSorting,
  filter,
  setFilter,
  translationPrefix,
  ...props
}: {
  data: TData[]
  filter: TFilter | undefined
  setFilter: StateUpdate<TFilter | undefined>
  sorting: Sorting<TColumn>[] | undefined
  setSorting: StateUpdate<Sorting<TColumn>[] | undefined>
  translationPrefix?: string
} & SelectionProps<TData> &
  ColumnProps<TData, TFilter, TColumn, TContext>) => {
  const context = 'context' in props ? props.context : (undefined as unknown as TContext)
  const columns = props.columns as Array<TableColumn<TData, TFilter, any, TColumn, any, TContext>>
  return (
    <Thead>
      <Tr>
        <HeaderSelector data={data} {...props} />
        {columns.map(
          <TValue extends Value, TFilterValue>(
            column: TableColumn<TData, TFilter, TValue, TColumn, TFilterValue, TContext>
          ) => (
            <DataTableHeaderColumn
              key={column.name}
              column={column}
              filter={filter}
              setFilter={setFilter}
              sorting={sorting}
              setSorting={setSorting}
              translationPrefix={translationPrefix}
              context={context}
            />
          )
        )}
        <Th></Th>
      </Tr>
    </Thead>
  )
}
export type WithoutContextColumnProps<TData, TFilter, TColumn extends string> = {
  columns: readonly TableColumn<TData, TFilter, any, TColumn, any, undefined>[]
}

export type WithContextColumnProps<TData, TFilter, TColumn extends string, TContext> = {
  columns: readonly TableColumn<TData, TFilter, any, TColumn, any, TContext>[]
  context: TContext
}

export type ColumnProps<TData, TFilter, TColumn extends string, TContext> =
  | WithoutContextColumnProps<TData, TFilter, TColumn>
  | WithContextColumnProps<TData, TFilter, TColumn, TContext>

export type TableProps<TData, TFilter, TColumn extends string, TContext> = {
  data: TData[]
  translationPrefix?: string
  getLink?: (item: TData) => string
  actionOptions?: ActionOptions<TData>
  style?: React.CSSProperties
} & SelectionProps<TData> &
  ColumnProps<TData, TFilter, TColumn, TContext>

export type DataTableProps<TData, TFilter, TColumn extends string, TContext> = {
  filter: TFilter | undefined
  setFilter: StateUpdate<TFilter | undefined>
  sorting: Sorting<TColumn>[] | undefined
  setSorting: StateUpdate<Sorting<TColumn>[] | undefined>
} & TableProps<TData, TFilter, TColumn, TContext>

export const DataTable = <
  TData extends Identifiable,
  TFilter extends object,
  TColumn extends string,
  TContext
>({
  style,
  actionOptions: ActionOptions,
  getLink,
  ...props
}: DataTableProps<TData, TFilter, TColumn, TContext>) => {
  const { data } = props
  const columns = props.columns as Array<TableColumn<TData, TFilter, any, TColumn, any, TContext>>
  const selectedItems: TData[] = useMemo(() => {
    switch (props.selectionMode) {
      case 'none':
        return []
      case 'checkbox':
        return props.selected
      case 'radio':
        return props.selected ? [props.selected] : []
    }
  }, [props])
  const columnOptions: ColumnOptions[] = useMemo(
    () => [
      props.selectionMode !== 'none'
        ? { width: '50px', justifyContent: 'center' }
        : { width: '0px' },
      ...columns.map(({ columnOptions }) => columnOptions ?? DEFAULT_COLUMN_OPTIONS),
      ActionOptions ? { width: '100px' } : { width: '0px' },
    ],
    [props.selectionMode, columns, ActionOptions]
  )
  return (
    <VihiTable columnOptions={columnOptions} style={style}>
      <DataTableHeader {...props} />
      <Tbody>
        {data.map((item) => {
          const isSelected = selectedItems?.some(({ id }) => item.id === id)
          return (
            <Tr key={item.id} showPointer isActive={isSelected}>
              <BodySelector item={item} {...props} />
              {columns.map(
                <TValue extends Value>({
                  name,
                  ValueComponent,
                  getValue,
                }: TableColumn<TData, TFilter, TValue, TColumn, any, TContext>) => {
                  const value: TValue = getValue ? getValue(item) : get(name, item)
                  const link = selectedItems?.length ? undefined : getLink?.(item)
                  return (
                    <Td key={name} to={link}>
                      {ValueComponent ? (
                        <ValueComponent value={value} />
                      ) : value ? (
                        String(value)
                      ) : (
                        value
                      )}
                    </Td>
                  )
                }
              )}
              <Td>{ActionOptions && <ActionOptions item={item} />}</Td>
            </Tr>
          )
        })}
      </Tbody>
    </VihiTable>
  )
}
