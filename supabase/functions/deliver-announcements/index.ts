import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_announcements')
      .select(`
        *,
        created_by:admins(email, full_name)
      `)
      .eq('status', 'sent')
      .order('created_at', { ascending: false });

    if (error) throw error;

    for (const announcement of data) {
      if (announcement.processed) continue;

      let targetUsers: { id: string }[] = [];

      if (announcement.target_audience === 'all') {
        const { data: allUsers } = await supabase
          .from('user_profiles')
          .select('id');
        targetUsers = allUsers || [];
      } else {
        const { data: usersByType } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_type', announcement.target_audience.slice(0, -1));
        targetUsers = usersByType || [];
      }

      const announcementsToInsert = targetUsers.map((user) => ({
        admin_id: announcement.created_by,
        user_id: user.id,
        title: announcement.title,
        content: announcement.message,
        announcement_type: announcement.announcement_type,
        target_audience: announcement.target_audience,
        is_read: false,
      }));

      if (announcementsToInsert.length > 0) {
        await supabase.from('announcements').insert(announcementsToInsert);
      }

      await supabase
        .from('admin_announcements')
        .update({ processed: true })
        .eq('id', announcement.id);
    }

    return new Response(
      JSON.stringify({ success: true, processed: data.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
