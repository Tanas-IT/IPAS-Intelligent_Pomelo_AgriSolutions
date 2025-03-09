type NestedKey<T> = T extends object
  ? { [K in keyof T]: K | `${K & string}.${NestedKey<T[K]> & string}` }[keyof T]
  : never;

export interface TableColumn<T> {
  header: string;
  field: NestedKey<T>;
  width?: number;
  isSort?: boolean;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}
