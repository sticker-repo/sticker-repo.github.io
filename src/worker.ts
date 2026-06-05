/**
 * Matrix Media Federation Worker
 * 
 * This Cloudflare Worker acts as a Matrix homeserver media endpoint,
 * proxying media from GitHub Pages while providing proper Matrix federation headers.
 * 
 * Deploy to: sticker-repo.dev72591.workers.dev (or your custom domain)
 * 
 * Matrix clients will use URLs like:
 * mxc://sticker-repo.dev72591.workers.dev/github
 */

interface Env {
  // Environment variables can be added here if needed
  GITHUB_PAGES_URL?: string;
}

/**
 * Media cache storage
 * In production, you'd want to use Cloudflare KV storage or Workers Analytics Engine
 */
const MEDIA_CACHE = new Map<string, { data: ArrayBuffer; mimeType: string; timestamp: number }>();
const CACHE_TTL = 86400000; // 24 hours in milliseconds

/**
 * Get media from GitHub Pages
 */
async function fetchMediaFromGithub(mediaId: string): Promise<Response | null> {
  try {
    // Map media IDs to file paths
    const mediaMap: Record<string, string> = {
      'github': 'github.png',
      'github.png': 'github.png',
    };

    const fileName = mediaMap[mediaId] || mediaId;
    const githubUrl = `https://sticker-repo.github.io/_matrix/media/v3/download/sticker-repo.github.io/${fileName}`;

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

      // Only serve media for this homeserver or GitHub Pages domain
      if (serverName !== 'sticker-repo.dev72591.workers.dev' && 
          serverName !== 'sticker-repo.github.io') {
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
      const cacheKey = `${serverName}/${mediaId}`;
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
          server_name: 'sticker-repo.dev72591.workers.dev',
          description: 'Matrix media federation endpoint for sticker-repo.github.io',
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
