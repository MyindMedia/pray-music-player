# Quick Start Guide - Pray Music Player

Get your music player up and running in **5 minutes**!

## Prerequisites

- A web browser
- Basic text editor
- Your album artwork images
- Your audio file(s)
- Go High Level webhook URL (optional, can add later)

---

## Step 1: Add Your Content (2 minutes)

### Add Images

Replace these placeholder images with your actual album artwork:

1. Navigate to `assets/images/`
2. Add these files (1000x1000px recommended):
   - `pray-cover.jpg` - Your main album cover
   - `the-source-cover.jpg` - Coming soon album 1
   - `c-walk-cover.jpg` - Coming soon album 2
   - `lit-cover.jpg` - Coming soon album 3

**Quick tip:** You can use the provided screenshot or any square image as a temporary placeholder.

### Add Audio

1. Navigate to `assets/audio/`
2. Add your music file:
   - `pray.mp3` - Your main track (MP3 format, 192-320 kbps)

**Don't have audio yet?** The player will work without it, just won't play sound.

---

## Step 2: Test Locally (1 minute)

### Option A: Double-click
Simply open `index.html` in your web browser.

### Option B: Local Server (Recommended)

**Using Python:**
```bash
cd /path/to/Pray
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

**Using Node.js:**
```bash
cd /path/to/Pray
npx http-server
```

**Using VS Code:**
Install "Live Server" extension, then right-click `index.html` → "Open with Live Server"

---

## Step 3: Configure Go High Level (Optional - 2 minutes)

### Get Webhook URL

1. Log into Go High Level
2. Go to **Settings** → **Webhooks**
3. Click **+ Create Webhook**
4. Name it: `Pray Music Player`
5. Copy the webhook URL

### Update Code

1. Open `js/email-capture.js`
2. Find line 12:
   ```javascript
   this.webhookURL = 'YOUR_GO_HIGH_LEVEL_WEBHOOK_URL';
   ```
3. Replace with your webhook URL:
   ```javascript
   this.webhookURL = 'https://hooks.gohighlevel.com/webhook/xxxxx';
   ```
4. Save the file

**Skip for now?** The site works without Go High Level. Email submissions will log to console instead.

---

## Step 4: Deploy (Choose One)

### Easiest: Vercel (Free, 2 minutes)

1. Create account at [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo (or drag & drop folder)
4. Click **Deploy**
5. Done! You'll get a URL like: `https://your-project.vercel.app`

### Alternative: Netlify (Free, 2 minutes)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your `Pray` folder
3. Done! You'll get a URL like: `https://random-name.netlify.app`

### Traditional Hosting

Upload all files via FTP to your web host (cPanel, FileZilla, etc.)

---

## Testing Checklist

After deploying, test these features:

- [ ] Page loads correctly
- [ ] Album artwork displays
- [ ] Click main play button → email modal appears
- [ ] Submit email → success message shows
- [ ] After email capture → music plays (if audio file added)
- [ ] Progress bar moves as song plays
- [ ] Volume control works
- [ ] Coming Soon cards hover effects work
- [ ] Mobile responsive (test on phone)

---

## Customization

### Change Title & Description

Edit `index.html` around line 95:

```html
<h1 class="main-title">"Your Title"</h1>
<p class="main-subtitle">Your description here.</p>
```

### Change Colors

Edit `css/styles.css` starting at line 8:

```css
:root {
    --accent-gold: #d4af37;  /* Change this for different accent */
    --progress-pink: #ff006e; /* Change for different button color */
}
```

### Add More Songs

Edit `js/player.js` starting at line 46 to add more tracks to the playlist.

---

## Common Issues

### "Images not showing"
- Check file names match exactly (case-sensitive)
- Ensure images are in `assets/images/` folder
- Use JPG or PNG format

### "Audio not playing"
- Check audio file is `pray.mp3` in `assets/audio/`
- Try MP3 format (other formats may not work in all browsers)
- Some browsers require user interaction before audio plays (normal behavior)

### "Email modal not appearing"
- Check browser console for errors (F12)
- Clear localStorage: Open console, type `localStorage.clear()`, refresh page
- Verify all `.js` files are loaded

---

## Next Steps

1. **Read the full README.md** for detailed documentation
2. **See GO_HIGH_LEVEL_SETUP.md** for advanced GHL integration
3. **Customize colors and fonts** to match your brand
4. **Add more tracks** to create a full playlist
5. **Set up custom domain** (in Vercel/Netlify settings)
6. **Enable analytics** (Google Analytics, Plausible, etc.)

---

## File Structure Reference

```
Pray/
├── index.html              ← Main HTML file
├── assets/
│   ├── images/            ← Put album artwork here
│   └── audio/             ← Put music files here
├── css/
│   ├── styles.css         ← Change colors here
│   └── animations.css     ← Animation definitions
├── js/
│   ├── player.js          ← Audio player logic
│   ├── email-capture.js   ← Email form (GHL webhook here)
│   └── animations.js      ← UI interactions
└── README.md              ← Full documentation
```

---

## Support

**Need help?**
- Check `README.md` for detailed docs
- Review `GO_HIGH_LEVEL_SETUP.md` for GHL integration
- Open browser console (F12) to see errors
- Verify all files are uploaded correctly

---

## That's It!

You now have a fully functional, premium music player website.

**Enjoy!** 🎵

---

**Pro Tips:**
- Use WebP images for better performance
- Add your own logo by replacing the SVG in `index.html`
- Test on multiple devices before going live
- Set up HTTPS (automatic on Vercel/Netlify)
- Monitor Go High Level contacts to see who's signing up

**Built for ThaMyind / Myind Sound**
