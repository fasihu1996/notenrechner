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
  onGradeChange?: (courseId: number, grade: number | null) => void;
  initialGrade?: number;
}

export default function GradePicker({
  course,
  onGradeChange,
  initialGrade,
}: GradePickerProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (initialGrade !== undefined && initialGrade !== null) {
      setSelectedGrade(initialGrade);
    } else {
      setSelectedGrade();
    }
  }, [initialGrade, course.graded]);

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

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);

    let gradeNumber: number | null = null;

    if (course.graded) {
      if (value === -1) {
        gradeNumber = null;
      } else {
        gradeNumber = value;
      }
    } else {
      if (value === 1.0) {
        gradeNumber = 1.0;
      } else if (value === 0.0) {
        gradeNumber = 0.0;
      } else if (value === -1) {
        gradeNumber = null;
      }
    }

    onGradeChange?.(course.id, gradeNumber);
  };

  const processedOptions = course.graded ? grades : passFail;

  const placeholder = course.graded
    ? "Note..."
    : "Bestanden/Nicht bestanden...";

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <CardTitle className="text-sm leading-tight font-semibold sm:text-base lg:text-lg">
            {course.title}
          </CardTitle>
          <div className="flex flex-shrink-0 flex-wrap gap-1 sm:gap-2">
            <Badge variant="secondary" className="text-xs">
              {course.credits} ECTS
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.weight}x
            </Badge>
            <Badge
              variant={course.graded ? "default" : "destructive"}
              className="text-xs"
            >
              {course.graded ? "B" : "U"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <label
            htmlFor={`grade-${course.id}`}
            className="text-xs leading-none font-medium sm:text-sm"
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
              className="bg-background border-input focus:ring-ring h-10 w-full appearance-none rounded-md border bg-[length:1rem] bg-right bg-no-repeat px-3 py-2 pr-8 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
            >
              <option value="">{placeholder}</option>
              {processedOptions.map((option, index) => (
                <option key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            // Custom Radix UI Select for desktop
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger
                id={`grade-${course.id}`}
                className="h-8 text-xs sm:h-9 sm:text-sm"
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {processedOptions.map((option, index) => (
                  <SelectItem
                    key={`${option.value}-${index}`}
                    value={option.value}
                    className="text-xs sm:text-sm"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
