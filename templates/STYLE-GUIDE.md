# Charity Donations Platform - Template Style Guide

## Design System Reference

This style guide ensures consistency between the dashboard and email/PDF templates.

---

## 1. Color Palette

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary (Teal)** | `#15C5CE` | rgb(21, 197, 206) | Buttons, links, headers, accents |
| **Primary Dark** | `#0f9aa2` | rgb(15, 154, 162) | Hover states, emphasis |
| **Primary Soft** | `#e5fbfc` | rgb(229, 251, 252) | Backgrounds, highlights |

### Accent Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Accent (Orange)** | `#E67514` | rgb(230, 117, 20) | Recurring info, warnings, highlights |
| **Accent Soft** | `#FFF7ED` | rgb(255, 247, 237) | Recurring section backgrounds |

### Status Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Success** | `#26B65C` | rgb(38, 182, 92) | Completed, positive states |
| **Warning** | `#F59E0B` | rgb(245, 158, 11) | Pending, attention needed |
| **Danger** | `#EF4444` | rgb(239, 68, 68) | Failed, errors |
| **Info** | `#2563EB` | rgb(37, 99, 235) | Informational badges |

### Neutral Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Text** | `#212121` | rgb(33, 33, 33) | Primary text |
| **Text Muted** | `#6B7280` | rgb(107, 114, 128) | Secondary text, labels |
| **Text Light** | `#9CA3AF` | rgb(156, 163, 175) | Tertiary text, captions |
| **Border** | `#E2E8F3` | rgb(226, 232, 243) | Dividers, borders |
| **Surface** | `#F8FAFC` | rgb(248, 250, 252) | Card backgrounds |
| **Background** | `#F6F8FB` | rgb(246, 248, 251) | Page backgrounds |
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Cards, containers |

---

## 2. Typography

### Email Typography (System Safe Stack)
```css
font-family: Arial, Helvetica, sans-serif;
```

### PDF Typography (Embed-Ready)
```css
font-family: 'Inter', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
```

### Type Scale

#### Email Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Title / H1 | 24-26px | 700 | 1.2 |
| H2 | 22px | 700 | 1.3 |
| H3 | 18px | 600 | 1.4 |
| H4 | 16px | 600 | 1.4 |
| Body | 14-16px | 400 | 1.6 |
| Small | 13px | 400 | 1.5 |
| Micro | 11-12px | 400 | 1.5 |

#### PDF Scale (pt)
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Title | 22pt | 700 | 1.2 |
| Section Header | 12pt | 600 | 1.4 |
| Body | 10pt | 400 | 1.5 |
| Small | 9pt | 400 | 1.5 |
| Micro | 8pt | 400 | 1.5 |

---

## 3. Spacing System (8pt Grid)

### CSS Custom Properties (PDF)
```css
--space-1: 2mm;   /* 8pt grid × 0.25 */
--space-2: 4mm;   /* 8pt grid × 0.5 */
--space-3: 6mm;   /* 8pt grid × 0.75 */
--space-4: 8mm;   /* 8pt grid × 1 */
--space-5: 10mm;  /* 8pt grid × 1.25 */
--space-6: 12mm;  /* 8pt grid × 1.5 */
--space-8: 16mm;  /* 8pt grid × 2 */
```

### Email Spacing (px)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 8px | Tight spacing |
| sm | 12px | Small gaps |
| md | 16px | Standard spacing |
| lg | 24px | Section gaps |
| xl | 32px | Major sections |
| 2xl | 40px | Container padding |

---

## 4. Border & Radius

### Email
```css
border-radius: 12-16px;  /* Buttons, cards */
border-radius: 50px;     /* Pills, badges */
border: 1px solid #E2E8F3;
```

### PDF (Print-optimized)
```css
border-radius: 3-4mm;
border: 0.5pt solid #E2E8F3;
```

---

## 5. Status Pill Styles

### Completed (Success)
```css
background-color: rgba(38, 182, 92, 0.15);
color: #15803d;
border: 0.5pt solid rgba(38, 182, 92, 0.3);
```

### Pending (Warning)
```css
background-color: rgba(245, 158, 11, 0.15);
color: #b45309;
border: 0.5pt solid rgba(245, 158, 11, 0.3);
```

### Refunded (Neutral)
```css
background-color: rgba(107, 114, 128, 0.15);
color: #4b5563;
border: 0.5pt solid rgba(107, 114, 128, 0.3);
```

### Failed (Danger)
```css
background-color: rgba(239, 68, 68, 0.15);
color: #dc2626;
border: 0.5pt solid rgba(239, 68, 68, 0.3);
```

---

## 6. Button Styles

### Primary Button (Email - Bulletproof)
```html
<!-- Outlook VML -->
<v:roundrect style="height:48px;v-text-anchor:middle;width:220px;" 
             arcsize="25%" fillcolor="#15C5CE">
  <center style="color:#ffffff;font-family:Arial,sans-serif;
                 font-size:16px;font-weight:600;">
    Button Text
  </center>
</v:roundrect>

<!-- Standard -->
<a style="display:inline-block;background-color:#15C5CE;color:#ffffff;
          font-size:16px;font-weight:600;padding:14px 32px;
          border-radius:12px;text-decoration:none;">
  Button Text
</a>
```

### Secondary Button (Outline)
```css
background-color: #ffffff;
color: #15C5CE;
border: 2px solid #15C5CE;
padding: 12px 30px;
border-radius: 12px;
```

---

## 7. Dynamic Tokens Reference

### Donor Information
- `{{donor_name}}` - Full name of donor
- `{{donor_email}}` - Email address
- `{{donor_phone}}` - Phone number
- `{{donor_address}}` - Full address

### Donation Details
- `{{donation_amount}}` - Base amount
- `{{fees}}` - Processing fees
- `{{total}}` - Total charged
- `{{currency}}` - Currency symbol ($, €, £)
- `{{receipt_id}}` - Unique receipt ID
- `{{donation_date}}` - Date formatted
- `{{campaign_name}}` - Campaign name
- `{{payment_method}}` - Payment method used
- `{{donation_status}}` - Status text
- `{{donation_status_class}}` - CSS class (completed/pending/refunded/failed)
- `{{donation_type}}` - Type (General/Zakat/Qurbani/Gift/Campaign)
- `{{transaction_reference}}` - Payment processor reference

### Recurring
- `{{recurring_frequency}}` - Monthly/Weekly/Yearly
- `{{recurring_day}}` - Day of month/week
- `{{next_charge_date}}` - Next charge date

### Organization
- `{{org_name}}` - Organization name
- `{{org_address}}` - Full address
- `{{org_reg_number}}` - Registration number
- `{{org_website}}` - Website URL
- `{{support_email}}` - Support email
- `{{support_phone}}` - Support phone

### URLs
- `{{logo_url}}` - Logo image URL
- `{{receipt_url}}` - Online receipt view
- `{{pdf_url}}` - PDF download link
- `{{verification_url}}` - Receipt verification URL
- `{{qr_code}}` - QR code image URL
- `{{privacy_url}}` - Privacy policy
- `{{terms_url}}` - Terms of service
- `{{unsubscribe_url}}` - Manage preferences

### Social
- `{{facebook_url}}`
- `{{twitter_url}}`
- `{{instagram_url}}`
- `{{linkedin_url}}`

### Misc
- `{{current_year}}` - Current year for copyright

---

## 8. Page Sizes

### A4
- **Dimensions:** 210mm × 297mm
- **Margins:** 20mm top, 15mm sides, 25mm bottom
- **Content Width:** ~180mm

### Letter
- **Dimensions:** 8.5" × 11" (216mm × 279mm)
- **Margins:** 0.75" top, 0.6" sides, 1" bottom
- **Content Width:** ~7.3"

---

## 9. Accessibility Guidelines

### Email
- Minimum font size: 14px for body
- Color contrast ratio: 4.5:1 minimum
- Tap targets: 44px minimum height
- Alt text on all images
- Semantic table structure
- High contrast for dark mode

### PDF
- Clear visual hierarchy
- Sufficient line height (1.5+)
- No color-only indicators
- Grayscale-friendly design
- Clear borders instead of shadows

---

## 10. Email Compatibility Checklist

### ✅ Pre-flight Checks
- [ ] Table-based layout only (no flex/grid)
- [ ] All CSS inline
- [ ] Max width: 600px
- [ ] System fonts only (Arial stack)
- [ ] Images: fixed width/height, display:block, alt text
- [ ] VML fallbacks for Outlook buttons
- [ ] Dark mode meta tags included
- [ ] Preheader text (70-100 chars)
- [ ] Plain text version available

### ✅ Client Testing
- [ ] Outlook 2016/2019/365 (Windows)
- [ ] Outlook (Mac)
- [ ] Gmail (Web)
- [ ] Gmail (iOS/Android)
- [ ] Apple Mail (Mac/iOS)
- [ ] Yahoo Mail
- [ ] Outlook.com

---

## 11. File Structure

```
templates/
├── email/
│   ├── donation-receipt.html      # Full HTML email
│   └── donation-receipt.txt       # Plain text fallback
├── pdf/
│   ├── donation-receipt.html      # Official receipt (A4/Letter)
│   └── donation-confirmation.html # Confirmation document
└── STYLE-GUIDE.md                 # This file
```
