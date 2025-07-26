"use client";

import { useState, useEffect } from "react";
import GradePicker from "@/components/GradePicker";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/course";

export default function Home() {
    const [supabase] = useState(() => createClient());
    const [courses, setCourses] = useState<Course[]>([]);
    const [showOptional, setShowOptional] = useState<Record<number, boolean>>({});
    const [selectedGrades, setSelectedGrades] = useState<Record<string, number>>({});

    // Fetch courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            const { data: coursesData } = await supabase.from("courses").select();
            setCourses(coursesData || []); // Handle null case by providing empty array fallback
        };
        fetchCourses();
    }, [supabase]);

    // Handle grade changes from GradePicker components
    const handleGradeChange = (courseId: string, grade: number | null) => {
        setSelectedGrades(prev => {
            const newGrades = { ...prev };
            if (grade === null) {
                delete newGrades[courseId];
            } else {
                newGrades[courseId] = grade;
            }
            return newGrades;
        });
    };

    // Calculate weighted average
    const calculateGPA = () => {
        let totalWeightedGrades = 0;
        let totalWeights = 0;

        courses.forEach(course => {
            const grade = selectedGrades[course.id];
            if (grade !== undefined && grade !== null) {
                const weight = course.weight || 1; // Default weight to 1 if not specified
                totalWeightedGrades += grade * weight;
                totalWeights += weight;
            }
        });

        return totalWeights > 0 ? totalWeightedGrades / totalWeights : 0;
    };

    // Get calculation details for display
    const getCalculationDetails = () => {
        const details: Array<{
            course: Course; // Change from 'string' to 'Course'
            grade: number;
            weight: number;
            weightedGrade: number;
        }> = [];

        courses.forEach(course => {
            const grade = selectedGrades[course.id];
            if (grade !== undefined && grade !== null) {
                const weight = course.weight || 1;
                details.push({
                    course, // Pass the entire course object
                    grade,
                    weight,
                    weightedGrade: grade * weight
                });
            }
        });

        return details;
    };

    // Group courses by semester and mandatory status
    const groupedCourses = courses.reduce((acc: Record<number, { mandatory: Course[], optional: Course[] }>, course) => {
        const semester = course.semester || 1;
        if (!acc[semester]) {
            acc[semester] = { mandatory: [], optional: [] };
        }
        
        if (course.mandatory) {
            acc[semester].mandatory.push(course);
        } else {
            acc[semester].optional.push(course);
        }
        
        return acc;
    }, {});

    // Get sorted semester numbers
    const semesters = Object.keys(groupedCourses)
        .map(Number)
        .sort((a, b) => a - b);

    const toggleOptionalCourses = (semester: number) => {
        setShowOptional(prev => ({
            ...prev,
            [semester]: !prev[semester]
        }));
    };

    const gpa = calculateGPA();
    const calculationDetails = getCalculationDetails();
    const hasSelectedGrades = calculationDetails.length > 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Calculate your grade point average
                </h1>
                <p className="text-muted-foreground">
                    Select grades for your courses organized by semester
                </p>
            </div>

            {/* GPA Calculation Card */}
            {hasSelectedGrades && (
                <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Calculator className="w-6 h-6" />
                            Your GPA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center mb-6">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {gpa.toFixed(2)}
                            </div>
                            <p className="text-muted-foreground">
                                Based on {calculationDetails.length} course{calculationDetails.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Calculation Details */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">Calculation Details:</h4>
                            <div className="grid gap-2 text-sm">
                                {calculationDetails.map(({ course, grade, weight, weightedGrade }) => (
                                    <div key={course.id} className="flex justify-between items-center py-1 px-2 bg-background/50 rounded">
                                        <span className="font-medium">{course.title}</span>
                                        <span className="text-muted-foreground">
                                            {grade} × {weight} = {weightedGrade.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                                    <span>Total:</span>
                                    <span>
                                        {calculationDetails.reduce((sum, detail) => sum + detail.weightedGrade, 0).toFixed(1)} ÷{' '}
                                        {calculationDetails.reduce((sum, detail) => sum + detail.weight, 0)} = {gpa.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* 3-column grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {semesters.map((semester) => (
                    <div key={semester} className="space-y-4">
                        {/* Semester header */}
                        <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
                            <h2 className="text-xl font-semibold">
                                Semester {semester}
                            </h2>
                            <p className="text-sm opacity-90">
                                {groupedCourses[semester].mandatory.length} Mandatory
                                {groupedCourses[semester].optional.length > 0 && 
                                    ` • ${groupedCourses[semester].optional.length} Optional`
                                }
                            </p>
                        </div>
                        
                        {/* Mandatory courses */}
                        <div className="space-y-4">
                            {groupedCourses[semester].mandatory.map((course) => (
                                <GradePicker 
                                    key={course.id}
                                    course={course}
                                    onGradeChange={handleGradeChange}
                                />
                            ))}
                        </div>

                        {/* Optional courses section */}
                        {groupedCourses[semester].optional.length > 0 && (
                            <div className="space-y-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleOptionalCourses(semester)}
                                    className="w-full"
                                >
                                    {showOptional[semester] ? (
                                        <>
                                            <Minus className="w-4 h-4 mr-2" />
                                            Hide Optional Courses
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Show Optional Courses ({groupedCourses[semester].optional.length})
                                        </>
                                    )}
                                </Button>

                                {/* Optional courses */}
                                {showOptional[semester] && (
                                    <div className="space-y-4">
                                        {groupedCourses[semester].optional.map((course) => (
                                            <div key={course.id} className="relative">
                                                <GradePicker 
                                                    course={course}
                                                    onGradeChange={handleGradeChange}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Display message if no courses */}
            {semesters.length === 0 && (
                <div className="text-center text-muted-foreground mt-8">
                    <p>No courses found. Add some courses to get started.</p>
                </div>
            )}
        </div>
    );
}