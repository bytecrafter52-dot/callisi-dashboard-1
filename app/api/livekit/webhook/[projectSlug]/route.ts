// app/api/livekit/webhook/[projectSlug]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// LiveKit SDK dynamisch laden (Build-Probleme vermeiden)
async function getLiveKitReceiver() {
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!key || !secret) throw new Error('Missing LiveKit API credentials');
  const { WebhookReceiver } = await import('livekit-server-sdk');
  return new WebhookReceiver(key, secret);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectSlug: string }> }
) {
  const { projectSlug } = await context.params;

  const rawBody = await req.text();
  const authHeader = req.headers.get('authorization') || '';

  // 1) verifizieren
  let event: any;
  try {
    const receiver = await getLiveKitReceiver();
    event = await receiver.receive(rawBody, authHeader);
  } catch (e: any) {
    console.error('LiveKit webhook verify failed:', e?.message);
    return new NextResponse('invalid signature', { status: 401 });
  }

  // 2) passendes LiveKit-Projekt holen
  const sb = getSupabaseAdmin();
  const { data: lkproj, error: lkErr } = await sb
    .from('livekit_projects')
    .select('id, org_id, slug, is_active')
    .eq('slug', projectSlug)
    .single();

  if (lkErr || !lkproj || !lkproj.is_active) {
    console.error('Unknown or inactive project slug:', projectSlug, lkErr);
    return NextResponse.json({ ok: true }, { status: 204 });
  }

  // 3) loggen + calls mappen
  try {
    // immer loggen
    const { error: logErr } = await sb.from('agent_logs').insert({
      org_id: lkproj.org_id,
      level: 'debug',
      event: event.event ?? 'unknown_event',
      meta: event,
    });
    if (logErr) console.error('agent_logs insert failed:', logErr.message);

    // room infos
    const room = (event && (event.room || event.data?.room || event.payload?.room)) ?? {};
    const roomSid: string | undefined = room.sid || room.room_sid || event.room_sid;
    const roomName: string | undefined = room.name || event.room?.name;
    const createdAtMs: number | undefined =
      (typeof event.created_at === 'number' ? event.created_at : undefined) ||
      (typeof event.timestamp === 'number' ? event.timestamp : undefined);
    const nowIso = new Date().toISOString();
    const tsIso = createdAtMs ? new Date(createdAtMs).toISOString() : nowIso;

    switch (event.event) {
      case 'room_started': {
        const { error } = await sb.from('calls').upsert(
          {
            org_id: lkproj.org_id,
            external_ref: roomSid ?? roomName ?? `room-${nowIso}`,
            started_at: tsIso,
            summary: null,
            tags: [],
            call_status: 'completed'
          },
          { onConflict: 'external_ref' }
        );
        if (error) console.error('calls upsert (room_started) failed:', error.message);
        break;
      }
      case 'room_finished': {
        if (!roomSid && !roomName) {
          console.warn('room_finished without roomSid/roomName');
          break;
        }
        const ref = roomSid ?? roomName!;
        
        // Get call to generate tags from transcripts
        const { data: call } = await sb
          .from('calls')
          .select('id')
          .eq('external_ref', ref)
          .eq('org_id', lkproj.org_id)
          .single();
        
        if (call) {
          // Auto-generate tags
          const { data: tags } = await sb.rpc('generate_call_tags', { call_uuid: call.id });
          
          await sb
            .from('calls')
            .update({ 
              ended_at: tsIso,
              tags: tags || []
            })
            .eq('id', call.id);

          // Send new call notification (non-blocking)
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://callisi-dashboard1.vercel.app'}/api/notifications/new-call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callId: call.id,
              orgId: lkproj.org_id
            })
          }).catch(err => console.error('Failed to send new call notification:', err));
        } else {
          const { error } = await sb
            .from('calls')
            .update({ ended_at: tsIso })
            .eq('external_ref', ref)
            .eq('org_id', lkproj.org_id);
          if (error) console.error('calls update (room_finished) failed:', error.message);
        }
        break;
      }
      case 'participant_joined': {
        // Extract caller info from participant metadata
        const participant = event.participant || {};
        const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
        
        if (roomSid || roomName) {
          const ref = roomSid ?? roomName!;
          await sb
            .from('calls')
            .update({
              caller_name: metadata.caller_name || metadata.name,
              caller_phone: metadata.caller_phone || metadata.phone
            })
            .eq('external_ref', ref)
            .eq('org_id', lkproj.org_id);
        }
        break;
      }
      case 'track_published': {
        // Handle transcript tracks if available
        const track = event.track || {};
        if (track.type === 'DATA' && track.name?.includes('transcript')) {
          // Process transcript data
          const transcriptData = event.data || {};
          if (transcriptData.text && (roomSid || roomName)) {
            const ref = roomSid ?? roomName!;
            const { data: call } = await sb
              .from('calls')
              .select('id')
              .eq('external_ref', ref)
              .eq('org_id', lkproj.org_id)
              .single();
            
            if (call) {
              const { data: existingTranscripts } = await sb
                .from('call_transcripts')
                .select('seq')
                .eq('call_id', call.id)
                .order('seq', { ascending: false })
                .limit(1);
              
              const nextSeq = (existingTranscripts?.[0]?.seq || 0) + 1;
              
              await sb.from('call_transcripts').insert({
                call_id: call.id,
                seq: nextSeq,
                speaker: transcriptData.speaker || 'caller',
                text: transcriptData.text,
                started_at: tsIso
              });
            }
          }
        }
        break;
      }
      default:
        // andere Events nur geloggt
        break;
    }
  } catch (dbErr: any) {
    console.error('Unexpected DB error:', dbErr?.message);
    return new NextResponse('db error', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
