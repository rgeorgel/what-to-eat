# Media.net Setup Guide

This guide will help you set up Media.net monetization for the What to Eat application.

## Overview

The application has been configured with:
- ✅ Media.net integration with lazy loading
- ✅ Cookie consent banner (GDPR compliant)
- ✅ Strategic ad placements (top, horizontal, sidebar, bottom, in-feed)
- ✅ Responsive ad design
- ✅ Content Security Policy (CSP) headers for Media.net
- ✅ ads.txt file for ad fraud prevention

## What is Media.net?

Media.net is a contextual ad network powered by Yahoo! and Bing. It's one of the largest alternatives to Google AdSense, offering:
- **Contextual ads** - Ads match your content automatically
- **Premium advertisers** - Yahoo/Bing network
- **Good CPMs** - Often higher than AdSense for US/UK/Canada traffic
- **No minimum traffic** - Can apply with any traffic level

## Setup Steps

### 1. Create a Media.net Account

1. Go to [https://www.media.net/](https://www.media.net/)
2. Click "Sign Up" or "Join Now"
3. Fill out the application form:
   - **Website URL**: Your domain (e.g., https://yoursite.com)
   - **Email**: Your contact email
   - **Name**: Your full name
   - **Phone**: Contact number
   - **Website Description**: Describe your restaurant discovery app
   - **Category**: Select "Food & Drink" or "Local/Regional"
   - **Traffic Source**: Describe where your traffic comes from (organic search, social media, etc.)
   - **Monthly Page Views**: Estimate your traffic (be honest)
4. Submit your application

**Approval Time**: 1-3 business days (sometimes same day)

**Note**: Media.net is more selective than AdSense. They prefer:
- Quality content
- English-language sites
- US/UK/Canada traffic (though not required)
- Established sites with some traffic

### 2. Get Your Media.net IDs

Once approved:

1. Log in to your Media.net dashboard
2. Click **"Setup"** → **"Add Site"**
3. Enter your website URL and click "Add"
4. You'll receive your **Customer ID (CID)** - an 8-digit number

**Finding your Customer ID:**
- Dashboard → Account → Customer ID
- Format: 8 digits (e.g., 12345678)

### 3. Create Ad Units

1. In Media.net dashboard, click **"Ad Units"** → **"Create Ad Unit"**
2. Create the following 5 ad units:

   **a) Top Banner Ad**
   - **Size**: 728x90 (Leaderboard)
   - **Type**: Display Ad
   - **Name**: "What to Eat - Top Banner"
   - Copy the **Ad Unit ID** (10-digit code)

   **b) Horizontal Banner Ad**
   - **Size**: 728x90 (Leaderboard)
   - **Type**: Display Ad
   - **Name**: "What to Eat - Horizontal Banner"
   - Copy the **Ad Unit ID**

   **c) Sidebar Ad**
   - **Size**: 300x600 (Half-page)
   - **Type**: Display Ad
   - **Name**: "What to Eat - Sidebar"
   - Copy the **Ad Unit ID**

   **d) Bottom Banner Ad**
   - **Size**: 728x90 (Leaderboard)
   - **Type**: Display Ad
   - **Name**: "What to Eat - Bottom Banner"
   - Copy the **Ad Unit ID**

   **e) In-Feed Ad**
   - **Size**: 336x280 (Large Rectangle)
   - **Type**: In-Content Ad
   - **Name**: "What to Eat - In-Feed"
   - Copy the **Ad Unit ID**

### 4. Update Your Code

You need to update **2 files** with your Media.net information:

#### File 1: `src/WhatToEat.API/wwwroot/js/ads.js`

**Lines 8-18:** Replace placeholders with your IDs:

```javascript
const MEDIANET_CONFIG = {
    // Replace XXXXXXXX with YOUR Customer ID (8 digits)
    customerId: '12345678',  // ← YOUR CUSTOMER ID (CID)

    // Replace XXXXXXXXXX with YOUR Ad Unit IDs (10 digits each)
    adUnits: {
        topBanner: '1234567890',       // ← YOUR TOP BANNER AD UNIT ID
        horizontalBanner: '2345678901', // ← YOUR HORIZONTAL BANNER AD UNIT ID
        sidebar: '3456789012',          // ← YOUR SIDEBAR AD UNIT ID
        bottomBanner: '4567890123',     // ← YOUR BOTTOM BANNER AD UNIT ID
        inFeed: '5678901234'            // ← YOUR IN-FEED AD UNIT ID
    },
    // ...
};
```

#### File 2: `src/WhatToEat.API/wwwroot/ads.txt`

**Lines 13 & 17:** Replace with your Publisher ID:

```
# BEFORE
media.net, YOUR_PUBLISHER_ID, DIRECT
yahoo.com, YOUR_PUBLISHER_ID, DIRECT

# AFTER (example - use your actual ID)
media.net, pub-123456789, DIRECT
yahoo.com, pub-123456789, DIRECT
```

**Finding your Publisher ID for ads.txt:**
- Media.net dashboard → Setup → ads.txt
- Copy the exact line they provide
- Replace the placeholders in your ads.txt file

### 5. Verify ads.txt File

1. After deploying, visit: `https://your-domain.com/ads.txt`
2. You should see your ads.txt file content
3. Media.net will automatically crawl this file
4. Verify in Media.net dashboard under **Setup** → **ads.txt**

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
   - Placeholder ad spaces (actual ads appear after approval)

4. Accept the cookie consent to enable ads

5. Check browser console for any errors (F12 → Console)

6. Look for Media.net script loading:
   - In DevTools → Network tab
   - Filter by "contextual.media.net"
   - Should see successful script loads

### 7. Deploy to Production

1. Deploy your app to your hosting platform
2. Media.net requires your site to be live and accessible
3. Wait 24-48 hours for ads to start appearing
4. Monitor your Media.net dashboard for ad impressions

### 8. Site Verification in Media.net

After deploying:

1. Log in to Media.net dashboard
2. Go to **Setup** → **Add Site**
3. Verify your site is added and approved
4. Check **Ad Units** section to ensure all units are active

### 9. Privacy Policy (REQUIRED)

You **must** add a privacy policy. Create a privacy policy page explaining:

- What data you collect (cookies, user interactions)
- How you use Media.net for advertising
- That third-party vendors may use cookies
- Users' ability to opt out

**Example Privacy Policy Section:**

```
Advertising

We use Media.net to display advertisements on our website. Media.net and its
partners may use cookies and web beacons to collect information about your
browsing activities in order to provide you with relevant advertisements.

You may opt out of personalized advertising by visiting:
- NAI Opt-Out: http://optout.networkadvertising.org/
- DAA Opt-Out: http://optout.aboutads.info/

For more information about Media.net's privacy practices, visit:
https://www.media.net/privacy-policy
```

## Expected Revenue

Revenue varies based on:
- **Traffic volume**: More visitors = more revenue
- **Geographic location**: US/UK/Canada pays most ($2-10 CPM)
- **Niche**: Restaurant/food niche typically earns $1-6 CPM
- **Click-through rate (CTR)**: Typically 0.5-2%
- **Content quality**: Better content = higher CPMs

**Revenue Estimates (US Traffic):**
- 1,000 monthly visitors: $2-10/month
- 10,000 monthly visitors: $20-100/month
- 100,000 monthly visitors: $200-1,000/month
- 1,000,000 monthly visitors: $2,000-10,000/month

**Note**: Media.net often performs better than AdSense for:
- US/UK/Canada traffic
- Tech/Business content
- Desktop traffic

## Troubleshooting

### Ads not showing?

1. **Check console errors**: Open browser DevTools (F12) → Console
2. **Verify Customer ID**: Make sure it matches your Media.net dashboard
3. **Check Ad Unit IDs**: Ensure they're entered correctly in ads.js
4. **Cookie consent**: Make sure you clicked "Accept"
5. **Site approval**: Your site must be approved in Media.net dashboard
6. **Ad blockers**: Disable any ad blockers in your browser
7. **Wait time**: New ad units may take 24-48 hours to start serving

### "Failed to load Media.net script" error?

- Check CSP headers in Program.cs
- Verify `contextual.media.net` is allowed
- Check your network connection
- Try a different browser

### Blank ad spaces?

- Normal during initial setup
- Ads will appear after:
  - Site approval by Media.net
  - Some traffic to the site (Media.net needs to analyze your content)
  - Usually 24-48 hours after going live
  - Ad inventory availability in your region

### Low revenue?

- Media.net performs best with US/UK/Canada traffic
- Need more traffic volume
- Improve content quality
- Try different ad placements
- Monitor dashboard for optimization suggestions

### "Invalid Customer ID" in console?

- Double-check your Customer ID in ads.js
- Make sure it's 8 digits, no quotes or spaces
- Verify it matches your Media.net dashboard exactly

## Ad Placement Locations

The application includes ads at these locations:

1. **Top Banner** - Between header and search section (Desktop: 728x90, Mobile: 320x50)
2. **Horizontal Banner** - Between results count and restaurant list (Desktop: 728x90, Mobile: 320x50)
3. **Sidebar** - Right side of restaurant list (Desktop only: 300x600)
4. **Bottom Banner** - After restaurant list (Desktop: 728x90, Mobile: 320x50)
5. **In-Feed Ads** - Between restaurant cards (every 4 cards, 336x280)

All ads use:
- **Lazy loading** - Ads load when user scrolls near them
- **Responsive design** - Automatically adjusts for mobile/tablet/desktop
- **Cookie consent** - GDPR compliant, requires user consent

## Performance Optimization

The implementation includes:
- ✅ Lazy loading (ads load only when visible)
- ✅ Intersection Observer API for efficient loading
- ✅ Responsive ad sizes (mobile vs desktop)
- ✅ Minimal impact on page load speed
- ✅ Fallback for older browsers

## Payment Information

**Payment Details:**
- **Minimum Payout**: $100 USD
- **Payment Methods**: PayPal, Wire Transfer, Payoneer
- **Payment Schedule**: Net-30 (30 days after month end)
- **Payment Day**: First week of each month

**Example**: Earnings from January are paid in early March.

## Media.net vs AdSense

| Feature | Media.net | Google AdSense |
|---------|-----------|----------------|
| **Approval** | More selective | Easier to get approved |
| **CPM (US)** | $2-10 | $0.50-5 |
| **Best For** | US/UK traffic | Global traffic |
| **Ad Quality** | Contextual (Yahoo/Bing) | Display + Search |
| **Minimum Traffic** | None (but recommended) | None |
| **Support** | Dedicated account manager | Self-service |
| **Payout** | $100 minimum | $100 minimum |

## Alternative Ad Networks

If Media.net rejects your application or you want additional revenue:

1. **PropellerAds** - Pop-unders, native ads (easier approval)
2. **Ezoic** - AI-optimized placements (requires 10k+ visits/month)
3. **Infolinks** - In-text ads (easy approval)
4. **AdThrive** - Premium network (requires 100k+ visits/month)
5. **Mediavine** - Premium network (requires 50k+ sessions/month)
6. **Sovrn //Commerce** - Affiliate links in content
7. **Amazon Associates** - Restaurant/kitchen product affiliates

Each network has different integration, but the ad containers are already in place!

## Important Reminders

⚠️ **Never click your own ads** - This violates Media.net policies and will get you banned
⚠️ **Don't encourage clicks** - No "Click here" or similar text near ads
⚠️ **Avoid prohibited content** - No adult content, violence, hate speech, illegal content
⚠️ **Keep ads.txt updated** - Make sure it's accessible at `yourdomain.com/ads.txt`
⚠️ **Minimum payout**: $100 USD (monthly, Net-30 payment terms)
⚠️ **Quality traffic** - Media.net prefers organic, engaged traffic
⚠️ **Site approval required** - Your site must be live and approved before ads serve

## Support

For Media.net support:
- [Media.net Help Center](https://www.media.net/support)
- Email: support@media.net
- Dashboard → Support (ticket system)
- Live chat available during business hours

## Tips for Success

1. **Focus on quality content** - More restaurant listings, better descriptions
2. **Target US/UK/Canada traffic** - Best CPMs with Media.net
3. **Optimize for desktop** - Media.net ads perform better on desktop
4. **Monitor dashboard** - Check performance and optimization suggestions
5. **Contact account manager** - Once approved, you get a dedicated manager
6. **A/B test placements** - Try different ad positions
7. **Build traffic first** - Get to at least 1,000 visits/month for meaningful revenue

## Next Steps

1. ✅ Sign up for Media.net account
2. ✅ Wait for approval (1-3 days)
3. ✅ Get your Customer ID (CID)
4. ✅ Create 5 ad units and get their IDs
5. ✅ Update ads.js with your IDs
6. ✅ Update ads.txt with your Publisher ID
7. ✅ Add Privacy Policy page
8. ✅ Deploy to production
9. ✅ Verify ads.txt is accessible
10. ✅ Wait 24-48 hours for ads to appear
11. ✅ Monitor Media.net dashboard

Good luck with your monetization! 🎉

---

**Questions?** Check the [Media.net FAQ](https://www.media.net/faq) or contact their support team.
