# Pray Player Backend Server

Secure backend proxy for Go High Level API integration.

## 🔒 Security

This backend server keeps your GHL API key secure by:
- Storing API credentials in environment variables (never in frontend code)
- Acting as a proxy between the frontend and GHL API
- Preventing API key exposure to end users

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Go High Level account with API access

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your GHL credentials:
   ```
   GHL_API_KEY=your_actual_api_key_here
   GHL_LOCATION_ID=your_location_id_here
   PORT=3001
   NODE_ENV=production
   ```

### Step 3: Get Your GHL Credentials

#### Get API Key:
1. Log into Go High Level
2. Go to **Settings** > **Integrations** > **API**
3. Click **Private Integrations** or **Create API Key**
4. Copy your API Key
5. Paste it in `.env` as `GHL_API_KEY`

#### Get Location ID:
1. In Go High Level, go to **Settings** > **Business Profile**
2. Look for your Location ID in the URL or settings
3. Or go to **Settings** > **Company** and find the Location ID
4. Paste it in `.env` as `GHL_LOCATION_ID`

### Step 4: Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
========================================
🚀 Pray Player Backend Server Running
========================================
Port: 3001
Environment: production
GHL Location ID: ✓ Set
GHL API Key: ✓ Set
========================================
```

## 🧪 Testing

Test the API endpoint:

```bash
curl -X POST http://localhost:3001/api/create-contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+12345678900",
    "optIn": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Contact created successfully",
  "contactId": "abc123..."
}
```

## 📡 API Endpoints

### POST `/api/create-contact`

Creates a contact in Go High Level.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+12345678900",
  "optIn": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "contactId": "contact_id_here"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Pray Player Backend API is running"
}
```

## 🌐 Frontend Integration

The frontend is already configured to use this backend API:

**File:** `js/email-capture.js`
**API URL:** `http://localhost:3001/api/create-contact`

When deploying to production, update the API URL to your deployed backend server URL.

## 📦 Deployment

### Option 1: Deploy to Heroku

1. Create a Heroku app:
   ```bash
   heroku create pray-player-backend
   ```

2. Set environment variables:
   ```bash
   heroku config:set GHL_API_KEY=your_key_here
   heroku config:set GHL_LOCATION_ID=your_location_id_here
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

4. Update frontend API URL to: `https://pray-player-backend.herokuapp.com/api/create-contact`

### Option 2: Deploy to Railway

1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically
4. Update frontend API URL

### Option 3: Deploy to Your Own Server

1. Copy the `server` folder to your server
2. Install dependencies: `npm install`
3. Set up `.env` file with your credentials
4. Run with PM2: `pm2 start server.js --name pray-backend`
5. Update frontend API URL to your server address

## 🔄 Contact Data Sent to GHL

Each contact created includes:

- **firstName** - First name from form
- **lastName** - Last name from form
- **email** - Email address (if provided)
- **phone** - Phone with country code (if provided)
- **source** - "Pray Music Player - Myind Sound"
- **tags** - `['pray-player', 'music-fan', 'opted-in']`
- **customFields**:
  - `opt_in` - Yes/No
  - `player_source` - "Pray Music Player"
  - `timestamp` - ISO timestamp

## 🐛 Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify `.env` file exists and has correct values
- Run `npm install` to ensure dependencies are installed

### "GHL API Key: ✗ Missing" error
- Check `.env` file has `GHL_API_KEY` set
- Ensure there are no spaces around the `=` sign
- Verify the API key is valid in your GHL account

### Frontend can't connect to backend
- Ensure backend server is running
- Check console for CORS errors
- Verify API URL in `js/email-capture.js` matches backend URL

### Contact not created in GHL
- Check backend server logs for errors
- Verify API key has correct permissions
- Check Location ID is correct
- Test API endpoint with curl to isolate issue

## 📝 Notes

- Keep your `.env` file secure and never commit it to Git
- The `.gitignore` file is configured to exclude `.env`
- For production, use HTTPS and proper security headers
- Consider rate limiting for production use

## 🆘 Support

If you encounter issues:
1. Check the backend server logs
2. Test the `/health` endpoint
3. Verify GHL credentials are correct
4. Check GHL API documentation for updates
