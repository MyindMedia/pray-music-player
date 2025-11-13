# Go High Level Integration Setup Guide

This guide will walk you through setting up the Go High Level integration for the Pray Music Player to capture emails and phone numbers (optional).

## Table of Contents
1. [Quick Start](#quick-start)
2. [Webhook Setup](#webhook-setup)
3. [Alternative: Direct API Integration](#alternative-direct-api-integration)
4. [Testing Your Integration](#testing-your-integration)
5. [Custom Field Mapping](#custom-field-mapping)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Active Go High Level account
- Admin or appropriate permissions
- The music player files deployed on a web server

### 5-Minute Setup

1. **Get Your Webhook URL**
   - Log into Go High Level
   - Go to **Settings** → **Webhooks**
   - Click **Create Webhook**
   - Choose **Inbound Webhook**
   - Copy the webhook URL (looks like: `https://hooks.gohighlevel.com/webhook/xxxxx`)

2. **Update the Code**
   - Open `js/email-capture.js`
   - Find line 12:
     ```javascript
     this.webhookURL = 'YOUR_GO_HIGH_LEVEL_WEBHOOK_URL';
     ```
   - Replace with your actual webhook URL:
     ```javascript
     this.webhookURL = 'https://hooks.gohighlevel.com/webhook/xxxxx';
     ```

3. **Deploy** - Upload your files to your web host

4. **Test** - Visit your site and submit an email to verify it's working

---

## Webhook Setup (Recommended)

Webhooks are the easiest way to integrate with Go High Level.

### Step 1: Create Webhook in Go High Level

1. **Navigate to Webhooks**
   - Log into your Go High Level dashboard
   - Click **Settings** in the left sidebar
   - Click **Webhooks**

2. **Create New Webhook**
   - Click **+ Create Webhook**
   - Name: `Pray Music Player Lead Capture`
   - Type: **Inbound Webhook**
   - Click **Create**

3. **Copy Webhook URL**
   - Your webhook URL will look like:
     ```
     https://hooks.gohighlevel.com/webhook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     ```
   - Copy this URL

### Step 2: Configure Webhook Actions

After creating the webhook, configure what happens when data is received:

1. **Set Up Workflow**
   - In the webhook settings, click **Add Workflow**
   - Choose **Create Contact** or **Update Contact**

2. **Map Fields**
   Map the incoming data to Go High Level fields:

   | Incoming Field | GHL Field |
   |----------------|-----------|
   | `email` | Email |
   | `first_name` | First Name |
   | `source` | Source/Tag |
   | `timestamp` | Date Added |

3. **Add Tags** (Optional but recommended)
   - Add tags like: `pray-player`, `music-fan`, `email-capture`
   - This helps segment your audience

4. **Set Up Automation** (Optional)
   - Trigger email sequence
   - Send welcome SMS
   - Assign to pipeline stage

### Step 3: Update Your Code

Open `js/email-capture.js` and update:

```javascript
// Line 12 - Replace with your webhook URL
this.webhookURL = 'https://hooks.gohighlevel.com/webhook/your-webhook-id';
```

### Step 4: Deploy & Test

1. Save your changes
2. Upload files to your web host
3. Visit your site
4. Test the email capture form
5. Check Go High Level for the new contact

---

## Alternative: Direct API Integration

For more control, you can use Go High Level's API directly.

### Step 1: Get API Credentials

1. **Generate API Key**
   - Go to **Settings** → **API**
   - Click **+ Create API Key**
   - Name: `Pray Music Player API`
   - Copy the API key

2. **Get Location ID**
   - Go to **Settings** → **Business Profile**
   - Copy your Location ID

### Step 2: Update Email Capture Code

Replace the `submitToBackend` method in `js/email-capture.js`:

```javascript
async submitToBackend(email, firstName) {
    const API_KEY = 'YOUR_API_KEY_HERE';
    const LOCATION_ID = 'YOUR_LOCATION_ID';

    try {
        const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28'
            },
            body: JSON.stringify({
                email: email,
                firstName: firstName,
                locationId: LOCATION_ID,
                source: 'Pray Music Player',
                tags: ['pray-player', 'music-fan'],
                customFields: {
                    // Add any custom fields here
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Contact created:', data);
            return true;
        } else {
            const error = await response.json();
            console.error('API error:', error);
            return false;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return false;
    }
}
```

### Important: Secure Your API Key

**Never** expose API keys in client-side code. Instead:

1. **Create a Backend Proxy** (Recommended)
   - Set up a simple serverless function (Vercel, Netlify, AWS Lambda)
   - Store API key in environment variables
   - Client sends data to your proxy
   - Proxy forwards to Go High Level

Example serverless function (Vercel):

```javascript
// api/capture-email.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, firstName } = req.body;

    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
        },
        body: JSON.stringify({
            email,
            firstName,
            locationId: process.env.GHL_LOCATION_ID,
            source: 'Pray Music Player',
            tags: ['pray-player']
        })
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 500).json(data);
}
```

Then update your client code to call your proxy:

```javascript
async submitToBackend(email, firstName) {
    try {
        const response = await fetch('/api/capture-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, firstName })
        });

        return response.ok;
    } catch (error) {
        console.error('Fetch error:', error);
        return false;
    }
}
```

---

## Testing Your Integration

### Manual Testing

1. **Submit Test Email**
   - Visit your site
   - Click the main play button
   - Enter test email: `test@example.com`
   - Submit the form

2. **Verify in Go High Level**
   - Go to **Contacts**
   - Search for `test@example.com`
   - Verify the contact was created
   - Check tags and source field

3. **Check Webhook Logs**
   - Go to **Settings** → **Webhooks**
   - Click on your webhook
   - View **Recent Activity**
   - Check for successful deliveries

### Debugging

Enable console logging in `js/email-capture.js`:

```javascript
async submitToBackend(email, firstName) {
    console.log('Submitting to GHL:', { email, firstName });

    // ... rest of the code

    const response = await fetch(this.webhookURL, { /* ... */ });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    return response.ok;
}
```

Open browser console (F12) and watch for logs when submitting.

---

## Custom Field Mapping

If you have custom fields in Go High Level, you can capture additional data.

### Example: Add Phone Number Field

1. **Update HTML** (`index.html`):

```html
<!-- Add after email input -->
<div class="form-group">
    <label for="phoneInput" class="sr-only">Phone number (optional)</label>
    <input
        type="tel"
        id="phoneInput"
        name="phone"
        placeholder="Phone number (optional)"
        autocomplete="tel"
    >
</div>
```

2. **Update JavaScript** (`js/email-capture.js`):

```javascript
async handleSubmit(e) {
    e.preventDefault();

    const email = this.emailInput.value.trim();
    const firstName = this.firstNameInput.value.trim();
    const phone = document.getElementById('phoneInput').value.trim(); // Add this

    // Submit with phone
    const success = await this.submitToBackend(email, firstName, phone);

    // ... rest of the code
}

async submitToBackend(email, firstName, phone) {
    // ... existing code

    body: JSON.stringify({
        email: email,
        first_name: firstName,
        phone: phone, // Add this
        source: 'Pray Music Player',
        timestamp: new Date().toISOString()
    })
}
```

3. **Map in Go High Level Webhook**
   - Add mapping: `phone` → Phone

---

## Advanced Features

### 1. Track Music Preferences

Capture which song the user was about to play:

```javascript
// In player.js
handleMainPlayClick() {
    const currentSong = this.playlist[this.currentTrackIndex].title;

    // Store for email capture
    sessionStorage.setItem('intendedSong', currentSong);

    // Show modal
    if (!emailCaptured) {
        emailModal.style.display = 'flex';
    }
}

// In email-capture.js
async submitToBackend(email, firstName) {
    const intendedSong = sessionStorage.getItem('intendedSong');

    body: JSON.stringify({
        email: email,
        first_name: firstName,
        source: 'Pray Music Player',
        intended_song: intendedSong, // Add this
        timestamp: new Date().toISOString()
    })
}
```

### 2. UTM Parameter Tracking

Capture marketing source:

```javascript
// Add to email-capture.js constructor
constructor() {
    // ... existing code
    this.utmParams = this.getUTMParams();
}

getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
    };
}

async submitToBackend(email, firstName) {
    body: JSON.stringify({
        email: email,
        first_name: firstName,
        source: 'Pray Music Player',
        ...this.utmParams, // Add UTM params
        timestamp: new Date().toISOString()
    })
}
```

### 3. Add to Specific Pipeline

In your webhook payload:

```javascript
body: JSON.stringify({
    email: email,
    first_name: firstName,
    source: 'Pray Music Player',
    pipeline_id: 'YOUR_PIPELINE_ID',
    pipeline_stage_id: 'YOUR_STAGE_ID',
    timestamp: new Date().toISOString()
})
```

---

## Troubleshooting

### Contact Not Created in GHL

**Check:**
1. Webhook URL is correct
2. Webhook is active in GHL
3. Check webhook logs in GHL dashboard
4. Verify payload format matches expected fields
5. Check browser console for errors

**Solution:**
- Enable console logging
- Test webhook with Postman or curl
- Check GHL webhook activity logs

### CORS Errors

**Error:** `Access to fetch at 'https://hooks.gohighlevel.com/...' from origin '...' has been blocked by CORS`

**Solution:**
Go High Level webhooks should accept CORS requests. If you see this error:
1. Verify webhook URL is correct
2. Use a backend proxy (recommended for production)
3. Contact GHL support if issue persists

### Duplicate Contacts

**Issue:** Multiple contacts created for same email

**Solution:**
Configure your GHL webhook to "Update if exists":
1. Go to webhook settings
2. Set **Duplicate Check** to "Email"
3. Enable **Update Existing Contact**

### Data Not Showing in GHL

**Check:**
1. Field names match GHL expected fields
2. Data format is correct (e.g., phone format)
3. Custom fields exist in GHL before sending
4. Check webhook mapping

---

## Production Checklist

Before going live:

- [ ] Webhook URL is configured
- [ ] Test email submission works
- [ ] Verify contact appears in GHL
- [ ] Tags are applied correctly
- [ ] Source field is set
- [ ] Automation triggers (if configured)
- [ ] Privacy policy mentions email collection
- [ ] HTTPS is enabled on your site
- [ ] Webhook logs are monitored
- [ ] Error handling is in place

---

## Support

For Go High Level specific issues:
- **GHL Support**: https://support.gohighlevel.com
- **GHL API Docs**: https://highlevel.stoplight.io
- **GHL Community**: https://www.facebook.com/groups/gohighlevel

For this integration:
- Check browser console for errors
- Review webhook activity logs in GHL
- Test with simple curl/Postman request first

---

## Additional Resources

- [Go High Level API Documentation](https://highlevel.stoplight.io)
- [Go High Level Webhooks Guide](https://help.gohighlevel.com/support/solutions/articles/48001181146)
- [Contact API Endpoint](https://highlevel.stoplight.io/docs/integrations/9d0f8f88a8b03-create-contact)

---

**Built for ThaMyind / Myind Sound**
Premium music player with Go High Level integration
