export interface Course {
    id: string;
    title: string;
    credits: number;
    weight: number;
    semester: number;
    graded: boolean;
    mandatory: boolean
};

export const grades = [
    { value: "1.0", label: "1.0" },
    { value: "1.3", label: "1.3" },
    { value: "1.7", label: "1.7" },
    { value: "2.0", label: "2.0" },
    { value: "2.3", label: "2.3" },
    { value: "2.7", label: "2.7" },
    { value: "3.0", label: "3.0" },
    { value: "3.3", label: "3.3" },
    { value: "3.7", label: "3.7" },
    { value: "4.0", label: "4.0" },
    { value: "0.0", label: "5.0 (Nicht bestanden)" },
] as const;

export const passFail = [
    { value: "1.0", label: "bestanden"},
    { value: "0.0", label: "fail"}
] as const;