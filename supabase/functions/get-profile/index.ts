import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return jsonError('User ID required', 400, req);
    }

    const supabase = createServiceClient();

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return jsonError(userError.message || 'Failed to fetch user data', 500, req);
    }

    return json({
      success: true,
      profile: userData,
      user: userData,
    }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error in get-profile:', message);
    return jsonError(message || 'Failed to fetch profile', 500, req);
  }
});
