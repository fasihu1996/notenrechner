"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);

    let gradeNumber: number | null = null;

    if (course.graded) {
      gradeNumber = value ? parseFloat(value) : null;
    } else {
      if (value === "pass") {
        gradeNumber = 1.0;
      } else if (value === "fail") {
        gradeNumber = null;
      }
    }

    onGradeChange?.(course.id, gradeNumber);
  };

  const options = course.graded ? grades : passFail;
  const placeholder = course.graded
    ? "Note..."
    : "Bestanden/Nicht bestanden...";

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

          {/* Conditional rendering based on device type */}
          {isMobile ? (
            // Native select for mobile
            <select
              id={`grade-${course.id}`}
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className='bg-background border-input focus:ring-ring h-10 w-full appearance-none rounded-md border bg-[length:1rem] bg-right bg-no-repeat px-3 py-2 pr-8 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:outline-none'
            >
              <option value='' disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            // Custom Radix UI Select for desktop
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
          )}
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
