export async function createTaskWithAI(request: Request) {
    // 1. Check if request method is POST - we only accept POST requests
    if (request.method !== 'POST') {
        return new NextResponse(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405 }
        );
    }

    // 2. Parse request body to get task title and description
    const body = await request.json();
    const { title, description } = body;

    // 3. Get JWT token from headers for authentication
    const jwtToken = request.headers.get('Authorization');
    if (!jwtToken) {
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401 }
        );
    }

    // 4. Create Supabase client using environment variables
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
    );

    try {
        // 5. Create a new task with initial 'priority' label
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert([
                {
                    title,
                    description,
                    label: 'priority',
                    user_id: jwtToken,
                },
            ])
            .select();

        if (taskError || !task) {
            return new NextResponse(
                JSON.stringify({ error: 'Failed to create task' }),
                { status: 500 }
            );
        }

        // 6. Get OpenAI API key from environment variables
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
            return new NextResponse(
                JSON.stringify({ error: 'OpenAI API key not found' }),
                { status: 500 }
            );
        }

        // 7. Create OpenAI client
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });

        // 8. Prepare prompt for OpenAI to suggest task label
        const prompt = `Based on this task title: "${title}" and description: "${description}", suggest ONE of these labels: work, personal, or urgent.`;
        
        // 9. Call OpenAI API to get label suggestion
        const completion = await openai.chat.completions.create({
            model: "text-davinci-003", // Using Davinci model for better understanding
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // 10. Extract suggested label from response
        const suggestedLabel = completion.choices[0].message.content.toLowerCase();
        const label = ['work', 'personal', 'urgent'].includes(suggestedLabel) 
            ? suggestedLabel 
            : 'priority'; // Fallback to 'priority' if invalid label

        // 11. Update task with suggested label
        const { data: updatedTask, error: updateError } = await supabase
            .from('tasks')
            .update({ label })
            .eq('id', task[0].id)
            .select();

        if (updateError || !updatedTask) {
            return new NextResponse(
                JSON.stringify({ error: 'Failed to update task' }),
                { status: 500 }
            );
        }

        // 12. Return success response with task and suggested label
        return new NextResponse(
            JSON.stringify({
                task: updatedTask[0],
                suggestedLabel: label,
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in edge function:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}