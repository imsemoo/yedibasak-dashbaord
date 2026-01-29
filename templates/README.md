# Email & PDF Templates - Complete Documentation

## 📋 Template Deliverables Overview

Enterprise-grade email and PDF templates for the Charity Donations Platform.

---

## 📁 File Manifest

```
templates/
├── email/
│   ├── donation-receipt.html        ✅ HTML donation receipt email
│   ├── donation-receipt.txt         ✅ Plain text fallback
│   ├── donation-confirmation.html   ✅ HTML confirmation email  
│   ├── donation-confirmation.txt    ✅ Plain text fallback
│   ├── recurring-confirmation.html  ✅ HTML recurring setup email
│   └── recurring-confirmation.txt   ✅ Plain text fallback
├── pdf/
│   ├── donation-receipt.html        ✅ Generic (auto-detect)
│   ├── donation-receipt.a4.html     ✅ A4 format (210mm × 297mm)
│   ├── donation-receipt.letter.html ✅ Letter format (8.5" × 11")
│   ├── donation-confirmation.html   ✅ Generic (auto-detect)
│   ├── donation-confirmation.a4.html     ✅ A4 format
│   └── donation-confirmation.letter.html ✅ Letter format
├── STYLE-GUIDE.md                   ✅ Design tokens reference
└── README.md                        ✅ This file
```

---

## 📧 EMAIL TEMPLATES

### Common Features (All Email Templates)

| Feature | Status | Notes |
|---------|--------|-------|
| Table-based layout | ✅ | 100% Outlook compatible |
| Inline CSS | ✅ | No external stylesheets |
| 600px max-width | ✅ | Standard email width |
| VML Bulletproof Buttons | ✅ | Works in Outlook 2007-2019 |
| Dark Mode Support | ✅ | `@media (prefers-color-scheme: dark)` |
| Mobile Responsive | ✅ | `@media (max-width: 600px)` |
| Preheader Text | ✅ | Hidden preview text |
| Plain Text Fallback | ✅ | .txt version for each |
| Dynamic Tokens | ✅ | See Token Reference below |

### 1. Donation Receipt Email

**Files:** `email/donation-receipt.html`, `email/donation-receipt.txt`

**Header Color:** Teal (#15C5CE)

**Sections:**
- A. Preheader (hidden preview text)
- B. Header with logo (white on teal)
- C. Thank-you hero with checkmark icon
- D. Donation summary card
- E. CTA buttons (View Receipt / Download PDF)
- F. Recurring info (optional, orange box)
- G. Support footer
- H. Legal footer

### 2. Donation Confirmation Email

**Files:** `email/donation-confirmation.html`, `email/donation-confirmation.txt`

**Header Color:** Green (#26B65C)

**Sections:**
- A. Preheader
- B. Header with logo (white on green)
- C. Success hero with checkmark
- D. Confirmation details card
- E. Amount highlight box
- F. CTA buttons
- G. "What's Next" steps
- H. Support & Legal footer

### 3. Recurring Confirmation Email

**Files:** `email/recurring-confirmation.html`, `email/recurring-confirmation.txt`

**Header Color:** Orange (#E67514)

**Sections:**
- A. Preheader
- B. Header with logo (white on orange)
- C. Recurring icon hero
- D. Recurring details card (amount, frequency, charge day)
- E. Campaign info card
- F. Manage Subscription CTA
- G. Info note box
- H. Support & Legal footer

---

## 📄 PDF TEMPLATES

### Page Specifications

| Property | A4 | Letter |
|----------|----|----|
| Dimensions | 210mm × 297mm | 8.5" × 11" |
| Top Margin | 20mm | 0.75" |
| Side Margins | 15mm | 0.6" |
| Bottom Margin | 25mm | 1" |
| Content Width | ~180mm | ~7.3" |

### Common Features (All PDF Templates)

| Feature | Status | Notes |
|---------|--------|-------|
| Print-optimized CSS | ✅ | No shadows, solid borders |
| Grayscale Support | ✅ | `@media print and (monochrome)` |
| QR Code Verification | ✅ | Scan to verify receipt |
| Signature Area | ✅ | With stamp placeholder |
| 8pt Spacing Grid | ✅ | Consistent spacing |
| Dynamic Tokens | ✅ | See Token Reference |
| Tax Deductible Badge | ✅ | Official receipt indicator |

### 1. Donation Receipt PDF

**Files:** `pdf/donation-receipt.a4.html`, `pdf/donation-receipt.letter.html`

**Border Color:** Primary Teal (#15C5CE)

**Sections:**
1. Header (logo + "OFFICIAL DONATION RECEIPT" + badge)
2. Donor Information block
3. Donation Details table
4. Totals box
5. Recurring section (if applicable)
6. Verification section with QR code
7. Signature area with stamp
8. Footer with legal text

### 2. Donation Confirmation PDF

**Files:** `pdf/donation-confirmation.a4.html`, `pdf/donation-confirmation.letter.html`

**Border Color:** Success Green (#26B65C)

**Sections:**
1. Header (logo + "DONATION CONFIRMATION" + badge)
2. Hero thank-you message with amount
3. Donor Information block
4. Confirmation details table
5. Totals box
6. "What's Next" steps box
7. Verification section with QR code
8. Footer with legal text

---

## 🎨 Dynamic Tokens Reference

### Organization Tokens
```
{{org_name}}          → Yedi Basak Insani Yardim Dernegi
{{org_address}}       → Molla Gürani Mah. Turgut Özal Cad. No:72...
{{org_phone}}         → +90 212 123 4567
{{org_website}}       → www.yedibasak.org
{{org_reg_number}}    → 34-7654321
{{support_email}}     → info@yedibasak.org
{{current_year}}      → 2026
```

### Donor Tokens
```
{{donor_name}}        → Ahmed Al-Rashid
{{donor_email}}       → ahmed.rashid@email.com
{{donor_phone}}       → +90 532 123 4567
{{donor_address}}     → Fatih, Istanbul, Turkey 34000
```

### Donation Tokens
```
{{receipt_id}}        → DON-2026-00148
{{donation_date}}     → January 28, 2026
{{donation_type}}     → Zakat
{{campaign_name}}     → Emergency Relief Fund
{{payment_method}}    → Visa ····4242
{{transaction_id}}    → ch_3LxG7Q9LJf9kPq
{{donation_status}}   → Completed
{{donation_status_class}} → completed (CSS class: completed|pending|processing|refunded|failed)
```

### Amount Tokens
```
{{currency}}          → $
{{donation_amount}}   → 1,200.00
{{fees}}              → 12.00
{{total}}             → 1,212.00
```

### Recurring Tokens
```
{{recurring_frequency}} → Monthly
{{recurring_day}}       → 15
{{next_charge_date}}    → February 15, 2026
{{manage_subscription_url}} → https://...
{{is_recurring}}        → true/false (for conditional sections)
```

### URL Tokens
```
{{receipt_url}}       → https://yedibasak.org/receipts/DON-2026-00148
{{pdf_url}}           → https://yedibasak.org/receipts/DON-2026-00148/download
{{verification_url}}  → https://yedibasak.org/verify/DON-2026-00148
{{qr_code}}           → [QR image URL or base64]
{{privacy_url}}       → https://yedibasak.org/privacy
{{terms_url}}         → https://yedibasak.org/terms
{{unsubscribe_url}}   → https://yedibasak.org/unsubscribe/...
```

---

## 🎨 Customization Guide

### Changing Brand Colors

Edit the CSS variables in each template:

```css
:root {
  /* Primary Colors */
  --color-primary: #15C5CE;     /* Main brand color (teal) */
  --color-primary-dark: #0f9aa2;
  --color-accent: #E67514;       /* Secondary color (orange) */
  --color-success: #26B65C;      /* Success/confirmation (green) */
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  
  /* Neutrals */
  --color-text: #212121;
  --color-text-muted: #6B7280;
  --color-border: #E2E8F3;
  --color-surface: #F8FAFC;
}
```

### Changing Fonts

**Email:** Uses system fonts (cannot be changed for reliability):
```css
font-family: Arial, Helvetica, sans-serif;
```

**PDF:** Can use custom fonts:
```css
@font-face {
  font-family: 'Inter';
  src: url('../../assets/fonts/Inter-Regular.woff2') format('woff2');
}
```

### Changing Logo

1. Place your logo in `assets/img/`
2. Update the `src` attribute in templates:
   - Color logo: `assets/img/logo.svg` or `logo.png`
   - White logo (for colored headers): `assets/img/logo-white.svg`

**Email templates use white logo on colored backgrounds.**

---

## ✅ Compatibility Checklist

### Outlook Compatibility
- [x] DOCTYPE: HTML5 with XML namespaces
- [x] MSO conditional comments
- [x] VML buttons for Outlook 2007-2019
- [x] Table-based layout (no flexbox/grid)
- [x] Inline CSS only
- [x] Arial font stack
- [x] No CSS animations
- [x] Background colors via `bgcolor` attribute

### Gmail Compatibility
- [x] Inline CSS (Gmail strips `<style>` in many cases)
- [x] Web-safe colors
- [x] Fallback fonts
- [x] Alt text on all images
- [x] Responsive design

### Apple Mail / iOS
- [x] Dark mode support
- [x] `<meta name="color-scheme">`
- [x] High contrast colors
- [x] Touch-friendly buttons (min 44px)

### PDF Print Compatibility
- [x] No shadows (print-unfriendly)
- [x] Grayscale fallback
- [x] Page break rules
- [x] Print-optimized fonts
- [x] Border-based design

---

## 🔧 Integration Examples

### Node.js Email Sending (Nodemailer)

```javascript
const nodemailer = require('nodemailer');
const fs = require('fs');

// Load template
let html = fs.readFileSync('templates/email/donation-receipt.html', 'utf8');

// Replace tokens
const data = {
  donor_name: 'Ahmed Al-Rashid',
  donation_amount: '1,200.00',
  // ... more tokens
};

Object.keys(data).forEach(key => {
  html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
});

// Send email
await transporter.sendMail({
  from: 'no-reply@yedibasak.org',
  to: 'donor@example.com',
  subject: 'Your Donation Receipt',
  html: html,
  text: fs.readFileSync('templates/email/donation-receipt.txt', 'utf8')
});
```

### PDF Generation (Puppeteer)

```javascript
const puppeteer = require('puppeteer');

async function generatePDF(templatePath, outputPath, data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Load template
  let html = fs.readFileSync(templatePath, 'utf8');
  
  // Replace tokens
  Object.keys(data).forEach(key => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4', // or 'Letter'
    printBackground: true,
    margin: { top: '20mm', bottom: '25mm', left: '15mm', right: '15mm' }
  });
  
  await browser.close();
}
```

### QR Code Generation

```javascript
const QRCode = require('qrcode');

// Generate QR code as data URL
const qrDataUrl = await QRCode.toDataURL(
  'https://yedibasak.org/verify/DON-2026-00148',
  { width: 150, margin: 1 }
);

// Use in template
html = html.replace('{{qr_code}}', qrDataUrl);
```

Or use a public API:
```
https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{verification_url}}
```

---

## 🧪 Testing Recommendations

### Email Testing
1. **Litmus** - Cross-client preview
2. **Email on Acid** - Rendering tests
3. **Mail Tester** - Spam score check

### Test Clients
- Outlook 2016/2019/365 (Windows)
- Apple Mail (macOS/iOS)
- Gmail (Web/Mobile)
- Yahoo Mail
- Outlook.com

### PDF Testing
- Print to PDF (Chrome/Firefox)
- Adobe Acrobat Reader
- Preview (macOS)
- Physical print test

---

## 📊 Status Pills Reference

| Status | CSS Class | Background | Text |
|--------|-----------|------------|------|
| Completed | `pdf-status--completed` | `rgba(38,182,92,0.15)` | `#15803d` |
| Confirmed | `pdf-status--confirmed` | `rgba(38,182,92,0.15)` | `#15803d` |
| Processing | `pdf-status--processing` | `rgba(21,197,206,0.15)` | `#0f9aa2` |
| Pending | `pdf-status--pending` | `rgba(245,158,11,0.15)` | `#b45309` |
| Refunded | `pdf-status--refunded` | `rgba(107,114,128,0.15)` | `#4b5563` |
| Failed | `pdf-status--failed` | `rgba(239,68,68,0.15)` | `#dc2626` |

---

## 📝 Notes

### Logo Files
- `assets/img/logo.svg` - Full color logo
- `assets/img/logo.png` - PNG fallback
- `assets/img/logo-white.svg` - White version for colored backgrounds

### Email Images
For production, host images on a CDN and use absolute URLs:
```html
<img src="https://cdn.yedibasak.org/email/logo-white.png" />
```

### Conditional Sections
Use template engine syntax for conditional content:
```html
{{#if is_recurring}}
<section class="pdf-recurring">...</section>
{{/if}}
```

---

© 2026 Yedi Basak Insani Yardim Dernegi
