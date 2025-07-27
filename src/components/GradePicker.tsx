"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Course, grades, passFail } from "@/types/course";

interface GradePickerProps {
  course: Course;
  onGradeChange?: (courseId: string, grade: number | null) => void;
}

export default function GradePicker({
  course,
  onGradeChange,
}: GradePickerProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);

    let gradeNumber: number | null = null;

    if (course.graded) {
      // For graded courses, use the actual grade value
      gradeNumber = value ? parseFloat(value) : null;
    } else {
      // For pass/fail courses, convert to numeric values
      // Pass = 4.0 (minimum passing grade), Fail = 5.0 (failing grade)
      // Or you might want to exclude pass/fail courses from GPA calculation entirely
      if (value === "pass") {
        gradeNumber = 1.0; // or null if you don't want to include in GPA
      } else if (value === "fail") {
        gradeNumber = null;
      }
    }

    onGradeChange?.(course.id, gradeNumber);
  };

  const options = course.graded ? grades : passFail;
  const placeholder = course.graded
    ? "Wähle eine Note..."
    : "Wähle Bestanden/Nicht bestanden...";

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <CardTitle className='text-lg font-semibold'>
            {course.title}
          </CardTitle>
          <div className='flex flex-shrink-0 gap-2'>
            <Badge variant='secondary'>{course.credits} ECTS</Badge>
            <Badge variant='outline'>Gewichtung: {course.weight}x</Badge>
            <Badge variant={course.graded ? "default" : "destructive"}>
              {course.graded ? "Benotet" : "Unbenotet"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <label
            htmlFor={`grade-${course.id}`}
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {course.graded ? "Note auswählen" : "Ergebnis auswählen"}
          </label>
          <Select value={selectedGrade} onValueChange={handleGradeChange}>
            <SelectTrigger id={`grade-${course.id}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
