# Matrix Media Federation Worker Setup

This Cloudflare Worker acts as a Matrix homeserver media endpoint, proxying media from your GitHub Pages site while providing proper Matrix federation headers.

## Quick Start

### 1. Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed
- `wrangler` CLI installed: `npm install -g wrangler`

### 2. Setup

```bash
# Install dependencies
npm install

# Authenticate with Cloudflare
wrangler login

# Get your account ID from: https://dash.cloudflare.com/?account=
# Edit wrangler.toml and set your account_id
```

### 3. Configuration

Edit `wrangler.toml`:
```toml
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"
# Set your custom domain if you have one, or use the default workers.dev domain
```

### 4. Deploy

```bash
# Build the worker
npm run build

# Deploy to Cloudflare
npm run deploy
# or
wrangler publish
```

Your worker will be available at: `https://sticker-repo.dev72591.workers.dev`

## Usage

### Matrix Media URLs

Once deployed, use these mxc URLs in your Matrix events:

```json
{
  "body": "github.png",
  "msgtype": "m.image",
  "url": "mxc://sticker-repo.dev72591.workers.dev/github",
  "info": {
    "mimetype": "image/png",
    "w": 512,
    "h": 512
  }
}
```

### How It Works

1. **Matrix Client** → Uses `mxc://sticker-repo.dev72591.workers.dev/github`
2. **Homeserver** (matrix.org) → Fetches from `https://sticker-repo.dev72591.workers.dev/_matrix/media/v3/download/sticker-repo.dev72591.workers.dev/github`
3. **Worker** → Proxies request to `https://sticker-repo.github.io/_matrix/media/v3/download/sticker-repo.github.io/github.png`
4. **GitHub Pages** → Returns the image

## Endpoints

- `GET /_matrix/media/v3/download/{serverName}/{mediaId}` - Download media
- `GET /_matrix/media/v3/config` - Media server configuration
- `GET /` - Server info
- `OPTIONS *` - CORS preflight support

## Features

✅ **CORS Headers** - Proper cross-origin support  
✅ **Matrix Federation Compatible** - Works with matrix.org and other homeservers  
✅ **Caching** - 24-hour in-memory cache to reduce GitHub Pages requests  
✅ **Error Handling** - Proper Matrix error responses (M_NOT_FOUND, etc.)  
✅ **Media Type Detection** - Preserves original mime types  

## Custom Domain (Optional)

To use a custom domain instead of workers.dev:

1. Add your domain to Cloudflare
2. Edit `wrangler.toml`:
   ```toml
   route = "media.sticker-repo.github.io/*"
   zone_id = "YOUR_ZONE_ID"
   ```
3. Redeploy with `npm run deploy`

Then use: `mxc://media.sticker-repo.github.io/github`

## Adding More Media

Edit the media mapping in `src/worker.ts`:

```typescript
const mediaMap: Record<string, string> = {
  'github': 'github.png',
  'github.png': 'github.png',
  'another-id': 'path/to/another/image.png', // Add more here
};
```

## Troubleshooting

**"Media not found" error in Matrix:**
- Check that the file exists in `_matrix/media/v3/download/sticker-repo.github.io/` on your GitHub Pages site
- Verify the media ID mapping in the worker
- Test direct access: `https://sticker-repo.github.io/_matrix/media/v3/download/sticker-repo.github.io/github.png`

**Worker not responding:**
- Check Cloudflare Workers dashboard for errors
- Verify account ID is correct in `wrangler.toml`
- Run `npm run dev` to test locally

**CORS Issues:**
- The worker includes proper CORS headers for all responses
- Should work with any Matrix homeserver

## Development

```bash
# Run local development server
npm run dev

# Test the worker locally
curl http://localhost:8787/_matrix/media/v3/download/sticker-repo.dev72591.workers.dev/github
```

## Performance Notes

- Worker response time: ~100-200ms (depends on GitHub Pages response)
- In-memory cache reduces repeated requests significantly
- Cloudflare edge caching provides additional performance
- No storage limits for cached media (up to available memory)

For production, consider upgrading to Cloudflare KV storage for persistent caching across all edge locations.
