# Installation Instructions - Use Mac Terminal App

## ⚠️ VSCode Terminal Issue

The VSCode integrated terminal can't accept password input for the Homebrew installation. You need to use your Mac's Terminal app instead.

## 🚀 Step-by-Step Installation

### Step 1: Open Mac Terminal

1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal"
3. Press Enter

OR

1. Go to Applications → Utilities → Terminal

### Step 2: Install Homebrew

Copy and paste this command into the Terminal app:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Press Enter, then:
- Enter your Mac password when prompted (you won't see it as you type)
- Press Enter again
- Wait 5-15 minutes for installation

### Step 3: Add Homebrew to PATH

After installation completes, the terminal will show commands like:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Copy and run those commands (or the ones shown in your terminal).

### Step 4: Verify Homebrew

```bash
brew --version
```

Should show: `Homebrew 4.x.x`

### Step 5: Install Node.js

```bash
brew install node
```

Wait 5-10 minutes. When done, verify:

```bash
node --version
npm --version
```

Should show version numbers like `v20.11.0` and `10.2.4`

### Step 6: Install Frontend Dependencies

```bash
cd ~/Desktop/Vault-13efcff0/frontend
npm install
```

Wait 2-5 minutes for all packages to download.

### Step 7: Start Frontend Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

### Step 8: Open Browser

Navigate to: **`http://localhost:3000`**

---

## 🎯 What You'll See

1. **Landing Page** with Login/Signup forms
2. **Sign up** with name, email, password
3. **Redirects to dashboard** after signup
4. **Portfolio Overview** and **Asset List** (empty initially)
5. **Logout** button in header

---

## 🧪 Test the Integration

### Create Account:
- Name: Your Name
- Email: your@email.com  
- Password: password123 (min 6 chars)
- Click "Create Account"

### Check Browser DevTools:
- Press `F12` or `Cmd+Option+I`
- Go to **Console** tab - see API calls
- Go to **Network** tab - see requests to `http://localhost:8000`
- Go to **Application** → **Local Storage** - see `auth_token`

### Check Backend Terminal:
In VSCode, look at **Terminal 6** - you'll see:
```
INFO: 127.0.0.1:xxxxx - "POST /api/v1/auth/signup HTTP/1.1" 201 Created
INFO: 127.0.0.1:xxxxx - "GET /api/v1/portfolio HTTP/1.1" 200 OK
```

---

## 📚 Documentation

Once everything is running, refer to:

- **[`QUICK_START.md`](QUICK_START.md)** - Quick reference
- **[`INTEGRATION_PROGRESS.md`](INTEGRATION_PROGRESS.md)** - Technical details
- **[`TESTING_GUIDE.md`](TESTING_GUIDE.md)** - Test scenarios

---

## 🐛 Troubleshooting

**"brew: command not found" after installation?**
- Run the PATH commands shown after Homebrew installation
- Close and reopen Terminal
- Try: `eval "$(/opt/homebrew/bin/brew shellenv)"`

**"npm: command not found"?**
- Make sure Node.js installed: `brew install node`
- Close and reopen Terminal

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Can't connect to backend?**
- Check VSCode Terminal 6 - backend should be running
- Visit `http://localhost:8000/docs` to verify

---

## ✅ Success Checklist

- [ ] Homebrew installed (`brew --version` works)
- [ ] Node.js installed (`node --version` works)
- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] Frontend server running (`npm run dev` successful)
- [ ] Browser opens to `http://localhost:3000`
- [ ] Can create account
- [ ] Redirects to dashboard
- [ ] Can logout
- [ ] Can login again
- [ ] Backend terminal shows API requests
- [ ] Browser DevTools shows successful API calls

---

## 🎉 When Complete

You'll have a fully working application with:
- ✅ User authentication (signup/login/logout)
- ✅ JWT token management
- ✅ Protected dashboard
- ✅ Portfolio data from backend
- ✅ Real-time calculations
- ✅ Professional UI

**The integration is complete - just need to install the tools to run it!**
