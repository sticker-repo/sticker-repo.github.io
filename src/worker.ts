/**
 * Matrix Media Federation Worker
 * 
 * This Cloudflare Worker acts as a Matrix homeserver media endpoint,
 * proxying media from the files directory on GitHub Pages.
 * 
 * Deploy to: sticker-repo-matrix-worker.dev72591.workers.dev
 * 
 * Matrix clients will use URLs like:
 * mxc://sticker-repo-matrix-worker.dev72591.workers.dev/github
 */

interface Env {
  GITHUB_PAGES_URL?: string;
}

/**
 * Media cache storage
 */
const MEDIA_CACHE = new Map<string, { data: ArrayBuffer; mimeType: string; timestamp: number }>();
const CACHE_TTL = 86400000; // 24 hours in milliseconds

/**
 * Get media from GitHub Pages files directory
 */
async function fetchMediaFromGithub(mediaId: string): Promise<Response | null> {
  try {
    // Simple media mapping from mediaId to filename
    const mediaMap: Record<string, string> = {
      'github': 'github.png',
      'github.png': 'github.png',
    };

    const fileName = mediaMap[mediaId] || mediaId;
    const githubUrl = `https://sticker-repo.github.io/files/${fileName}`;

    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${githubUrl}: ${response.status}`);
      return null;
    }

    return response;
  } catch (error) {
    console.error(`Error fetching media: ${error}`);
    return null;
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle Matrix media download endpoint
    // Pattern: /_matrix/media/v3/download/{serverName}/{mediaId}
    const downloadMatch = pathname.match(/^\/_matrix\/media\/v3\/download\/([^\/]+)\/(.+)$/);
    
    if (downloadMatch && request.method === 'GET') {
      const [, serverName, mediaId] = downloadMatch;

      // Only serve media for this homeserver
      if (serverName !== 'sticker-repo-matrix-worker.dev72591.workers.dev') {
        return new Response(
          JSON.stringify({
            errcode: 'M_NOT_FOUND',
            error: 'Media not found on this homeserver',
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            },
          }
        );
      }

      // Check cache first
      const cacheKey = `${mediaId}`;
      const cached = MEDIA_CACHE.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return new Response(cached.data, {
          headers: {
            'Content-Type': cached.mimeType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          },
        });
      }

      // Fetch from GitHub
      const mediaResponse = await fetchMediaFromGithub(mediaId);
      
      if (!mediaResponse) {
        return new Response(
          JSON.stringify({
            errcode: 'M_NOT_FOUND',
            error: 'Media not found',
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Get content type
      const mimeType = mediaResponse.headers.get('Content-Type') || 'application/octet-stream';
      const data = await mediaResponse.arrayBuffer();

      // Cache the media
      MEDIA_CACHE.set(cacheKey, {
        data,
        mimeType,
        timestamp: Date.now(),
      });

      // Return with proper Matrix headers
      return new Response(data, {
        headers: {
          'Content-Type': mimeType,
          'Content-Length': data.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Matrix server endpoint info (useful for debugging)
    if (pathname === '/_matrix/media/v3/config') {
      return new Response(
        JSON.stringify({
          'upload_size': 5368709120, // 5GB
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Root path - provide info
    if (pathname === '/') {
      return new Response(
        JSON.stringify({
          name: 'Matrix Media Server',
          version: '1.0.0',
          server_name: 'sticker-repo-matrix-worker.dev72591.workers.dev',
          description: 'Matrix media federation endpoint for sticker-repo',
          endpoints: {
            download: '/_matrix/media/v3/download/{serverName}/{mediaId}',
            config: '/_matrix/media/v3/config',
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Not found
    return new Response(
      JSON.stringify({
        errcode: 'M_NOT_FOUND',
        error: 'Endpoint not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
};
