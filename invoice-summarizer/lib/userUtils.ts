'use client';

import { supabase } from '@/lib/supabaseClient';

export type QuotaStatus = {
  uploadsUsed: number;
  uploadsLimit: number;
  uploadsLeft: number;
  emailsUsed: number;
  emailsLimit: number;
  emailsLeft: number;
  firstUploadAt: string | null;
  resetAt: string | null;
};

const UPLOADS_LIMIT = 3;
const EMAILS_LIMIT = 3;
const RESET_DAYS = 30;

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function getUserQuotaStatus(userId: string | null | undefined): Promise<QuotaStatus | null> {
  if (!userId) return null;

  // 1) Read profile counters + window
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('uploads_used, emails_used, quota_start_at')
    .eq('id', userId)
    .single();

  if (error || !profile) return null;

  let { uploads_used = 0, emails_used = 0, quota_start_at } = profile as {
    uploads_used: number | null;
    emails_used: number | null;
    quota_start_at: string | null;
  };

  // 2) Ensure/refresh 30-day window
  const nowIso = new Date().toISOString();
  let firstUploadAt = quota_start_at;

  const expired = firstUploadAt
    ? new Date() >= new Date(addDays(firstUploadAt, RESET_DAYS))
    : true;

  if (expired) {
    const { data: upd } = await supabase
      .from('profiles')
      .update({
        quota_start_at: nowIso,
        uploads_used: 0,
        emails_used: 0,
      })
      .eq('id', userId)
      .select('uploads_used, emails_used, quota_start_at')
      .single();

    if (upd) {
      uploads_used = upd.uploads_used ?? 0;
      emails_used = upd.emails_used ?? 0;
      firstUploadAt = upd.quota_start_at;
    }
  }

  // 3) SELF-HEAL: derive current uploads in-window from invoices
  //    and bump uploads_used upward if it’s behind. Never decrement.
  let derivedUploads = 0;
  if (firstUploadAt) {
    const { count: cnt, error: cntErr } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'upload')
      .gte('created_at', firstUploadAt);

    if (!cntErr && typeof cnt === 'number') {
      derivedUploads = cnt;
      if (cnt > (uploads_used ?? 0)) {
        const { data: upd2 } = await supabase
          .from('profiles')
          .update({ uploads_used: cnt })
          .eq('id', userId)
          .select('uploads_used')
          .single();

        uploads_used = upd2?.uploads_used ?? cnt;
      }
    }
  }

  const resetAt = firstUploadAt ? addDays(firstUploadAt, RESET_DAYS) : null;

  return {
    uploadsUsed: uploads_used ?? 0,
    uploadsLimit: UPLOADS_LIMIT,
    uploadsLeft: Math.max(0, UPLOADS_LIMIT - (uploads_used ?? 0)),
    emailsUsed: emails_used ?? 0,
    emailsLimit: EMAILS_LIMIT,
    emailsLeft: Math.max(0, EMAILS_LIMIT - (emails_used ?? 0)),
    firstUploadAt,
    resetAt,
  };
}
