# Setup Notes for "Pray" Music Player

## Missing Assets

### pray-shirt.jpg
You need to add the Pray T-shirt product image to complete the Thank You section.

**Location:** `/assets/images/pray-shirt.jpg`

**Requirements:**
- High-quality product photo of the Pray Heavyweight Cotton T-Shirt
- Recommended size: 800x800px or larger
- Format: JPG or PNG
- Should show the t-shirt clearly with good lighting

**Where it's used:**
- Thank You & Discount Offer section (shown after email capture)
- Links to: https://www.sayitwithyahchest.com/product/essential-heavyweight-cotton-t-shirt-7

---

## How the Thank You Section Works

### Flow:
1. User clicks play → Email modal appears
2. User enters name + (email OR phone) + opts in
3. Form submits to Go High Level webhook
4. Success message shows for 2 seconds
5. Modal closes, music starts playing
6. After 1 second, Thank You section fades in
7. Page auto-scrolls to show the discount offer
8. User can click "Copy Code" to copy PRAY40 to clipboard
9. User can click "Shop the Collection" or the product image to visit the store

### Features:
- **Discount Code:** PRAY40 (40% off)
- **Copy to Clipboard:** Click the "Copy Code" button
- **Smooth animations:** Fade in with slide up effect
- **Mobile responsive:** Stacks vertically on mobile devices
- **Persistent:** Shows on page load if email was previously captured

---

## Testing the Complete Flow

1. Clear localStorage: `localStorage.clear()` in browser console
2. Refresh the page
3. Click the play button
4. Enter your details in the modal
5. Watch the flow: modal → music → Thank You section

---

## Analytics Integration (Optional)

You can add tracking for CTA clicks by adding these scripts to `index.html`:

### Google Analytics (example):
```javascript
document.querySelector('.shop-btn').addEventListener('click', () => {
    gtag('event', 'click', {
        'event_category': 'CTA',
        'event_label': 'Shop Collection - Pray Discount'
    });
});
```

### Facebook Pixel (example):
```javascript
document.querySelector('.shop-btn').addEventListener('click', () => {
    fbq('track', 'ViewContent', {
        content_name: 'Pray Merch Collection',
        content_category: 'Merchandise'
    });
});
```

---

## Files Modified

### HTML
- `index.html` - Added Thank You CTA section and initialization script

### CSS
- `css/styles.css` - Added complete styling for Thank You section with responsive design

### JavaScript
- `js/email-capture.js` - Added `showThankYouSection()` and `initCopyButton()` methods
- Integration with success handler to show section after email capture

---

## Browser Compatibility

- **Clipboard API:** Modern browsers only (Chrome 63+, Firefox 53+, Safari 13.1+)
- **CSS Backdrop Filter:** All modern browsers
- **Smooth Scroll:** All modern browsers with graceful fallback

---

## Notes

- The Thank You section is hidden by default (`display: none`)
- It only appears after successful email capture
- The section persists on page reload if email was captured
- All animations are GPU-accelerated for smooth performance
- Copy button provides visual feedback (green "Copied!" state)
