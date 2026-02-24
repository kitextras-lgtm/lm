import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getCorsHeaders(req: Request) {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
  const origin = req.headers.get('Origin') || '';
  const resolvedOrigin = allowedOrigin === '*' ? '*' : (origin === allowedOrigin ? origin : allowedOrigin);
  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseClient
      .from('admin_announcements')
      .select(`
        *,
        created_by:admins(email, full_name)
      `)
      .eq('status', 'sent')
      .order('created_at', { ascending: false })

    if (error) throw error

    // For each announcement, get the target users and create announcement records
    for (const announcement of data) {
      // Skip if already processed (you might want to add a processed flag)
      if (announcement.processed) continue

      let targetUsers = []

      if (announcement.target_audience === 'all') {
        // Get all users
        const { data: allUsers } = await supabaseClient
          .from('user_profiles')
          .select('id')
        targetUsers = allUsers || []
      } else {
        // Get users by type
        const { data: usersByType } = await supabaseClient
          .from('user_profiles')
          .select('id')
          .eq('user_type', announcement.target_audience.slice(0, -1)) // Remove 's' from end
        targetUsers = usersByType || []
      }

      // Create announcement records for each target user
      const announcementsToInsert = targetUsers.map(user => ({
        admin_id: announcement.created_by,
        user_id: user.id,
        title: announcement.title,
        content: announcement.message,
        announcement_type: announcement.announcement_type,
        target_audience: announcement.target_audience,
        is_read: false,
      }))

      if (announcementsToInsert.length > 0) {
        await supabaseClient
          .from('announcements')
          .insert(announcementsToInsert)
      }

      // Mark as processed
      await supabaseClient
        .from('admin_announcements')
        .update({ processed: true })
        .eq('id', announcement.id)
    }

    return new Response(
      JSON.stringify({ success: true, processed: data.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
