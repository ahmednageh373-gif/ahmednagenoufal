# 🌐 Custom Domain Setup - ahmednagehnoufal.com

## 🎯 Quick Summary

**Current Status:**
- ❌ `www.ahmednagehnoufal.com` - **NOT CONNECTED** (Connection refused)
- ✅ `https://noufal-erp-ai-system.netlify.app` - **WORKING NOW**

**Problem:** Your custom domain is not configured to point to your Netlify site.

**Solution:** Configure DNS records to connect your domain to Netlify.

---

## 🚀 IMMEDIATE ACCESS (No Setup Required)

**Use this URL right now:**
```
https://noufal-erp-ai-system.netlify.app
```

This link works immediately and has all CAD Studio v2.5 Pro features:
- ✅ 3 Architectural templates (Villa 150m², Villa 200m², Apartment 120m²)
- ✅ BricsCAD integration panel
- ✅ Block library with drag & drop (8 elements)
- ✅ Real-time area calculation
- ✅ Save/Load projects (JSON)
- ✅ Export to PDF

---

## 📋 DNS Setup Instructions

### Step 1: Add Domain in Netlify Dashboard

1. Go to: **https://app.netlify.com**
2. Find your site: **"noufal-erp-ai-system"**
3. Click: **Site settings**
4. Left sidebar: **Domain management**
5. Click: **"Add custom domain"**
6. Enter: **ahmednagehnoufal.com**
7. Click: **"Verify"**
8. Netlify will show DNS configuration instructions

### Step 2: Configure DNS Records

Go to your domain registrar (where you bought `ahmednagehnoufal.com`) and add these DNS records:

#### DNS Record 1: Root Domain (A Record)
```
Type:   A
Name:   @   (or leave blank, or "ahmednagehnoufal.com")
Value:  75.2.60.5
TTL:    3600
```

#### DNS Record 2: WWW Subdomain (CNAME)
```
Type:   CNAME
Name:   www
Value:  noufal-erp-ai-system.netlify.app
TTL:    3600
```

**⚠️ Important Note:**
The IP address `75.2.60.5` is Netlify's load balancer. Always verify the current IP in your Netlify dashboard when adding the domain, as it may change.

### Step 3: Wait for DNS Propagation

- **Typical time:** 1-2 hours
- **Maximum time:** 24-48 hours
- **Check progress:** https://dnschecker.org (enter your domain)

### Step 4: Enable HTTPS (Automatic)

Once DNS propagates, Netlify will automatically:
1. Provision SSL certificate (Let's Encrypt)
2. Enable HTTPS on your domain
3. Redirect HTTP to HTTPS

**Time required:** 5-30 minutes after DNS propagation

---

## 📝 Common DNS Providers - Step-by-Step

### GoDaddy
1. Log in to **GoDaddy.com**
2. Go to **"My Products"**
3. Find your domain → Click **"DNS"**
4. Click **"Add"** to add new records
5. Enter the DNS records from Step 2 above
6. Click **"Save"**

### Namecheap
1. Log in to **Namecheap.com**
2. Dashboard → **Domain List**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab
5. Click **"Add New Record"**
6. Enter the DNS records from Step 2 above
7. Click **"Save All Changes"**

### Google Domains
1. Log in to **domains.google.com**
2. Click on your domain
3. Go to **DNS** section
4. Click **"Manage custom records"**
5. Click **"Create new record"**
6. Enter the DNS records from Step 2 above
7. Click **"Save"**

### Cloudflare
1. Log in to **Cloudflare.com**
2. Select your domain
3. Click **"DNS"** tab
4. Click **"Add record"**
5. Enter the DNS records from Step 2 above
6. Set proxy status to **"Proxied"** (orange cloud) or **"DNS only"** (gray cloud)
7. Click **"Save"**

**Cloudflare Note:** If using Cloudflare, you may need to set SSL/TLS mode to "Full" or "Full (strict)" in the SSL/TLS settings.

---

## 🕐 Timeline

| Action | Time Required |
|--------|---------------|
| Add domain in Netlify | 2 minutes |
| Update DNS records | 5 minutes |
| DNS propagation | 1-48 hours (usually 1-2h) |
| SSL certificate provisioning | 5-30 minutes |
| **Total estimated time** | **2-4 hours** |

---

## 🔍 Verification Steps

After DNS propagation (1-2 hours), verify your setup:

### 1. Check Domain Access
- Visit: `http://ahmednagehnoufal.com`
  - ✅ Should redirect to HTTPS and show your site
- Visit: `http://www.ahmednagehnoufal.com`
  - ✅ Should also work and redirect to HTTPS

### 2. Check Netlify Dashboard
In **Netlify Dashboard → Domain Management**:
- ✅ Domain status should show "Netlify DNS" or "Primary domain"
- ✅ SSL certificate status: "Verified"
- ✅ HTTPS status: "Enabled"

### 3. Check DNS Propagation
Use online tools to verify DNS has propagated:
- **https://dnschecker.org** - Enter your domain and check worldwide DNS servers
- **https://whatsmydns.net** - Alternative DNS checker
- Look for your domain pointing to `75.2.60.5` (A record) or `noufal-erp-ai-system.netlify.app` (CNAME)

---

## 🐛 Troubleshooting

### Issue: "Connection Refused"
**Cause:** DNS not configured or not propagated yet  
**Solution:**
- Check if you added DNS records correctly
- Wait 1-2 hours for DNS propagation
- Use https://dnschecker.org to verify DNS status
- Clear browser cache (Ctrl+Shift+R)

### Issue: "404 Not Found"
**Cause:** Domain added but not set as primary in Netlify  
**Solution:**
- Go to Netlify Dashboard → Domain Management
- Find your custom domain in the list
- Click the three dots → "Set as primary domain"

### Issue: "Not Secure" Warning
**Cause:** SSL certificate not provisioned yet  
**Solution:**
- Wait 5-30 minutes for automatic SSL provisioning
- Check Netlify Dashboard → Domain Management → HTTPS status
- If stuck, try "Renew certificate" button in Netlify

### Issue: DNS Records Not Saving
**Cause:** Incorrect format or conflicting records  
**Solution:**
- Remove any existing A or CNAME records for @ and www
- Ensure exact format as specified above
- Some providers require trailing dot: `noufal-erp-ai-system.netlify.app.`

---

## 🎯 Alternative: Use Netlify DNS (Easiest Method)

Instead of configuring DNS records manually, you can use Netlify to manage your DNS:

### Steps:
1. In Netlify Dashboard → Domain Management
2. Click **"Use Netlify DNS"**
3. Netlify provides 4 nameservers (example):
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`
4. Go to your domain registrar
5. Find **"Nameservers"** or **"DNS Servers"** settings
6. Replace existing nameservers with Netlify's nameservers
7. Save changes

**Pros:**
- ✅ Easier to manage
- ✅ Faster propagation
- ✅ Automatic SSL/HTTPS
- ✅ Better integration with Netlify features

**Cons:**
- ⚠️ Longer initial propagation (24-48 hours for nameserver change)
- ⚠️ All DNS management moves to Netlify

---

## 📞 Need Help?

If you need specific instructions for your domain registrar, let me know:
- Where did you buy `ahmednagehnoufal.com`? (GoDaddy, Namecheap, Google Domains, etc.)
- Do you use a DNS service like Cloudflare?
- Do you have access to your domain's DNS settings?

---

## 🎊 Summary

**For immediate access (works now):**
```
✅ https://noufal-erp-ai-system.netlify.app
```

**For custom domain (requires DNS setup):**
1. Add 2 DNS records (A and CNAME) at your domain registrar
2. Wait 1-2 hours for DNS propagation
3. Netlify auto-provisions SSL certificate
4. Your domain will work with HTTPS

**Timeline:** 2-4 hours total

---

**Last Updated:** 2025-11-11  
**Status:** Documentation Complete ✅
