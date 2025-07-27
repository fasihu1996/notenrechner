"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CourseData {
  title: string;
  ects: number;
  weight: number;
  semester?: string;
}

export async function addCourse(courseData: CourseData) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title: courseData.title,
          credits: courseData.ects,
          weight: courseData.weight,
          semester: courseData.semester || null,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
