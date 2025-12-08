# Google AdSense Setup Guide

This guide will help you set up Google AdSense monetization for the What to Eat application.

## Overview

The application has been configured with:
- ✅ Google AdSense integration with lazy loading
- ✅ Cookie consent banner (GDPR compliant)
- ✅ Strategic ad placements (top, horizontal, sidebar, bottom, in-feed)
- ✅ Responsive ad design
- ✅ Content Security Policy (CSP) headers for AdSense
- ✅ ads.txt file for ad fraud prevention

## Setup Steps

### 1. Create a Google AdSense Account

1. Go to [https://www.google.com/adsense](https://www.google.com/adsense)
2. Click "Get Started" and sign in with your Google account
3. Fill out the application form:
   - Enter your website URL
   - Select your content language
   - Agree to the terms and conditions
4. Submit your application and wait for approval (typically 1-3 days)

### 2. Get Your AdSense Publisher ID

Once approved:
1. Log in to your AdSense account
2. Click on "Account" in the left sidebar
3. Click on "Account information"
4. Your **Publisher ID** will be shown in the format: `pub-XXXXXXXXXXXXXXXX`
5. **Copy this ID** - you'll need it for the next steps

### 3. Create Ad Units

1. In your AdSense dashboard, click **"Ads"** → **"By ad unit"**
2. Create the following ad units:

   **a) Top Banner Ad** (Leaderboard)
   - Size: Display ads (728x90 or responsive)
   - Name: "What to Eat - Top Banner"
   - Copy the **Ad Slot ID** (e.g., 1234567890)

   **b) Horizontal Banner Ad** (Leaderboard)
   - Size: Display ads (728x90 or responsive)
   - Name: "What to Eat - Horizontal Banner"
   - Copy the **Ad Slot ID**

   **c) Sidebar Ad** (Skyscraper)
   - Size: Display ads (300x600 or responsive)
   - Name: "What to Eat - Sidebar"
   - Copy the **Ad Slot ID**

   **d) Bottom Banner Ad** (Leaderboard)
   - Size: Display ads (728x90 or responsive)
   - Name: "What to Eat - Bottom Banner"
   - Copy the **Ad Slot ID**

   **e) In-Feed Ad** (Rectangle)
   - Size: In-feed ads (336x280 or responsive)
   - Name: "What to Eat - In-Feed"
   - Copy the **Ad Slot ID**

### 4. Update Your Code

You need to update **3 files** with your AdSense information:

#### File 1: `src/WhatToEat.API/wwwroot/index.html`

**Line 238:** Replace the placeholder with your Publisher ID:
```html
<!-- BEFORE -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"

<!-- AFTER (example) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
```

#### File 2: `src/WhatToEat.API/wwwroot/js/ads.js`

**Lines 8-19:** Update with your Publisher ID and Ad Slot IDs:
```javascript
const ADSENSE_CONFIG = {
    // Replace with YOUR Publisher ID
    publisherId: 'ca-pub-1234567890123456',  // ← YOUR PUBLISHER ID

    // Replace with YOUR Ad Slot IDs
    adSlots: {
        topBanner: '1234567890',      // ← YOUR TOP BANNER AD SLOT
        horizontalBanner: '2345678901', // ← YOUR HORIZONTAL BANNER AD SLOT
        sidebar: '3456789012',         // ← YOUR SIDEBAR AD SLOT
        bottomBanner: '4567890123',    // ← YOUR BOTTOM BANNER AD SLOT
        inFeed: '5678901234'           // ← YOUR IN-FEED AD SLOT
    },
    // ...
};
```

#### File 3: `src/WhatToEat.API/wwwroot/ads.txt`

**Line 15:** Replace with your Publisher ID:
```
# BEFORE
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# AFTER (example)
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

### 5. Verify ads.txt File

1. After deploying, visit: `https://your-domain.com/ads.txt`
2. You should see your ads.txt file content
3. Google will automatically crawl this file within 24 hours
4. You can verify it in AdSense under **"Sites"** → **"ads.txt"**

### 6. Test Your Implementation

1. Build and run your application:
   ```bash
   cd src/WhatToEat.API
   dotnet run
   ```

2. Open your browser to `http://localhost:5000`

3. You should see:
   - Cookie consent banner at the bottom
   - Ad containers with "Advertisement" labels
   - Placeholder ad spaces (actual ads appear after approval and some traffic)

4. Accept the cookie consent to enable ads

5. Check browser console for any errors (F12 → Console)

### 7. AdSense Review & Approval

After updating your code and deploying:

1. Go to AdSense → **"Sites"**
2. Click **"Ready to activate"** next to your site
3. Google will review your site (1-2 weeks typically)
4. Check for:
   - Sufficient content (10+ pages/restaurant listings recommended)
   - Original content (not copied from other sites)
   - Clear navigation
   - Privacy policy (required!)

### 8. Add Privacy Policy (REQUIRED)

You **must** add a privacy policy page. Create a new file or modal explaining:

- What data you collect (cookies, user interactions)
- How you use Google AdSense
- That third-party vendors may use cookies
- Users' ability to opt out

Example privacy policy template:
```
Privacy Policy

We use Google AdSense to display advertisements. Google may use cookies
to serve ads based on your prior visits to our website or other websites.
You may opt out of personalized advertising by visiting Google's Ads Settings.

For more information: https://policies.google.com/technologies/ads
```

## Expected Revenue

Revenue varies based on:
- **Traffic volume**: More visitors = more revenue
- **Geographic location**: US/UK/Canada traffic pays more
- **Niche**: Restaurant/food niche typically earns $0.50-$3 CPM
- **Click-through rate (CTR)**: Typically 0.5-2%

**Example estimates:**
- 1,000 monthly visitors: $1-5/month
- 10,000 monthly visitors: $10-50/month
- 100,000 monthly visitors: $100-500/month
- 1,000,000 monthly visitors: $500-2,500/month

## Troubleshooting

### Ads not showing?

1. **Check console errors**: Open browser DevTools (F12) → Console
2. **Verify Publisher ID**: Make sure it matches your AdSense account exactly
3. **Check CSP headers**: Browser should not block AdSense scripts
4. **Cookie consent**: Make sure you clicked "Accept" on the consent banner
5. **AdSense approval**: Your site must be approved by Google first
6. **Ad blockers**: Disable any ad blockers in your browser
7. **Wait time**: New ad units may take up to 24 hours to start serving

### "Ad slot not found" error?

- Verify your Ad Slot IDs in `ads.js` match those in your AdSense account

### Blank ad spaces?

- Normal during initial setup
- Ads will appear after:
  - Site approval by Google
  - Some traffic to the site (Google needs to learn about your content)
  - Usually 24-48 hours after going live

### CSP errors in console?

- Check that the CSP headers in `Program.cs` include all required AdSense domains
- You may need to add additional domains if Google updates their infrastructure

## Ad Placement Locations

The application includes ads at these locations:

1. **Top Banner** - Between header and search section (Desktop: 728x90, Mobile: 320x50)
2. **Horizontal Banner** - Between results count and restaurant list (Desktop: 728x90, Mobile: 320x50)
3. **Sidebar** - Right side of restaurant list (Desktop only: 300x600)
4. **Bottom Banner** - After restaurant list (Desktop: 728x90, Mobile: 320x50)
5. **In-Feed Ads** - Between restaurant cards (every 4 cards, 336x280)

All ads use:
- **Lazy loading** - Ads load when user scrolls near them (saves bandwidth)
- **Responsive design** - Automatically adjusts for mobile/tablet/desktop
- **Cookie consent** - GDPR compliant, requires user consent

## Performance Optimization

The implementation includes:
- ✅ Lazy loading (ads load only when visible)
- ✅ Intersection Observer API for efficient loading
- ✅ Responsive ad sizes (mobile vs desktop)
- ✅ Minimal impact on page load speed
- ✅ Fallback for older browsers

## Next Steps

1. ✅ Update the 3 files with your AdSense IDs
2. ✅ Add a Privacy Policy page
3. ✅ Deploy your application to production
4. ✅ Submit your site for AdSense review
5. ✅ Wait for approval (1-2 weeks)
6. ✅ Monitor performance in AdSense dashboard

## Alternative Ad Networks

If AdSense rejects your application or you want additional revenue:

1. **Media.net** - Yahoo/Bing network, good for US/UK traffic
2. **Ezoic** - AI-optimized ad placements (requires 10k+ visits/month)
3. **PropellerAds** - Pop-unders and native ads
4. **AdThrive** - Premium network (requires 100k+ visits/month)
5. **Mediavine** - Premium network (requires 50k+ sessions/month)

Each network has different integration steps, but the ad containers are already in place!

## Support

For AdSense support:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community Forum](https://support.google.com/adsense/community)
- [Contact AdSense Support](https://support.google.com/adsense/gethelp)

## Important Reminders

⚠️ **Never click your own ads** - This violates AdSense policies and will get you banned
⚠️ **Don't encourage clicks** - No "Click here" or similar text near ads
⚠️ **Avoid prohibited content** - No adult content, violence, hate speech, etc.
⚠️ **Keep ads.txt updated** - Make sure it's accessible at `yourdomain.com/ads.txt`
⚠️ **Minimum payout**: $100 USD (monthly, via direct deposit or check)

Good luck with your monetization! 🎉
