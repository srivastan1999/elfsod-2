# Backend Connection Test

## Quick Test

Open browser console (F12) and run:

```javascript
// Test backend health
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test ad spaces API
fetch('http://localhost:5001/api/ad-spaces?limit=3')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend API Response:', data);
    console.log('Count:', data.count);
    console.log('Data:', data.data);
  })
  .catch(console.error);
```

## Check Frontend Environment

Make sure `frontend/.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Common Issues

1. **Backend not running**: Check `http://localhost:5001/health`
2. **CORS error**: Backend should allow `http://localhost:3000` (or your frontend port)
3. **Environment variable not set**: Frontend needs `NEXT_PUBLIC_API_URL=http://localhost:5001`
4. **Backend API error**: Check backend logs in `/tmp/backend-server.log`
5. **Port 5000 conflict**: Port 5000 is used by AirPlay. Backend uses port 5001.

