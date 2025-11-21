# Fix SSL Certificate Issue

## Problem
Node.js can't verify Supabase's SSL certificate, causing `TypeError: fetch failed` with `unable to get local issuer certificate`.

## Solutions

### Solution 1: Update Node.js (Recommended)

Update to the latest Node.js version which has better SSL certificate handling:

```bash
# Check current version
node --version

# Update Node.js (using nvm)
nvm install --lts
nvm use --lts

# Or download from https://nodejs.org/
```

### Solution 2: Update CA Certificates (macOS)

On macOS, update your CA certificates:

```bash
# Install/update certificates
brew install ca-certificates

# Or update via system
sudo security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > /tmp/certs.pem
```

### Solution 3: Set NODE_EXTRA_CA_CERTS

If you have custom certificates:

```bash
# Add to your .env file
export NODE_EXTRA_CA_CERTS=/path/to/certificates.pem

# Or in your shell
export NODE_EXTRA_CA_CERTS=/usr/local/etc/ca-certificates/cert.pem
```

### Solution 4: Use System Certificates (Linux)

On Linux, ensure Node.js uses system certificates:

```bash
# Install ca-certificates
sudo apt-get update
sudo apt-get install ca-certificates

# Or on CentOS/RHEL
sudo yum install ca-certificates
```

### Solution 5: Configure Supabase Client (Already Done)

I've updated the Supabase client configuration in:
- `backend/src/config/supabase.js`
- `frontend/lib/supabase/server.ts`

The client now uses proper SSL handling.

### Solution 6: Temporary Workaround (NOT Recommended for Production)

**⚠️ Only for development/testing:**

```javascript
// In backend/src/config/supabase.js
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Disables SSL verification
});

// Use this agent in fetch calls
```

**DO NOT use this in production!** It makes your app vulnerable to man-in-the-middle attacks.

## Verify the Fix

After applying a solution:

1. **Restart both servers:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Then restart:
   
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test the connection:**
   ```bash
   # Test backend
   curl http://localhost:5001/api/ad-spaces?limit=1
   
   # Test Next.js API
   curl http://localhost:3000/api/ad-spaces?limit=1
   ```

3. **Check the diagnostic page:**
   Visit: `http://localhost:3000/check-data-loading`

## Most Common Fix

**For macOS users:**

1. Update Node.js to latest LTS version
2. Ensure system certificates are up to date
3. Restart your terminal and servers

**For Linux users:**

```bash
sudo apt-get update
sudo apt-get install ca-certificates
```

**For Windows users:**

1. Update Node.js to latest version
2. Ensure Windows certificates are up to date
3. Restart your terminal

## Why This Happens

Node.js uses its own certificate store, which may not include all certificates that your system trusts. When connecting to Supabase (or any HTTPS service), Node.js needs to verify the SSL certificate chain.

## Check Current Status

```bash
# Check Node.js version
node --version

# Check if certificates are accessible
node -e "const https = require('https'); console.log('CA:', https.globalAgent.options.ca ? 'Custom' : 'System default');"

# Test Supabase connection directly
curl https://vavubezjuqnkrvndtowt.supabase.co/rest/v1/ -H "apikey: YOUR_KEY"
```

## Still Not Working?

1. **Check Supabase status:** https://status.supabase.com
2. **Verify environment variables** are correct
3. **Check firewall/proxy** settings
4. **Try a different network** (mobile hotspot)
5. **Check Node.js version** (should be 18+)

---

**Recommended Action:** Update Node.js to the latest LTS version and restart your servers.



