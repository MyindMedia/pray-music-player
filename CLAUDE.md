# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a premium music player website for ThaMyind's "Pray" track, featuring email/SMS opt-in capture integrated with Go High Level. It's a static site using vanilla HTML, CSS, and JavaScript with no build process required.

## Architecture

### Core Components

**HTML Structure** (`index.html`)
- Single-page application with three main sections:
  - Player card (left): Glassmorphism audio player with controls
  - Main content (center/right): Title, description, Coming Soon grid
  - Email modal (overlay): Lead capture form

**CSS Architecture** (`css/`)
- `styles.css`: Main stylesheet using CSS custom properties, glassmorphism effects, responsive breakpoints (1200px, 768px, 480px)
- `animations.css`: Keyframe animations, page load sequences, interaction feedback

**JavaScript Modules** (`js/`)
- `player.js`: AudioPlayer class - manages HTML5 audio, progress bar dragging, keyboard shortcuts (Space, K, arrows, M)
- `email-capture.js`: EmailCapture class - form validation, Go High Level webhook submission, localStorage gating
- `animations.js`: AnimationController class - intersection observers, toast notifications, performance monitoring

### Key Interactions

1. **User Journey**: User clicks play → email modal appears → submits name/email/phone + opt-in → data sent to GHL → music unlocks → localStorage prevents re-prompting
2. **Email Gate**: `localStorage.getItem('email_captured')` controls modal display
3. **Go High Level Integration**: Direct webhook POST to `https://hooks.gohighlevel.com/webhook/pit-4d9bbb6e-b86d-4d36-b9ee-29475df2e22f`

## Development

### Local Testing

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server

# Then open http://localhost:8000
```

### Required Assets

Before deploying, add these files:

**Images** (`assets/images/`):
- `pray-cover.jpg` - Main album (1000x1000px)
- `the-source-cover.jpg`, `c-walk-cover.jpg`, `lit-cover.jpg` - Coming Soon cards

**Audio** (`assets/audio/`):
- `pray.mp3` - Main track (192-320 kbps)

### Go High Level Configuration

**Current webhook**: Line 16 in `js/email-capture.js`

**Payload sent**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "opt_in": boolean,
  "source": "Pray Music Player - Myind Sound",
  "timestamp": "ISO 8601",
  "tags": ["pray-player", "music-fan", "opted-in"]
}
```

**Field mappings in GHL**:
- Map `name` → Full Name or First Name
- Map `email` → Email
- Map `phone` → Phone
- Map `opt_in` → Custom field or tag
- Map `source` → Source field
- Configure tags: `pray-player`, `music-fan`, `opted-in`

## Deployment

No build process required. Deploy static files directly to:
- **Vercel**: `vercel` (recommended)
- **Netlify**: Drag & drop or `netlify deploy`
- **Traditional**: FTP all files

**HTTPS required** for audio autoplay in modern browsers.

## Common Modifications

### Change Webhook URL
Edit `js/email-capture.js:16`

### Add More Tracks
Edit `js/player.js:46-54` playlist array, add audio files to `assets/audio/`

### Customize Colors
Edit CSS custom properties in `css/styles.css:8-15`

### Update Form Fields
1. Modify HTML in `index.html:133-184`
2. Update JavaScript handlers in `js/email-capture.js`
3. Adjust CSS for new fields in `css/styles.css`

### Change Coming Soon Cards
Edit HTML in `index.html:105-120`, update images in `assets/images/`

## Form Validation

**Email**: RFC 5322 regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
**Phone**: 10-15 digits after removing non-numeric characters
**Opt-in**: Checkbox must be checked (required by law for SMS marketing)

## Browser Support

- Chrome, Firefox, Safari, Edge (latest)
- Mobile Safari iOS 12+, Chrome Mobile Android 8+
- Progressive enhancement: animations disabled for `prefers-reduced-motion`

## Testing Checklist

Before deploying:
1. Add all assets to `assets/` folders
2. Test email submission → check GHL webhook logs
3. Verify localStorage prevents re-prompting
4. Test audio playback after submission
5. Test responsive breakpoints (desktop/tablet/mobile)
6. Check keyboard navigation (Tab, Space, Escape)
7. Verify HTTPS enabled (required for audio)

## Key Files

- `index.html` - Main HTML, email form structure
- `js/email-capture.js:16` - Go High Level webhook URL
- `js/player.js:46` - Playlist configuration
- `css/styles.css:8` - Color scheme variables
- `GO_HIGH_LEVEL_SETUP.md` - Complete GHL integration guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch verification

## Troubleshooting

**Audio won't play**: Check file exists, verify MP3 format, ensure user interaction occurred (required by browsers)

**Modal reappears after submission**: Clear localStorage in DevTools or check `localStorage.setItem('email_captured', 'true')` executes

**GHL not receiving data**: Check webhook URL, verify webhook is active in GHL dashboard, review browser console for CORS errors, check GHL webhook logs

**Images not loading**: Verify file names match exactly (case-sensitive), check paths, ensure images uploaded

## Documentation

- `README.md` - Comprehensive documentation
- `QUICKSTART.md` - 5-minute setup guide
- `GO_HIGH_LEVEL_SETUP.md` - Detailed GHL integration
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- `assets/images/README.md` - Image optimization guide
- `assets/audio/README.md` - Audio format guide
