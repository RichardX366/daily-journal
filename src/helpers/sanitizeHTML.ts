import { sanitize } from 'dompurify';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|blob|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
