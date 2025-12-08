# 30-Day Prayer Journey Opt-In Strategy
## Best Practices for pray.myindsound.com

---

## THE QUESTION

Where should people opt into the 30-Day Prayer Journey on your music player site?

**Options:**
1. Email capture modal (when they unlock the music)
2. Checkbox on the email form
3. Separate sign-up section on the site
4. Post-music thank you section

---

## RECOMMENDED STRATEGY: **Two-Step Opt-In**

### **Step 1: Email Capture Modal (Required)**
- User enters email to unlock music
- NO checkbox for prayer journey yet (keep it simple)
- Focus: Get the email and unlock the music

### **Step 2: Thank You Section with Prayer Journey Opt-In (Optional)**
- After email is submitted and music unlocks
- Show the thank you section with PRAY20 discount
- Add a clear, compelling CTA to join the 30-Day Prayer Journey
- This is where they opt in with phone number

---

## WHY THIS WORKS BEST

✅ **Reduces Friction at First Touch**
- People are more likely to give email first (low commitment)
- Don't overwhelm them with too many asks upfront
- Get them in the door, then upsell the prayer journey

✅ **Increases Overall Conversions**
- More people will unlock the music (higher email capture rate)
- Those who love the music are more likely to opt into the journey
- You're asking for phone number AFTER they've experienced value

✅ **Segmentation Opportunity**
- Email list: Everyone who unlocked the music
- SMS list: Engaged fans who want the prayer journey
- You can nurture both groups differently

✅ **Better User Experience**
- Doesn't feel pushy or overwhelming
- Natural progression: Music → Value → Deeper engagement
- People opt in because they WANT to, not because they have to

---

## OPTION BREAKDOWN

### ❌ Option 1: Checkbox on Email Modal (NOT RECOMMENDED)

**How it works:**
```
Email Capture Modal:
- Email: [___________]
- ☐ Yes, send me the 30-Day Prayer Journey via SMS
- Phone: [___________]
- [Unlock Music]
```

**Pros:**
- Captures everything at once
- Simple for you to set up

**Cons:**
- Too much friction upfront (email + phone + checkbox = high drop-off)
- People don't know if they want the prayer journey yet (they haven't heard the music)
- Asking for phone number before providing value = lower conversion
- Feels pushy and salesy
- Lower email capture rate

**Verdict:** ❌ Don't do this. Too much friction.

---

### ✅ Option 2: Two-Step Opt-In (RECOMMENDED)

**How it works:**

**Step 1: Email Modal (Simple)**
```
[Modal appears when they click play]

🎵 Unlock "Pray" - Your Anthem for Peace

Enter your email to listen to the full song:

Email: [___________]

[Unlock Music]

By submitting, you'll also get exclusive updates and a special discount.
```

**Step 2: Thank You Section (After Music Unlocks)**
```
[Thank you section fades in below the player]

🙏 Thank You for Listening!

Want to go deeper? Join the 30-Day Prayer Journey and receive daily prayers, scripture, and encouragement via text.

[Image of Pray shirt]

PLUS: Get 20% off the "Pray" collection with code PRAY20

☐ Yes, send me daily prayers for 30 days (text message)
Phone: [___________]

[Join the Journey] [No Thanks, Just Shop]
```

**Pros:**
- Low friction at first touch (just email)
- Higher email capture rate
- People opt into prayer journey AFTER experiencing value
- Natural upsell flow
- Better user experience
- Can still collect phone numbers from engaged fans

**Cons:**
- Requires two forms instead of one
- Not everyone will opt into the prayer journey (but that's okay - you still have their email)

**Verdict:** ✅ This is the best approach.

---

### ✅ Option 3: Separate Section on Site (ALSO GOOD)

**How it works:**

**Email Modal:**
- Just email, no prayer journey mention

**Separate Section on Site (Below Thank You Section):**
```
📖 30-Day Prayer Journey

Life getting heavy? Prayer is your power source.

Join thousands of people who start their day with a prayer, scripture, and encouragement via text.

✅ Daily prayers for 30 days
✅ Biblical encouragement
✅ Reflection questions
✅ Community support

[Join Now - It's Free]

[Form]
Name: [___________]
Phone: [___________]
[Start My Journey]
```

**Pros:**
- Completely separate from music unlock (no confusion)
- Can explain the prayer journey in detail
- People who want it will sign up
- Can link to this section from emails, Instagram, etc.

**Cons:**
- Requires scrolling or navigation
- Lower visibility than the thank you section
- Extra step for users

**Verdict:** ✅ Good as a supplement, but not the primary method.

---

## RECOMMENDED IMPLEMENTATION

### **Primary Method: Two-Step Opt-In**

**Step 1: Email Modal (Simple)**
```html
<div class="email-modal">
  <h2>🎵 Unlock "Pray"</h2>
  <p>Your anthem for peace in the pressure. Enter your email to listen:</p>
  
  <form id="unlock-form">
    <input type="email" placeholder="Your email" required>
    <button type="submit">Unlock Music</button>
  </form>
  
  <p class="disclaimer">You'll also get exclusive updates and a special discount.</p>
</div>
```

**Step 2: Thank You Section (After Unlock)**
```html
<div class="thank-you-section" style="display: none;">
  <div class="left-column">
    <img src="pray-shirt.jpg" alt="Pray Shirt">
  </div>
  
  <div class="right-column">
    <h2>🙏 Thank You for Listening!</h2>
    <p>Want to go deeper?</p>
    
    <div class="prayer-journey-cta">
      <h3>Join the 30-Day Prayer Journey</h3>
      <p>Receive daily prayers, scripture, and encouragement via text.</p>
      
      <form id="prayer-journey-form">
        <input type="checkbox" id="opt-in" name="opt-in">
        <label for="opt-in">Yes, send me daily prayers for 30 days</label>
        
        <input type="tel" id="phone" placeholder="Your phone number" style="display: none;">
        
        <button type="submit">Join the Journey</button>
      </form>
    </div>
    
    <div class="discount-section">
      <h3>PLUS: Get 20% Off</h3>
      <p>Use code <strong>PRAY20</strong> on the "Pray" collection</p>
      <a href="{{trigger_link.kLFgxhzfDN8vh1ta9VWL}}" class="btn">Shop Now</a>
    </div>
  </div>
</div>
```

**JavaScript Logic:**
```javascript
// Step 1: Email submission
document.getElementById('unlock-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = this.querySelector('input[type="email"]').value;
  
  // Send to GHL
  submitToGHL(email);
  
  // Hide modal, unlock music, show thank you section
  document.querySelector('.email-modal').style.display = 'none';
  document.querySelector('.music-player').classList.add('unlocked');
  document.querySelector('.thank-you-section').style.display = 'flex';
});

// Step 2: Prayer journey opt-in
document.getElementById('opt-in').addEventListener('change', function() {
  const phoneField = document.getElementById('phone');
  if (this.checked) {
    phoneField.style.display = 'block';
    phoneField.required = true;
  } else {
    phoneField.style.display = 'none';
    phoneField.required = false;
  }
});

document.getElementById('prayer-journey-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const optIn = document.getElementById('opt-in').checked;
  const phone = document.getElementById('phone').value;
  
  if (optIn && phone) {
    // Send to GHL with "30-Day Prayer Subscriber" tag
    submitPrayerJourneyToGHL(phone);
    
    // Show success message
    alert('You're in! Your first prayer arrives tomorrow at 7am. 🙏');
  }
});
```

---

## ALTERNATIVE: Checkbox That Shows Phone Field

**Even Simpler UX:**

```html
<div class="thank-you-section">
  <h2>🙏 Thank You!</h2>
  
  <div class="prayer-journey-cta">
    <label>
      <input type="checkbox" id="opt-in">
      <strong>Yes, send me the 30-Day Prayer Journey via text</strong>
    </label>
    
    <div id="phone-field" style="display: none;">
      <input type="tel" placeholder="Your phone number">
      <button>Join Now</button>
    </div>
  </div>
  
  <div class="discount-section">
    <p>Use code <strong>PRAY20</strong> for 20% off</p>
    <a href="#">Shop the Collection</a>
  </div>
</div>
```

**When they check the box:**
- Phone field slides down
- They enter phone number
- Click "Join Now"
- Tagged in GHL as "30-Day Prayer Subscriber"
- Day 1 prayer sends the next day at 7am

---

## CONVERSION RATE ESTIMATES

### Option 1: Checkbox on Email Modal
- **Email Capture Rate:** 40-50% (high friction)
- **Prayer Journey Opt-In Rate:** 20-30% of emails
- **Overall SMS Subscribers:** 8-15% of visitors

### Option 2: Two-Step Opt-In (RECOMMENDED)
- **Email Capture Rate:** 70-80% (low friction)
- **Prayer Journey Opt-In Rate:** 30-40% of emails
- **Overall SMS Subscribers:** 21-32% of visitors

### Option 3: Separate Section Only
- **Email Capture Rate:** 70-80%
- **Prayer Journey Opt-In Rate:** 10-15% of emails (lower visibility)
- **Overall SMS Subscribers:** 7-12% of visitors

**Winner:** Two-Step Opt-In (Option 2) - Highest overall conversion rate

---

## COPY RECOMMENDATIONS

### Email Modal (Step 1)
**Headline Options:**
- "🎵 Unlock 'Pray' - Your Anthem for Peace"
- "🎵 Listen to 'Pray' - Free"
- "🎵 Hear the Full Song"

**Subheadline:**
- "Enter your email to unlock the full track"
- "Get instant access + exclusive updates"
- "Listen now, completely free"

**Button:**
- "Unlock Music"
- "Listen Now"
- "Get Access"

---

### Thank You Section (Step 2)

**Prayer Journey CTA:**

**Option A (Direct):**
```
🙏 Want to Go Deeper?

Join the 30-Day Prayer Journey and receive daily prayers, scripture, and encouragement via text.

☐ Yes, send me daily prayers for 30 days
Phone: [___________]

[Join the Journey]
```

**Option B (Benefit-Focused):**
```
🙏 Start Your Day with Prayer

Join thousands who receive daily prayers, scripture, and encouragement every morning at 7am.

✅ 30 days of biblical prayers
✅ Daily scripture & reflection
✅ Text message delivery
✅ 100% free

☐ Yes, I'm in!
Phone: [___________]

[Start My Journey]
```

**Option C (Story-Driven):**
```
🙏 This Song is Just the Beginning

"Pray" is about finding peace in the pressure. The 30-Day Prayer Journey takes you deeper with daily prayers, scripture, and encouragement sent right to your phone.

☐ Send me daily prayers for 30 days
Phone: [___________]

[Join Now - It's Free]
```

**Recommended:** Option B (Benefit-Focused) - Clearest value proposition

---

## TECHNICAL SETUP IN GHL

### Step 1: Email Capture
**Form Submission → GHL Workflow:**
1. Create contact with email
2. Add tag: "Pray Player Form"
3. Send Email 1 (Welcome + Song Link)
4. Wait 2 days → Send Email 2
5. Wait 4 days → Send Email 3 (Merch + PRAY20)
6. Wait 3 days → Send Email 4 (Final reminder)

### Step 2: Prayer Journey Opt-In
**Form Submission → GHL Workflow:**
1. Update contact with phone number
2. Add tag: "30-Day Prayer Subscriber"
3. Trigger 30-Day Prayer Journey workflow
4. Send Day 1 prayer the next day at 7am
5. Continue for 30 days

---

## FINAL RECOMMENDATION

### **Use Two-Step Opt-In:**

1. **Email Modal** - Simple, just email to unlock music
2. **Thank You Section** - Checkbox + phone field for prayer journey opt-in

### **Why:**
- Highest overall conversion rate (21-32% SMS subscribers)
- Best user experience (low friction upfront)
- Natural progression (value first, then upsell)
- Captures both email and SMS lists
- Allows for segmentation and targeted nurturing

### **Bonus:**
- Add a separate "30-Day Prayer Journey" section on the site for direct sign-ups
- Link to it from Instagram, emails, and other channels
- Use it as a standalone landing page

---

## NEXT STEPS

1. **Update pray.myindsound.com:**
   - Keep email modal simple (just email)
   - Add thank you section with prayer journey opt-in
   - Include PRAY20 discount and merch link

2. **Set up GHL workflows:**
   - Email nurture sequence (4 emails)
   - 30-Day Prayer Journey SMS sequence
   - Tag management ("Pray Player Form" + "30-Day Prayer Subscriber")

3. **Test the flow:**
   - Submit email → Music unlocks
   - Opt into prayer journey → Receive Day 1 prayer
   - Verify tags and workflows trigger correctly

4. **Monitor conversion rates:**
   - Email capture rate
   - Prayer journey opt-in rate
   - Overall SMS subscriber rate
   - Adjust copy and design based on data

---

**This strategy will maximize both your email and SMS lists while providing the best user experience!** 🚀
