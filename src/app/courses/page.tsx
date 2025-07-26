import { createClient } from "@/utils/supabase/server";

export default async function Courses() {
    const supabase = await createClient();
    const { data: courses } = await supabase.from("courses").select();

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Courses</h1>
            </div>

            <div className="bg-card rounded-lg border p-4">
                <pre className="text-sm overflow-auto">
                    {JSON.stringify(courses, null, 2)}
                </pre>
            </div>
        </div>
    );
}
