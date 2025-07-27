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
      <CardHeader className='pb-2 sm:pb-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <CardTitle className='text-sm leading-tight font-semibold sm:text-base lg:text-lg'>
            {course.title}
          </CardTitle>
          <div className='flex flex-shrink-0 flex-wrap gap-1 sm:gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {course.ects} ECTS
            </Badge>
            <Badge variant='outline' className='text-xs'>
              {course.weight}%
            </Badge>
            <Badge
              variant={course.graded ? "default" : "destructive"}
              className='text-xs'
            >
              {course.graded ? "Graded" : "Pass/Fail"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='space-y-2'>
          <label
            htmlFor={`grade-${course.id}`}
            className='text-xs leading-none font-medium sm:text-sm'
          >
            {course.graded ? "Select Grade" : "Select Result"}
          </label>
          <Select value={selectedGrade} onValueChange={handleGradeChange}>
            <SelectTrigger
              id={`grade-${course.id}`}
              className='h-8 text-xs sm:h-9 sm:text-sm'
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-xs sm:text-sm'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedGrade && (
          <div className='bg-muted mt-2 rounded-md p-2 sm:mt-3'>
            <p className='text-muted-foreground text-xs'>
              {course.graded ? "Selected Grade:" : "Selected Result:"}{" "}
              <span className='font-medium'>
                {options.find((opt) => opt.value === selectedGrade)?.label}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
