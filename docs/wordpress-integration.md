# WordPress Integration Guide (Phase 9)

## Overview

The application portal at `/apply` can be integrated into **rbmservicesinc.com** (WordPress) in three ways.

---

## Option A — Dedicated Subdomain (Recommended First)

**Setup (10 minutes, no code changes):**

1. In your DNS registrar, add a CNAME record:
   ```
   Type:  CNAME
   Name:  careers
   Value: cname.vercel-dns.com
   ```

2. In Vercel project → Settings → Domains → Add `careers.rbmservicesinc.com`

3. In WordPress Admin → Pages → Add New → Title: "Careers" or "Apply Now"
   ```html
   <a href="https://careers.rbmservicesinc.com/apply"
      class="wp-block-button__link">
     Apply Now / Solicitar Empleo
   </a>
   ```

4. Add the Careers page to your navigation menu.

---

## Option B — Embedded iframe on WordPress Page

The CSP headers in `next.config.js` already allow `rbmservicesinc.com` to embed `/apply`.

In WordPress, create a page and add this HTML block:

```html
<style>
  .rbm-portal-wrapper { width: 100%; min-height: 900px; }
  .rbm-portal-wrapper iframe { width: 100%; height: 900px; border: none; display: block; }
</style>
<div class="rbm-portal-wrapper">
  <iframe
    src="https://careers.rbmservicesinc.com/apply"
    title="RBM Services Job Application | Solicitud de Empleo"
    loading="lazy"
    allow="forms">
  </iframe>
</div>
```

Use your theme's "Full Width" page template to remove the header/footer.

---

## Option C — Floating "Apply Now" Button (All Pages)

Add to **Appearance → Customize → Additional CSS**:

```css
.rbm-apply-fab {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  background: #1a4fa0; color: #fff; padding: 14px 22px;
  border-radius: 50px; font-weight: 700; font-size: 15px;
  cursor: pointer; border: none; box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  transition: transform 0.2s;
}
.rbm-apply-fab:hover { transform: scale(1.05); }
.rbm-modal-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); z-index: 10000;
  align-items: center; justify-content: center;
}
.rbm-modal-overlay.open { display: flex; }
.rbm-modal-box {
  background: #fff; border-radius: 12px; width: 95vw;
  max-width: 780px; height: 88vh; overflow: hidden; position: relative;
}
.rbm-modal-close {
  position: absolute; top: 10px; right: 14px;
  font-size: 26px; cursor: pointer; z-index: 1;
  background: none; border: none; color: #333;
}
.rbm-modal-box iframe { width: 100%; height: 100%; border: none; }
```

Add to **Appearance → Theme Editor → footer.php** (before `</body>`):

```html
<button class="rbm-apply-fab"
  onclick="document.getElementById('rbmModal').classList.add('open')">
  Apply Now / Solicitar Empleo
</button>

<div class="rbm-modal-overlay" id="rbmModal">
  <div class="rbm-modal-box">
    <button class="rbm-modal-close"
      onclick="document.getElementById('rbmModal').classList.remove('open')">&times;</button>
    <iframe src="https://careers.rbmservicesinc.com/apply"
      title="RBM Job Application" loading="lazy"></iframe>
  </div>
</div>
```

---

## QR Code Integration

State-specific QR codes auto-fill the state and set referral source to "QR Code":

| State   | URL |
|---------|-----|
| Utah    | `careers.rbmservicesinc.com/apply?state=utah` |
| Nevada  | `careers.rbmservicesinc.com/apply?state=nevada` |
| Arizona | `careers.rbmservicesinc.com/apply?state=arizona` |
| Texas   | `careers.rbmservicesinc.com/apply?state=texas` |

Download printable QR codes from **Dashboard → QR Codes**.

---

## Recommended Rollout Order

1. ✅ Option A (subdomain) — zero WordPress risk, live in 10 minutes
2. ✅ Option C (floating button) — highest visibility
3. ⬜ Option B (iframe embed) — add later for dedicated /careers page
4. ✅ Print state QR codes — hand to managers immediately
