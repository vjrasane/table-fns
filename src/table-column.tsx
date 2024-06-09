import { Popover, Select } from 'antd'
import { DateRangePicker } from 'components/date-range-picker'
import { FormatDate } from 'components/format-date/format-date.component'
import { Input, KTKInput } from 'components/input/input.component'
import { NumberRangeInput } from 'components/number-range-input'
import { CustomFieldMultiSelect } from 'components/select-multiple-custom-field'
import { SelectMultipleStatus } from 'components/select-multiple-status'
import SelectMultipleUsers from 'components/select-multiple-users/select-multiple-users.component'
import { Space } from 'components/space/space.component'
import { TicketStatus } from 'components/ticket-status'
import { ColumnOptions } from 'components/vihi-table/table'
import { isDateBetween, isNumberBetween } from 'functions/filters'
import { DateBetween, NumberBetween, SortingDirection } from 'graphql/__generated__'
import { truncate } from 'lodash'
import { first, get, set } from 'lodash/fp'
import {
  CATEGORIES_CUSTOM_FIELD,
  SEVERITY_CUSTOM_FIELD,
} from 'model/custom-fields/custom-fields-names'
import { PredefinedQueueName, PREDEFINED_QUEUES } from 'model/queues/queues-model'
import { useTranslation } from 'react-i18next'
import { Value } from './data-table'
import { SelectMultipleQueue } from 'components/select-queue/select-queue.component'
import { ReactElement } from 'react'

export type TableValueProps<TValue extends Value> = {
  value: TValue
}

type TableFilterInputProps<TFilterValue, TContext> = {
  filter: TFilterValue
  setFilter: (filter: TFilterValue) => void
  context: TContext
}

export type FilterDef<
  TData,
  TFilter,
  TValue extends Value,
  TColumn extends string,
  TFilterValue
> = {
  name: TColumn
  getValue?: (value: TData) => TValue
  filterValue?: (value: TValue, filter: NonNullable<TFilterValue>) => boolean
  getFilter?: <F_ extends TFilter>(filter: F_ | undefined) => TFilterValue
  setFilter?: <F_ extends TFilter>(value: TFilterValue, filter: F_ | undefined) => F_
}

export type TableColumn<
  TData,
  TFilter,
  TValue extends Value,
  TColumn extends string = string,
  TFilterValue = TValue | undefined,
  TContext = undefined
> = {
  translationKey?: string
  columnOptions?: ColumnOptions
  ValueComponent?: (props: TableValueProps<TValue>) => ReactElement<any, any> | null
  FilterInputComponent: <C_ extends TContext>(
    props: TableFilterInputProps<TFilterValue, C_>
  ) => ReactElement<any, any> | null
  invertSorting?: boolean
  defaultSorting?: SortingDirection
} & FilterDef<TData, TFilter, TValue, TColumn, TFilterValue>

export const UpdatedAtColumn: TableColumn<
  { updatedAt: string | Date },
  { updatedAtBetween?: DateBetween },
  string | Date,
  'updatedAt',
  DateBetween | undefined
> = {
  name: 'updatedAt',
  ValueComponent: ({ value }) => <FormatDate date={new Date(value)} />,
  FilterInputComponent: ({ filter, setFilter }) => (
    <DateRangePicker value={filter} onChange={setFilter} />
  ),
  filterValue: (value, filter) => isDateBetween(new Date(value), filter),
  setFilter: set('updatedAtBetween'),
  getFilter: get('updatedAtBetween'),
  invertSorting: true,
  defaultSorting: SortingDirection.Desc,
  columnOptions: { width: '175px' },
}
export const CreatedAtColumn: TableColumn<
  { createdAt: string | Date },
  { createdAtBetween?: DateBetween },
  string | Date,
  'createdAt',
  DateBetween | undefined
> = {
  name: 'createdAt',
  ValueComponent: ({ value }) => <FormatDate date={new Date(value)} />,
  FilterInputComponent: ({ filter, setFilter }) => (
    <DateRangePicker value={filter} onChange={setFilter} />
  ),
  filterValue: (value, filter) => isDateBetween(new Date(value), filter),
  setFilter: set('createdAtBetween'),
  getFilter: get('createdAtBetween'),
  invertSorting: true,
  defaultSorting: SortingDirection.Desc,
  columnOptions: { width: '175px' },
}

export const IdColumn: TableColumn<
  { id: number },
  { ids?: number[] },
  number,
  'id',
  number[] | undefined
> = {
  name: 'id',
  FilterInputComponent: ({ filter, setFilter }) => (
    <KTKInput
      regex={'only-digits'}
      value={first(filter)}
      onChange={(value: number | undefined) => setFilter(value ? [value] : undefined)}
    />
  ),
  setFilter: set('ids'),
  getFilter: get('ids'),
  columnOptions: { width: '60px', justifyContent: 'center' },
}

export const SubjectColumn: TableColumn<
  { subject: string },
  { subject?: string },
  string,
  'subject'
> = {
  name: 'subject',
  FilterInputComponent: ({ filter, setFilter }) => (
    <Input allowClear={true} value={filter} onChange={(e) => setFilter(e.target.value)} />
  ),
  columnOptions: { width: 'minmax(100px, auto)' },
}

export const PriorityColumn: TableColumn<
  { priority: number | null },
  { priority?: NumberBetween },
  number,
  'priority',
  NumberBetween | undefined
> = {
  name: 'priority',
  translationKey: 'prio',
  FilterInputComponent: ({ filter, setFilter }) => (
    <NumberRangeInput value={filter} onChange={setFilter} />
  ),
  ValueComponent: ({ value }) => <>{value?.toFixed(2) ?? '-'}</>,
  filterValue: isNumberBetween,
  columnOptions: { width: '60px', justifyContent: 'center' },
}

export const StatusColumn = (
  states: readonly string[]
): TableColumn<
  { status: string },
  { status?: string[] },
  string,
  'status',
  string[] | undefined
> => ({
  name: 'status',
  FilterInputComponent: ({ filter, setFilter }) => (
    <SelectMultipleStatus states={states} value={filter} onChange={setFilter} />
  ),
  ValueComponent: ({ value }) => <TicketStatus status={value} />,
  columnOptions: { width: '100px', justifyContent: 'center' },
})

export const QueueColumn: TableColumn<
  { queue: string },
  { queue?: string[] },
  string,
  'queue',
  string[] | undefined,
  { queues: string[] }
> = {
  name: 'queue',
  FilterInputComponent: ({ filter, setFilter, context }) => (
    <SelectMultipleQueue allowed={context.queues} value={filter} onChange={setFilter} />
  ),
  columnOptions: { width: 'minmax(120px, auto)' },
}

export const CategoryColumn = (
  queues: readonly PredefinedQueueName[]
): TableColumn<
  { categories: string[] },
  { categories?: string[] },
  string[],
  'categories',
  string[] | undefined
> => ({
  name: 'categories',
  FilterInputComponent: ({ filter, setFilter }) => (
    <CustomFieldMultiSelect
      value={filter}
      onChange={setFilter}
      customFieldName={CATEGORIES_CUSTOM_FIELD}
      queues={queues}
    />
  ),
  ValueComponent: ({ value }) => (
    <Space direction="column">
      {value && value.map((category) => <Space key={category}>{category}</Space>)}
    </Space>
  ),
  columnOptions: { width: 'minmax(80px, 150px)' },
})

export const SeverityColumn: TableColumn<
  { severity: string | null },
  { severity?: string[] },
  string | null,
  'severity',
  string[] | undefined
> = {
  name: 'severity',
  FilterInputComponent: ({ filter, setFilter }) => (
    <CustomFieldMultiSelect
      value={filter}
      customFieldName={SEVERITY_CUSTOM_FIELD}
      queues={PREDEFINED_QUEUES}
      onChange={setFilter}
    />
  ),
  ValueComponent: ({ value }) => <div>{value ? value : undefined}</div>,
  columnOptions: { width: '80px', justifyContent: 'center' },
}

interface AssigneeColumnValue {
  username: string
  fullName: string | null
}

export const AssigneeColumn: TableColumn<
  { assignee: AssigneeColumnValue | null },
  { assigneeUsernames?: string[] },
  AssigneeColumnValue | null,
  'assignee.fullName',
  string[] | undefined
> = {
  name: 'assignee.fullName',
  translationKey: 'assignee.item',
  FilterInputComponent: ({ filter, setFilter }) => (
    <SelectMultipleUsers value={filter} onChange={setFilter} />
  ),
  ValueComponent: ({ value }) => <>{value?.fullName ?? value?.username}</>,
  getValue: get('assignee'),
  getFilter: get('assigneeUsernames'),
  setFilter: set('assigneeUsernames'),
  filterValue: (value, filter) => !!value && filter.includes(value?.username),
  columnOptions: { width: '180px' },
}

interface ReporterColumnValue {
  emailAddress: string | null
  fullName: string | null
}

export const ReporterColumn: TableColumn<
  {
    reporter: ReporterColumnValue | null
  },
  { reporter?: { emailAddress?: string } },
  ReporterColumnValue | null,
  'reporter.emailAddress',
  string | undefined
> = {
  name: 'reporter.emailAddress',
  translationKey: 'reporter.item',
  FilterInputComponent: ({ filter, setFilter }) => (
    <Input allowClear={true} value={filter} onChange={(e) => setFilter(e.target.value)} />
  ),
  ValueComponent: ({ value }) => (
    <>
      {value?.fullName} {value?.emailAddress}
    </>
  ),
  getValue: get('reporter'),
  getFilter: get(['reporter', 'emailAddress']),
  setFilter: set(['reporter', 'emailAddress']),
  filterValue: (value, filter) => !!value?.emailAddress && filter.includes(value?.emailAddress),
  columnOptions: { width: 'minmax(150px, auto)' },
}

export const BodyColumn: TableColumn<
  { body: string | null },
  { body?: string },
  string | null,
  'body'
> = {
  name: 'body',
  FilterInputComponent: ({ filter, setFilter }) => (
    <Input allowClear value={filter ?? undefined} onChange={(e) => setFilter(e.target.value)} />
  ),
  ValueComponent: ({ value }) => (
    <Popover
      trigger={'hover'}
      content={<div style={{ maxWidth: '400px', width: '400px' }}>{value}</div>}
    >
      {value ? truncate(value, { length: 200 }) : ''}
    </Popover>
  ),
}

export const HasFileAttachmentsColumn: TableColumn<
  {
    hasFileAttachments: boolean
  },
  { hasFileAttachments?: boolean },
  boolean,
  'hasFileAttachments'
> = {
  name: 'hasFileAttachments',
  FilterInputComponent: ({ filter, setFilter }) => {
    const { t } = useTranslation()
    return (
      <Select
        allowClear
        value={filter}
        options={[
          { value: true, label: t('yes') },
          { value: false, label: t('no') },
        ]}
        onChange={setFilter}
      />
    )
  },
  ValueComponent: ({ value }) => {
    const { t } = useTranslation()
    return <>{value ? t('yes') : t('no')}</>
  },
}
