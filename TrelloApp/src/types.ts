export type Id = string | number;

export type Column = {
  id?: Id;
  title: string;
  cards: Task[];
  order?: number
  board?: number
};

export type Task = {
  id?: Id;
  title: string;
  order: number | string;
  columnId: Id;
  content: string;
  board?: number;
};
