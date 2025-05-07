# Free Safe Alternative to Google Review Gating

A smart review collection system that generates location-specific review pages with QR codes.

### 🚫 What is Review Gating?

- Asking customers how they feel *before* asking for a review.  
- Happy ones get sent to Google, unhappy ones get filtered out.  
- This is **against Google’s policy** and risks **penalties** or **review removal**.

### ✅ Safe Alternative to Review Gating

- Ask for feedback **without filtering**.  
- Give customers **two clear options**:  
  - Contact the business  
  - Leave a Google review  
- Let **everyone choose** — no redirects based on sentiment.

### 🎯 I've Built a Free Tool That Does This the Right Way

- Add **multiple Google locations**.  
- Generate **review request links** and **QR codes** for each one.  
- Automatically offer customers to **chat with you on WhatsApp** if they need help.  
- Fully **compliant**, fully **transparent**.


---

> ### 🤖 Checkout Cloodot's AI Agent → [cloodot.com](https://www.cloodot.com)
>
> Build an AI agent that not only **answers customer questions**, but also **sells** by chatting directly with them on:
>
> - 💬 **Facebook Messenger**  
> - 📸 **Instagram DMs**  
> - 📱 **WhatsApp**
> 
> Boost conversions by being available 24/7 — with **zero manual effort**.

---



# Quick Setup Guide

## What is this?
A simple review system that:
- Shows happy customers (4-5 stars) a link to your Google review page
- Offers unhappy customers (1-3 stars) a way to contact you via WhatsApp

## Setup Steps

1. Create a file named `enter_location_details_here.txt` with:
   ```
   Domain:https://your-website.com
   whatsapp:https://wa.me/1234567890
   Store Name 1|https://goo.gl/maps/your-google-review-link-1
   Store Name 2|https://goo.gl/maps/your-google-review-link-2
   ```

2. Run:
   ```
   node smart_rev_build.js
   ```

3. Upload the generated `smart_rev.html` to your website

4. Use these links for each location:
   - Check `generated_review_links.txt` for your links (eg: `https://your-website.com/smart_rev.html?loc=1`)
   - check qrcodes folder for your review request qr codes

## What Users Will See

1. If they rate 4-5 stars:
   - "Thank you" message
   - Prompt customer to leave a Google review

2. If they rate 1-3 stars:
   - Text box to describe their issue
   - WhatsApp button to contact you
   - Link to Google review page

