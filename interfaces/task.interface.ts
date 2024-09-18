export interface Task {
  title: String;
  content: String;
  createdBy: String;
  label: [];
  timeStart: Date;
  timeEnd: Date;
  image: string;
  backgroundColor: string;
  status: string;
}

export interface AllTask {
  status: String;
  statusCode: String;
  list: {}[];
}
