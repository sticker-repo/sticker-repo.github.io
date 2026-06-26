const PNG_CACHE = new Map();

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function getFileBytes(mediaId) {
  if (PNG_CACHE.has(mediaId)) return PNG_CACHE.get(mediaId);

  const res = await fetch(`https://sticker-repo.github.io/files/${mediaId}`);
  if (!res.ok) throw new Error(`failed to fetch file: ${res.status}`);

  const bytes = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";

  const value = { bytes, contentType, size: bytes.byteLength };
  PNG_CACHE.set(mediaId, value);
  return value;
}

function rawMediaResponse(file) {
  return new Response(file.bytes, {
    status: 200,
    headers: {
      "content-type": file.contentType,
      "content-length": String(file.size),
      "cache-control": "public, max-age=31536000, immutable",
      "access-control-allow-origin": "*",
      "cross-origin-resource-policy": "cross-origin",
    },
  });
}

function federationMultipartResponse(file) {
  const boundary = "matrixboundary";
  const metadata = JSON.stringify({
    file: {
      mimetype: file.contentType,
      size: file.size,
    },
  });

  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${metadata}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${file.contentType}\r\n` +
      `Content-Length: ${file.size}\r\n\r\n`
  );
  const tail = encoder.encode(`\r\n--${boundary}--\r\n`);

  const body = new Uint8Array(head.length + file.bytes.length + tail.length);
  body.set(head, 0);
  body.set(file.bytes, head.length);
  body.set(tail, head.length + file.bytes.length);

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": `multipart/mixed; boundary=${boundary}`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const SERVER_NAME = url.hostname;

    if (path === "/.well-known/matrix/server") {
      return json({ "m.server": `${SERVER_NAME}:443` });
    }

    if (path === "/.well-known/matrix/client") {
      return json({
        "m.homeserver": { base_url: `https://${SERVER_NAME}` },
      });
    }

    const fedMatch = path.match(/^\/_matrix\/federation\/v1\/media\/download\/([^/]+)$/);
    if (fedMatch) {
      const mediaId = fedMatch[1];
      const file = await getFileBytes(mediaId);
      return federationMultipartResponse(file);
    }

    const mediaMatch = path.match(
      new RegExp(`^/_matrix/(?:media/v3|media/r0|client/v1)/download/${SERVER_NAME}/([^/]+)(?:/[^/]+)?$`)
    );
    if (mediaMatch) {
      const mediaId = mediaMatch[1];
      const file = await getFileBytes(mediaId);
      return rawMediaResponse(file);
    }

    return new Response("Not found", { status: 404 });
  },
};
