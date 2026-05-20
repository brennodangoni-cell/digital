const UAZAPI_BASE = 'https://719gil.uazapi.com';
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN || '9679c620-2f1e-455f-b2ca-3ed466643018';

function cleanImageUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/&amp;/g, '&');
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  if (/^(https?:\/\/|data:image\/)/i.test(trimmed)) return trimmed;
  return null;
}

function pickImageUrl(data) {
  const direct = cleanImageUrl(data);
  if (direct) return direct;
  if (!data || typeof data !== 'object') return null;

  const keys = [
    'urlImage',
    'image',
    'imagePreview',
    'url',
    'avatar',
    'picture',
    'photo',
    'imgUrl',
    'profilePicture',
    'profilePictureUrl',
    'profilePicUrl',
    'link',
  ];

  for (const key of keys) {
    const url = cleanImageUrl(data[key]);
    if (url) return url;
  }

  for (const key of ['data', 'result', 'response', 'profile', 'contact', 'chat']) {
    const url = pickImageUrl(data[key]);
    if (url) return url;
  }

  return null;
}

async function postUazapi(path, payload) {
  const response = await fetch(`${UAZAPI_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: UAZAPI_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return { status: response.status, data };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const phone = String(req.query.phone || '').replace(/\D+/g, '');
  const debug = Object.prototype.hasOwnProperty.call(req.query, 'debug');
  if (!phone) {
    res.status(200).json({ urlImage: null });
    return;
  }

  const attempts = [];
  const numbers = [phone];

  try {
    const details = await postUazapi('/chat/details', { number: phone, preview: true });
    const detailsImage = pickImageUrl(details.data);
    attempts.push({ endpoint: '/chat/details', status: details.status, hasImage: Boolean(detailsImage) });

    if (detailsImage) {
      res.status(200).json({ urlImage: detailsImage, source: 'chat/details' });
      return;
    }

    if (details.data && details.data.wa_chatid) {
      const chatNumber = String(details.data.wa_chatid).split('@')[0].replace(/\D+/g, '');
      if (chatNumber) numbers.push(chatNumber);
    }

    for (const number of [...new Set(numbers)]) {
      const avatar = await postUazapi('/chat/avatar', { number });
      const avatarImage = pickImageUrl(avatar.data);
      attempts.push({ endpoint: '/chat/avatar', number, status: avatar.status, hasImage: Boolean(avatarImage) });

      if (avatarImage) {
        res.status(200).json({ urlImage: avatarImage, source: 'chat/avatar' });
        return;
      }
    }

    const payload = { urlImage: null, reason: 'no_public_profile_picture' };
    if (debug) {
      payload.attempts = attempts;
      payload.details = details.data;
    }
    res.status(200).json(payload);
  } catch (error) {
    res.status(200).json({ urlImage: null, reason: 'request_failed', error: debug ? String(error.message || error) : undefined });
  }
};
