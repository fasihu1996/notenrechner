import { createClient } from "@/utils/supabase/server";

export default async function Courses() {
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select();

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Courses</h1>
      </div>

      <div className='bg-card rounded-lg border p-4'>
        <pre className='overflow-auto text-sm'>
          {JSON.stringify(courses, null, 2)}
        </pre>
      </div>
    </div>
  );
}
