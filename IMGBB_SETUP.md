# ImgBB API Setup

ImgBB is used for image uploads in the chat feature. Here's how to set it up:

## Step 1: Get Your ImgBB API Key

1. **Create/Login to ImgBB Account**
   - Go to [https://imgbb.com](https://imgbb.com)
   - Sign up or log in (it's free)

2. **Get API Key**
   - Go to [https://api.imgbb.com/](https://api.imgbb.com/)
   - Or navigate to API section in your account
   - Copy your API key

## Step 2: Add API Key to Environment Variables

Add your ImgBB API key to your `.env` file:

```env
VITE_IMGBB_API_KEY=your_api_key_here
```

**Important:** Make sure `.env` is in your `.gitignore` (it already is) so you don't commit your API key to version control.

## Step 3: Restart Development Server

After adding the environment variable, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## For Production Deployment

When deploying to Vercel (or other platforms), add the environment variable in your deployment settings:

- **Variable Name:** `VITE_IMGBB_API_KEY`
- **Value:** Your ImgBB API key

## Current Implementation

The code in `src/hooks/useImageUpload.ts` will:
- First try to use `VITE_IMGBB_API_KEY` from environment variables
- Fall back to the hardcoded key if not set (for development/testing)
- Fall back to base64 encoding if the API call fails

## Testing

After setup, test image uploads in the chat:
1. Open a conversation
2. Click the image upload button
3. Select an image
4. The image should upload to ImgBB and display in the chat

## Notes

- ImgBB free tier allows uploads up to 32 MB
- Images are stored on ImgBB's servers
- The API key is safe to use in frontend code (it's a public API key, but still protect it)

