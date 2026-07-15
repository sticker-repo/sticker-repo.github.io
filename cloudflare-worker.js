const CACHE = new Map();

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
  if (CACHE.has(mediaId)) return CACHE.get(mediaId);

  const mediaIdParts = mediaId.split("-");
  if (mediaIdParts.length !== 4) {
    return { bytes: new Uint8Array(), contentType: undefined, size: 0 };
  }
  const [repoName, packId, fileId, ext] = mediaIdParts;

  const res = await fetch(`https://sticker-repo.github.io/${repoName}/files/${packId}/${fileId}.${ext}`);
  if (!res.ok) throw new Error(`failed to fetch file: ${res.status}`);

  const bytes = new Uint8Array(await res.arrayBuffer());

  let contentType;
  switch (ext.toLowerCase()) {
    case "png":
      contentType = "image/png";
      break;
    case "jpg":
    case "jpeg":
      contentType = "image/jpeg";
      break;
    case "webp":
      contentType = "image/webp";
      break;
    case "webm":
      contentType = "video/webm";
      break;
    case "gif":
      contentType = "image/gif";
      break;
    case "tgs":
      contentType = "image/tgs";
      break;
    default:
      contentType = res.headers.get("content-type") || "application/octet-stream";
      break;
  }

  const value = { bytes, contentType, size: bytes.byteLength };
  CACHE.set(mediaId, value);
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

    const downloadMatch = path.match(
      new RegExp(
        `^/(?:_matrix/client/v1/media/download|_matrix/media/v3/download|_matrix/media/r0/download)/${SERVER_NAME}/([^/]+)(?:/[^/]+)?$`
      )
    );
    if (downloadMatch) {
      const mediaId = downloadMatch[1];
      const file = await getFileBytes(mediaId);
      return rawMediaResponse(file);
    }

    const thumbMatch = path.match(
      new RegExp(
        `^/(?:_matrix/client/v1/media/thumbnail|_matrix/media/v3/thumbnail|_matrix/media/r0/thumbnail)/${SERVER_NAME}/([^/]+)(?:/[^/]+)?$`
      )
    );
    if (thumbMatch) {
      const mediaId = thumbMatch[1];
      const file = await getFileBytes(mediaId);
      return rawMediaResponse(file);  // TODO: this is the same image, no resizing
    }

    return new Response("Not found", { status: 404 });
  },
};
