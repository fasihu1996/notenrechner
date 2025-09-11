export interface Course {
  id: number;
  title: string;
  credits: number;
  weight: number;
  semester: number;
  mandatory: boolean;
}

export const grades = [
  { value: 1.0, label: "1.0" },
  { value: 1.3, label: "1.3" },
  { value: 1.7, label: "1.7" },
  { value: 2.0, label: "2.0" },
  { value: 2.3, label: "2.3" },
  { value: 2.7, label: "2.7" },
  { value: 3.0, label: "3.0" },
  { value: 3.3, label: "3.3" },
  { value: 3.7, label: "3.7" },
  { value: 4.0, label: "4.0" },
  { value: -1, label: "unselect" },
] as const;
