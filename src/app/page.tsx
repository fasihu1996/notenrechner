"use client";

import { useState, useEffect } from "react";
import GradePicker from "@/components/GradePicker";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Calculator, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/course";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // You might need to install sonner: npm install sonner
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const [supabase] = useState(() => createClient());
  const [courses, setCourses] = useState<Course[]>([]);
  const [showOptional, setShowOptional] = useState<Record<number, boolean>>({});
  const [selectedGrades, setSelectedGrades] = useState<Record<number, number>>(
    {},
  );
  const [calcWithCredits, setCalcWithCredits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData } = await supabase.from("courses").select();
      setCourses(coursesData || []);

      const { data: gradesData } = await supabase
        .from("grades")
        .select("course_id, grade")
        .eq("student_id", (await supabase.auth.getUser()).data.user?.id);

      if (gradesData) {
        const existingGrades: Record<string, number> = {};
        gradesData.forEach((grade) => {
          existingGrades[grade.course_id.toString()] = grade.grade;
        });
        setSelectedGrades(existingGrades);
        setHasUnsavedChanges(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleGradeChange = (courseId: number, grade: number | null) => {
    setSelectedGrades((prev) => {
      const newGrades = { ...prev };
      if (grade === null) {
        delete newGrades[courseId];
      } else {
        newGrades[courseId] = grade;
      }
      setHasUnsavedChanges(true);
      return newGrades;
    });
  };

  const saveGrades = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to save grades");
        return;
      }

      const gradesToSave = Object.entries(selectedGrades).map(
        ([courseId, grade]) => ({
          course_id: parseInt(courseId),
          student_id: user.id,
          grade: grade,
          updated_at: new Date().toISOString(),
        }),
      );

      const { data: existingGrades } = await supabase
        .from("grades")
        .select("course_id")
        .eq("student_id", user.id);

      const existingCourseIds = new Set(
        existingGrades?.map((g) => g.course_id.toString()) || [],
      );

      const updates = gradesToSave.filter((grade) =>
        existingCourseIds.has(grade.course_id.toString()),
      );
      const inserts = gradesToSave.filter(
        (grade) => !existingCourseIds.has(grade.course_id.toString()),
      );

      for (const update of updates) {
        const { error } = await supabase
          .from("grades")
          .update({
            grade: update.grade,
            updated_at: update.updated_at,
          })
          .eq("course_id", update.course_id)
          .eq("student_id", user.id);

        if (error) throw error;
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from("grades").insert(inserts);

        if (error) throw error;
      }

      const selectedCourseIds = Object.keys(selectedGrades);
      const gradesToDelete =
        existingGrades?.filter(
          (grade) => !selectedCourseIds.includes(grade.course_id.toString()),
        ) || [];

      for (const gradeToDelete of gradesToDelete) {
        const { error } = await supabase
          .from("grades")
          .delete()
          .eq("course_id", gradeToDelete.course_id)
          .eq("student_id", user.id);

        if (error) throw error;
      }

      setHasUnsavedChanges(false);
      toast.success("Grades saved successfully!");
    } catch (_error) {
      toast.error("Failed to save grades. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateGPA = () => {
    let totalWeightedGrades = 0;
    let totalWeights = 0;
    let bachelorarbeitsGrade: number | null = null;

    courses.forEach((course) => {
      const grade = selectedGrades[course.id];
      if (grade !== undefined && grade !== null) {
        if (course.title.toLowerCase().includes("bachelorarbeit")) {
          bachelorarbeitsGrade = grade;
        } else {
          if (calcWithCredits) {
            const credit = course.credits;
            totalWeightedGrades += grade * credit;
            totalWeights += credit;
          } else {
            const weight = course.weight || 1;
            totalWeightedGrades += grade * weight;
            totalWeights += weight;
          }
        }
      }
    });

    if (bachelorarbeitsGrade !== null) {
      if (totalWeights > 0) {
        const regularGPA = totalWeightedGrades / totalWeights;
        return regularGPA * 0.8 + bachelorarbeitsGrade * 0.2;
      } else {
        return bachelorarbeitsGrade;
      }
    }

    return totalWeights > 0 ? totalWeightedGrades / totalWeights : 0;
  };

  const getCalculationDetails = () => {
    const details: Array<{
      course: Course;
      grade: number;
      weight: number;
      weightedGrade: number;
      isBachelorarbeit?: boolean;
    }> = [];

    let bachelorarbeitsGrade: number | null = null;
    let bachelorarbeitsCourse: Course | null = null;

    courses.forEach((course) => {
      const grade = selectedGrades[course.id];
      if (grade !== undefined && grade !== null) {
        if (course.title.toLowerCase().includes("bachelorarbeit")) {
          bachelorarbeitsGrade = grade;
          bachelorarbeitsCourse = course;
          details.push({
            course,
            grade,
            weight: 0.2, // 20% weight for display
            weightedGrade: grade * 0.2,
            isBachelorarbeit: true,
          });
        } else {
          let weight = 0;
          if (calcWithCredits) {
            weight = course.credits;
          } else {
            weight = course.weight;
          }
          details.push({
            course,
            grade,
            weight,
            weightedGrade: grade * weight,
          });
        }
      }
    });

    return { details, bachelorarbeitsGrade, bachelorarbeitsCourse };
  };

  const getRecommendedRetakes = () => {
    if (!hasSelectedGrades) return [];

    const improvementCandidates: Array<{
      course: Course;
      currentGrade: number;
      weight: number;
      improvementPotential: number;
      hypotheticalImpact: number;
      isBachelorarbeit: boolean;
      impactScore: number; // New scoring system
    }> = [];

    courses.forEach((course) => {
      const currentGrade = selectedGrades[course.id];
      if (
        currentGrade !== undefined &&
        currentGrade !== null &&
        currentGrade > 1.0
      ) {
        const weight = calcWithCredits ? course.credits : course.weight;
        const improvementPotential = currentGrade - 1.0; // Room for improvement to perfect grade
        const isBachelorarbeit = course.title
          .toLowerCase()
          .includes("bachelorarbeit");

        // Calculate hypothetical impact if this course was improved by 1.0 grade
        const improvedGrade = Math.max(1.0, currentGrade - 1.0);
        const hypotheticalGrades = {
          ...selectedGrades,
          [course.id]: improvedGrade,
        };
        const hypotheticalGPA = calculateHypotheticalGPA(hypotheticalGrades);
        const currentGPA = calculateGPA();
        const hypotheticalImpact = hypotheticalGPA - currentGPA;

        // Create a comprehensive impact score that considers:
        // 1. Weight of the course (higher weight = more impact)
        // 2. Improvement potential (how much the grade can be improved)
        // 3. Special weighting for Bachelorarbeit
        let impactScore = weight * improvementPotential;

        // Boost score for Bachelorarbeit due to its special 20% weighting
        if (isBachelorarbeit) {
          impactScore *= 5; // Significantly boost Bachelorarbeit priority
        }

        improvementCandidates.push({
          course,
          currentGrade,
          weight,
          improvementPotential,
          hypotheticalImpact,
          isBachelorarbeit,
          impactScore,
        });
      }
    });

    // Sort by comprehensive impact score (weight × improvement potential)
    improvementCandidates.sort((a, b) => {
      // First priority: Bachelorarbeit courses
      if (a.isBachelorarbeit && !b.isBachelorarbeit) return -1;
      if (!a.isBachelorarbeit && b.isBachelorarbeit) return 1;

      // Second priority: Impact score (weight × improvement potential)
      if (Math.abs(b.impactScore - a.impactScore) > 0.1) {
        return b.impactScore - a.impactScore;
      }

      // Third priority: Actual hypothetical GPA impact as tiebreaker
      return b.hypotheticalImpact - a.hypotheticalImpact;
    });

    return improvementCandidates.slice(0, 2); // Return top 2
  };

  // Add this helper function to calculate hypothetical GPA
  const calculateHypotheticalGPA = (
    hypotheticalGrades: Record<number, number>,
  ) => {
    let totalWeightedGrades = 0;
    let totalWeights = 0;
    let bachelorarbeitsGrade: number | null = null;

    courses.forEach((course) => {
      const grade = hypotheticalGrades[course.id];
      if (grade !== undefined && grade !== null) {
        if (course.title.toLowerCase().includes("bachelorarbeit")) {
          bachelorarbeitsGrade = grade;
        } else {
          if (calcWithCredits) {
            const credit = course.credits;
            totalWeightedGrades += grade * credit;
            totalWeights += credit;
          } else {
            const weight = course.weight || 1;
            totalWeightedGrades += grade * weight;
            totalWeights += weight;
          }
        }
      }
    });

    if (bachelorarbeitsGrade !== null) {
      if (totalWeights > 0) {
        const regularGPA = totalWeightedGrades / totalWeights;
        return regularGPA * 0.8 + bachelorarbeitsGrade * 0.2;
      } else {
        return bachelorarbeitsGrade;
      }
    }

    return totalWeights > 0 ? totalWeightedGrades / totalWeights : 0;
  };

  const groupedCourses = courses.reduce(
    (
      acc: Record<number, { mandatory: Course[]; optional: Course[] }>,
      course,
    ) => {
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
    },
    {},
  );

  const semesters = Object.keys(groupedCourses)
    .map(Number)
    .sort((a, b) => a - b);

  const toggleOptionalCourses = (semester: number) => {
    setShowOptional((prev) => ({
      ...prev,
      [semester]: !prev[semester],
    }));
  };

  const toggleCalculationMethod = () => {
    setCalcWithCredits(!calcWithCredits);
  };
  const { details: calculationDetails, bachelorarbeitsGrade } =
    getCalculationDetails();
  const hasSelectedGrades = calculationDetails.length > 0;
  const gpa = calculateGPA();
  const recommendedRetakes = getRecommendedRetakes();

  return (
    <div className="container mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-8">
      {/* Header with Save Button - Mobile optimized */}
      <div className="mb-4 text-center sm:mb-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-foreground mb-2 text-xl font-bold sm:text-2xl lg:text-3xl">
              Calculate your GPA
            </h1>
            <p className="text-muted-foreground px-2 text-sm sm:px-0 sm:text-base">
              Select grades for your courses organized by semester
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 sm:text-sm">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={saveGrades}
              disabled={isSaving || !hasSelectedGrades}
              className="cursor-pointer gap-2"
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Grades"}
            </Button>
          </div>
        </div>
      </div>

      {/* GPA Calculation Card - Mobile optimized */}
      {hasSelectedGrades && (
        <Card className="mb-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 sm:mb-8 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-2 text-center sm:pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              Your GPA
            </CardTitle>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Label htmlFor="calc-switch" className="text-sm">
                Weights
              </Label>
              <Switch
                checked={calcWithCredits}
                onCheckedChange={toggleCalculationMethod}
                id="calc-switch"
              />
              <Label htmlFor="calc-switch" className="text-sm">
                Credits
              </Label>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-3 text-center sm:mb-6">
              <div className="mb-1 text-2xl font-bold text-blue-600 sm:mb-2 sm:text-3xl lg:text-4xl dark:text-blue-400">
                {gpa.toFixed(3)}, will be shown as {Math.floor(gpa * 10) / 10}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Based on {calculationDetails.length} course
                {calculationDetails.length !== 1 ? "s" : ""} using{" "}
                {calcWithCredits ? "credits" : "weights"}
                {bachelorarbeitsGrade !== null &&
                  " (with Bachelor's Thesis weighting)"}
              </p>
            </div>
            {/* Calculation Details - Mobile optimized */}
            <div className="space-y-2">
              <div className="grid gap-1 text-xs sm:gap-2 sm:text-sm">
                <Accordion type="single" collapsible>
                  <AccordionItem value="calc-1">
                    <AccordionTrigger className="flex items-center justify-between">
                      <span>See calculation details</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {calculationDetails.map(
                        ({
                          course,
                          grade,
                          weight,
                          weightedGrade,
                          isBachelorarbeit,
                        }) => (
                          <div
                            key={course.id}
                            className={`bg-background/50 flex items-center justify-between rounded px-2 py-1 text-xs sm:text-sm ${
                              isBachelorarbeit
                                ? "border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
                                : ""
                            }`}
                          >
                            <span className="mr-2 flex-1 truncate font-medium">
                              {course.title}
                              {isBachelorarbeit && (
                                <span className="ml-1 text-xs text-orange-600">
                                  (20%)
                                </span>
                              )}
                            </span>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {isBachelorarbeit
                                ? `${grade} × 20% = ${weightedGrade.toFixed(2)}`
                                : `${grade} × ${weight}${calcWithCredits ? " ECTS" : "x"} = ${weightedGrade.toFixed(2)}`}
                            </span>
                          </div>
                        ),
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Special calculation display when Bachelorarbeit is present */}
                {bachelorarbeitsGrade !== null &&
                  calculationDetails.filter((d) => !d.isBachelorarbeit).length >
                    0 && (
                    <>
                      <div className="mt-2 border-t pt-2">
                        <div className="text-foreground mb-1 text-sm">
                          Special Bachelor&apos;s Thesis Calculation:
                        </div>
                        {(() => {
                          const regularDetails = calculationDetails.filter(
                            (d) => !d.isBachelorarbeit,
                          );
                          const regularTotal = regularDetails.reduce(
                            (sum, detail) => sum + detail.weightedGrade,
                            0,
                          );
                          const regularWeights = regularDetails.reduce(
                            (sum, detail) => sum + detail.weight,
                            0,
                          );
                          const regularGPA =
                            regularWeights > 0
                              ? regularTotal / regularWeights
                              : 0;

                          return (
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Regular courses GPA:</span>
                                <span>{regularGPA.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regular GPA × 80%:</span>
                                <span>{(regularGPA * 0.8).toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bachelorarbeit × 20%:</span>
                                <span>
                                  {(bachelorarbeitsGrade * 0.2).toFixed(4)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-1 font-semibold">
                                <span>Final GPA:</span>
                                <span>{gpa.toFixed(4)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}

                {/* Regular total when no Bachelorarbeit */}
                {bachelorarbeitsGrade === null && (
                  <div className="mt-1 flex items-center justify-between border-t pt-1 text-xs font-semibold sm:mt-2 sm:pt-2 sm:text-sm">
                    <span>Total:</span>
                    <span className="whitespace-nowrap">
                      {calculationDetails
                        .reduce((sum, detail) => sum + detail.weightedGrade, 0)
                        .toFixed(4)}{" "}
                      ÷{" "}
                      {calculationDetails.reduce(
                        (sum, detail) => sum + detail.weight,
                        0,
                      )}
                      {calcWithCredits ? " ECTS" : ""} = {gpa.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Retakes - Mobile optimized */}
      {recommendedRetakes.length > 0 && (
        <Card className="mb-4 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 sm:mb-8 dark:border-orange-800 dark:from-orange-950/20 dark:to-yellow-950/20">
          <CardHeader className="pb-2 text-center sm:pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Recommended Retakes
            </CardTitle>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Courses with the highest potential for GPA improvement
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {recommendedRetakes.map((candidate, index) => {
                const improvedGrade = Math.max(
                  1.0,
                  candidate.currentGrade - 1.0,
                );
                const hypotheticalGrades = {
                  ...selectedGrades,
                  [candidate.course.id]: improvedGrade,
                };
                const hypotheticalGPA =
                  calculateHypotheticalGPA(hypotheticalGrades);

                return (
                  <div
                    key={candidate.course.id}
                    className="bg-background/50 rounded-lg border border-orange-200 p-3 dark:border-orange-800"
                  >
                    {/* Course Info Header */}
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold sm:text-base">
                          #{index + 1} {candidate.course.title}
                          {candidate.isBachelorarbeit && (
                            <span className="ml-1 text-xs font-normal text-orange-600">
                              (Bachelor&apos;s Thesis)
                            </span>
                          )}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {candidate.course.credits} ECTS
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {candidate.course.weight}x
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            Current: {candidate.currentGrade.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Improvement Analysis */}
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Current Grade:
                          </span>
                          <span className="font-medium">
                            {candidate.currentGrade.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Improved by 1.0:
                          </span>
                          <span className="font-medium text-green-600">
                            {improvedGrade.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Weight ({calcWithCredits ? "ECTS" : "Multiplier"}):
                          </span>
                          <span className="font-medium">
                            {candidate.weight}
                            {calcWithCredits ? "" : "x"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Current GPA:
                          </span>
                          <span className="font-medium">{gpa.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Potential GPA:
                          </span>
                          <span className="font-medium text-green-600">
                            {hypotheticalGPA.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-muted-foreground">
                            Improvement:
                          </span>
                          <span className="text-green-600">
                            {candidate.hypotheticalImpact.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Improvement Potential Bar */}
                    <div className="mt-3">
                      <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                        <span>GPA Improvement Potential</span>
                        <span>
                          {candidate.hypotheticalImpact.toFixed(3)} grade points
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-green-500 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (-candidate.hypotheticalImpact / 0.05) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                        <span>0</span>
                        <span>0.05</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {recommendedRetakes.length < 2 && (
                <div className="text-muted-foreground py-2 text-center text-xs sm:text-sm">
                  {recommendedRetakes.length === 0
                    ? "No retake recommendations - all eligible courses are already optimized!"
                    : "Only one course available for retake recommendation."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-first grid layout */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6 xl:grid-cols-3">
        {semesters.map((semester) => (
          <div key={semester} className="space-y-3 sm:space-y-4">
            {/* Semester header - Mobile optimized */}
            <div className="bg-primary text-primary-foreground rounded-lg p-3 text-center sm:p-4">
              <h2 className="text-base font-semibold sm:text-lg lg:text-xl">
                Semester {semester}
              </h2>
              <p className="text-xs opacity-90 sm:text-sm">
                {groupedCourses[semester].mandatory.length} Mandatory
                {groupedCourses[semester].optional.length > 0 &&
                  ` • ${groupedCourses[semester].optional.length} Optional`}
              </p>
            </div>

            {/* Mandatory courses */}
            <div className="space-y-3 sm:space-y-4">
              {groupedCourses[semester].mandatory.map((course) => (
                <GradePicker
                  key={course.id}
                  course={course}
                  onGradeChange={handleGradeChange}
                  initialGrade={selectedGrades[course.id] || null}
                />
              ))}
            </div>

            {/* Optional courses section - Mobile optimized */}
            {groupedCourses[semester].optional.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleOptionalCourses(semester)}
                  className="hover:bg-primary/30 h-8 w-full cursor-pointer text-xs sm:h-9 sm:text-sm"
                >
                  {showOptional[semester] ? (
                    <>
                      <Minus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      Hide Optional
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      Show Optional ({groupedCourses[semester].optional.length})
                    </>
                  )}
                </Button>

                {/* Optional courses */}
                {showOptional[semester] && (
                  <div className="space-y-3 sm:space-y-4">
                    {groupedCourses[semester].optional.map((course) => (
                      <div key={course.id} className="relative">
                        <GradePicker
                          course={course}
                          onGradeChange={handleGradeChange}
                          initialGrade={selectedGrades[course.id] || null} // Pass the initial grade
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

      {/* No courses message */}
      {semesters.length === 0 && (
        <div className="text-muted-foreground mt-4 px-4 text-center sm:mt-8">
          <p className="text-sm sm:text-base">
            No courses found. Add some courses to get started.
          </p>
        </div>
      )}
    </div>
  );
}
