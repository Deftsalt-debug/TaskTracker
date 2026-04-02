# 📋 TaskTrackr — Complete Prerequisites & Installation Guide

> All dependencies and software required to run the project on Windows, Mac, and Linux

---

## 🎯 Quick Overview

TaskTrackr is a full-stack application with:
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite (file-based, no server needed)

**Key Requirements:**
- Node.js 16+ (includes npm)
- Git (optional but recommended)
- Text Editor (VS Code recommended)
- 500 MB+ free disk space
- Internet connection (for initial setup)

---

# 🪟 PART 1: WINDOWS SETUP

## 1️⃣ System Requirements

| Item | Requirement |
|------|-------------|
| **OS** | Windows 10, 11, or Server 2019+ |
| **RAM** | Minimum 2 GB (4 GB+ recommended) |
| **Disk Space** | 500 MB (400 MB Node.js + 100 MB project) |
| **Internet** | Required for npm package downloads |

---

## 2️⃣ Required Software (Windows)

### 2.1 Node.js & npm

**What:** Runtime environment for JavaScript + package manager  
**Required:** YES (core dependency)  
**Version:** 16.x, 18.x, or 20.x (LTS versions recommended)

**Installation Method 1: Direct Download (Easiest)**
1. Go to https://nodejs.org/
2. Click **"LTS"** (Long Term Support) - currently 20.x
3. Download the `.msi` installer for Windows
4. Run the installer and accept defaults
5. Verify installation:
```bash
node --version      # Should show v16+, v18+, or v20+
npm --version       # Should show 8+
```

**Installation Method 2: Using Chocolatey (Windows Package Manager)**
```powershell
# Open PowerShell as Administrator
choco install nodejs -y

# Verify
node --version
npm --version
```

**Installation Method 3: Using Windows Package Manager**
```powershell
# Open PowerShell as Administrator
winget install OpenJS.NodeJS.LTS

# Verify
node --version
npm --version
```

### 2.2 Git (Optional but Recommended)

**What:** Version control system  
**Required:** NO (optional for cloning repos)  
**Version:** Latest stable

**Installation:**
1. Go to https://git-scm.com/download/win
2. Download the standalone installer
3. Run and accept defaults
4. Verify:
```bash
git --version   # Should show git version 2.40+
```

**Alternative (Chocolatey):**
```powershell
choco install git -y
```

### 2.3 Text Editor: VS Code (Recommended)

**What:** Code editor with excellent React/Node support  
**Required:** NO (can use any editor)  
**Version:** Latest

**Installation:**
1. Go to https://code.visualstudio.com/
2. Click **Download for Windows**
3. Run installer and accept defaults
4. Verify: Open VS Code

**Alternative Editors:**
- WebStorm (paid, enterprise-grade)
- Sublime Text (lightweight)
- Atom (retired, not recommended)
- Vim/Neovim (advanced users)

---

## 3️⃣ Frontend Dependencies (Windows)

**Auto-installed when you run `npm install` in the frontend folder:**

| Dependency | Version | Size | Purpose |
|------------|---------|------|---------|
| `react` | ^18.0.0 | 41 MB | UI framework |
| `react-dom` | ^18.0.0 | 42 MB | DOM rendering |
| `react-router-dom` | ^6.14.1 | 2 MB | Page routing |
| `axios` | ^1.4.0 | 0.5 MB | HTTP requests |
| `@dnd-kit/core` | ^6.0.8 | 0.8 MB | Drag & drop |
| `@dnd-kit/sortable` | ^7.0.2 | 0.4 MB | Sortable UI |
| `@dnd-kit/utilities` | ^3.2.1 | 0.3 MB | DnD utilities |
| `framer-motion` | ^10.12.16 | 3.5 MB | Animations |
| `react-hot-toast` | ^2.4.1 | 0.6 MB | Notifications |
| `react-icons` | ^4.10.1 | 3 MB | Icon library |
| `react-scripts` | 5.0.1 | 50 MB | Build tools |
| `tailwindcss` | ^3.3.2 | 2 MB | CSS framework |
| `postcss` | ^8.4.24 | 0.5 MB | CSS processing |
| `autoprefixer` | ^10.4.14 | 0.2 MB | CSS prefixes |

**Total frontend size:** ~150 MB (node_modules)

**Installation command:**
```bash
cd frontend
npm install
```

---

## 4️⃣ Backend Dependencies (Windows)

**Auto-installed when you run `npm install` in the nodejs-backend folder:**

| Dependency | Version | Size | Purpose |
|------------|---------|------|---------|
| `express` | ^4.18.2 | 0.8 MB | Web framework |
| `sqlite3` | ^5.1.6 | 5 MB | Database driver |
| `bcryptjs` | ^2.4.3 | 0.2 MB | Password hashing |
| `cors` | ^2.8.5 | 0.1 MB | Cross-origin support |
| `dotenv` | ^16.0.3 | 0.02 MB | Environment config |
| `nodemon` | ^2.0.22 | 1 MB | Dev auto-reload |

**Total backend size:** ~10 MB (node_modules)

**Installation command:**
```bash
cd nodejs-backend
npm install
```

---

## 5️⃣ Database Requirements (Windows)

**SQLite3 Features:**
- ✅ File-based (no server needed)
- ✅ Auto-created on first run
- ✅ Located at: `nodejs-backend/database/tasktrackr.db`
- ✅ Already included in `sqlite3` npm package
- ✅ No separate installation needed!

---

## 6️⃣ Windows Installation Quick Checklist

```
☐ Windows 10/11 or Server 2019+
☐ 2+ GB RAM available
☐ 500+ MB disk space
☐ Internet connection

☐ Node.js 18 LTS installed (https://nodejs.org/)
  ☐ Verify: node --version (shows v18+)
  ☐ Verify: npm --version (shows 8+)

☐ (Optional) Git installed (https://git-scm.com/)
  ☐ Verify: git --version

☐ (Optional) VS Code installed (https://code.visualstudio.com/)

☐ Frontend dependencies installed
  ☐ Run: cd frontend && npm install

☐ Backend dependencies installed
  ☐ Run: cd nodejs-backend && npm install

```

---

## 7️⃣ Verify Windows Setup

Run these commands in Command Prompt or PowerShell:

```bash
# 1. Check Node.js
node -v

# 2. Check npm
npm -v

# 3. Navigate to frontend
cd frontend
npm list react
npm list react-router-dom

# 4. Navigate to backend
cd ../nodejs-backend
npm list express
npm list sqlite3

# 5. Check database will be created
# (created automatically on first `npm start`)
```

---

# 🍎 PART 2: MAC SETUP

## 1️⃣ System Requirements

| Item | Requirement |
|------|-------------|
| **OS** | macOS 10.15 (Catalina) or later |
| **Processor** | Intel, Apple Silicon (M1/M2/M3) |
| **RAM** | Minimum 2 GB (4 GB+ recommended) |
| **Disk Space** | 500 MB |
| **Internet** | Required for npm packages |

---

## 2️⃣ Required Software (Mac)

### 2.1 Node.js & npm

**What:** Runtime environment + package manager  
**Required:** YES  
**Version:** 18 LTS or 20 LTS

**Installation Method 1: Using Homebrew (Recommended)**

First, install Homebrew if you don't have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node.js:
```bash
brew install node@18    # For Node 18 LTS
# OR
brew install node@20    # For Node 20 LTS

# Verify
node --version
npm --version
```

**Installation Method 2: Direct Download**
1. Go to https://nodejs.org/
2. Click **"LTS"** (18.x or 20.x)
3. Select "macOS Installer"
4. Choose your processor (Intel or Apple Silicon)
5. Run the `.pkg` installer
6. Verify:
```bash
node --version
npm --version
```

**Installation Method 3: Using NVM (Node Version Manager)**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Close and reopen terminal, then:
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

### 2.2 Git (Optional)

**Included with Xcode Command Line Tools:**
```bash
xcode-select --install
```

**Or install via Homebrew:**
```bash
brew install git
```

### 2.3 Text Editor: VS Code (Recommended)

**Download:**
1. Go to https://code.visualstudio.com/
2. Click **Download for macOS**
3. Choose **Apple Silicon** (M1/M2/M3) or **Intel**
4. Extract `.dmg` and drag to Applications

**Or use Homebrew:**
```bash
brew install --cask visual-studio-code
```

---

## 3️⃣ Frontend Dependencies (Mac)

**Same as Windows - auto-installed with `npm install`**

```bash
cd frontend
npm install

# Verify
npm list react           # Should show react@^18.0.0
npm list tailwindcss     # Should show tailwindcss@^3.3.2
```

**Total size:** ~150 MB in `node_modules/`

---

## 4️⃣ Backend Dependencies (Mac)

**Same as Windows - auto-installed with `npm install`**

```bash
cd nodejs-backend
npm install

# Verify
npm list express         # Should show express@^4.18.2
npm list sqlite3         # Should show sqlite3@^5.1.6
```

**Total size:** ~10 MB in `node_modules/`

---

## 5️⃣ Database (Mac)

**SQLite3 Features:**
- ✅ Included in `sqlite3` npm package
- ✅ No separate installation needed
- ✅ Auto-created: `nodejs-backend/database/tasktrackr.db`

---

## 6️⃣ Mac Installation Quick Checklist

```
☐ macOS 10.15+ (Catalina or later)
☐ 2+ GB RAM available
☐ 500+ MB disk space free
☐ Internet connection

☐ Xcode Command Line Tools installed
  ☐ Run: xcode-select --install

☐ Homebrew installed (optional)
  ☐ Run: /bin/bash -c "...homebrew.../install.sh"

☐ Node.js 18+ LTS installed
  ☐ Verify: node --version (shows v18+ or v20+)
  ☐ Verify: npm --version (shows 8+)

☐ (Optional) VS Code installed
  ☐ Download from https://code.visualstudio.com/

☐ Frontend dependencies installed
  ☐ Run: cd frontend && npm install

☐ Backend dependencies installed
  ☐ Run: cd nodejs-backend && npm install
```

---

## 7️⃣ Verify Mac Setup

```bash
# 1. Check Node
node -v

# 2. Check npm
npm -v

# 3. Check frontend deps
cd frontend
npm list react

# 4. Check backend deps
cd ../nodejs-backend
npm list express
npm list sqlite3

# 5. Check database file (created on first run)
file ./database/tasktrackr.db
```

---

## 8️⃣ Troubleshooting Mac

**Problem:** `npm: command not found`
```bash
# Solution: Reinstall Node.js or add to PATH
echo $PATH
# If node missing, reinstall using method 1 or 3 above
```

**Problem:** `Error: EACCES: permission denied`
```bash
# Solution: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
```

**Problem:** `sqlite3` compilation fails
```bash
# Solution: Install build tools
xcode-select --install
# Then reinstall:
npm install
```

---

# 🐧 PART 3: LINUX SETUP

## 1️⃣ System Requirements

| Item | Requirement |
|------|-------------|
| **OS** | Ubuntu 18.04+, Debian 10+, Fedora 30+, CentOS 7+, Arch |
| **Kernel** | 4.4+ |
| **RAM** | Minimum 1 GB (2+ GB recommended) |
| **Disk Space** | 500 MB |
| **CPU** | Any (supports ARM) |

---

## 2️⃣ Required Software (Linux)

### 2.1 Node.js & npm

**What:** JavaScript runtime + package manager  
**Required:** YES  
**Version:** 18 LTS or 20 LTS

---

#### 🔵 Ubuntu / Debian

**Method 1: Using NodeSource Repository (Latest & Easiest)**

```bash
# Update package manager
sudo apt update
sudo apt upgrade -y

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# OR for Node 20:
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js (npm included)
sudo apt install -y nodejs

# Verify
node --version     # Should show v18+
npm --version      # Should show 8+
```

**Method 2: Using apt (Older version, but works)**
```bash
sudo apt update
sudo apt install -y nodejs npm

# Verify
node --version
npm --version
```

**Method 3: Using NVM (Node Version Manager)**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Apply changes
source ~/.bashrc

# Install Node 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
npm --version
```

---

#### 🔴 Fedora / RHEL / CentOS

**Using dnf/yum:**

```bash
# Update package manager
sudo dnf upgrade -y
# OR for older systems:
# sudo yum upgrade -y

# Install Node.js
sudo dnf install nodejs npm
# OR:
# sudo yum install nodejs npm

# Verify
node --version
npm --version
```

**Alternative (NodeSource repo):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

---

#### 🟡 Arch Linux

```bash
# Install Node.js
sudo pacman -Syu nodejs npm

# Verify
node --version
npm --version
```

---

### 2.2 Build Tools (Required for sqlite3 compilation)

**Ubuntu / Debian:**
```bash
sudo apt install -y build-essential python3
```

**Fedora / RHEL / CentOS:**
```bash
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3
# OR:
# sudo yum groupinstall -y "Development Tools"
```

**Arch:**
```bash
sudo pacman -S base-devel python
```

---

### 2.3 Git (Optional)

**Ubuntu / Debian:**
```bash
sudo apt install -y git
```

**Fedora / RHEL:**
```bash
sudo dnf install -y git
# OR:
# sudo yum install -y git
```

**Arch:**
```bash
sudo pacman -S git
```

---

### 2.4 Text Editor: VS Code (Optional)

**VS Code officially supports:**
- Ubuntu 18.04+
- Debian 10+
- Fedora 30+
- RHEL 7, 8+

**Download:**
https://code.visualstudio.com/Download

**Or install via package manager:**

**Ubuntu / Debian:**
```bash
wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main"
sudo apt update
sudo apt install -y code
```

**Fedora / RHEL:**
```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf check-update
sudo dnf install -y code
```

**Alternative editors:**
- Vim/Neovim
- Nano
- Sublime Text
- Atom

---

## 3️⃣ Frontend Dependencies (Linux)

**Auto-installed with `npm install`:**

```bash
cd frontend
npm install

# Verify
npm list react
npm list tailwindcss
npm list @dnd-kit/core
```

**Total size:** ~150 MB

**Troubleshooting:** If build tools missing:
```bash
# Ubuntu/Debian:
sudo apt install -y build-essential python3

# Then retry:
npm install
```

---

## 4️⃣ Backend Dependencies (Linux)

**Auto-installed with `npm install`:**

```bash
cd nodejs-backend
npm install

# Verify
npm list express
npm list sqlite3
npm list bcryptjs
```

**Total size:** ~10 MB

**Note:** sqlite3 may need to compile. If error:
```bash
# Ubuntu/Debian:
sudo apt install -y build-essential python3

# Fedora:
sudo dnf groupinstall -y "Development Tools"

# Then retry:
npm install
```

---

## 5️⃣ Database (Linux)

**SQLite3:**
- ✅ No separate installation needed
- ✅ Included in `sqlite3` npm package
- ✅ Auto-created at: `nodejs-backend/database/tasktrackr.db`
- ✅ Can also install separately:

```bash
# Ubuntu/Debian:
sudo apt install -y sqlite3

# Fedora:
sudo dnf install -y sqlite

# Arch:
sudo pacman -S sqlite
```

---

## 6️⃣ Linux Installation Quick Checklist

### For Ubuntu/Debian:
```
☐ Ubuntu 18.04+ or Debian 10+
☐ 1+ GB RAM available
☐ 500+ MB disk space free

☐ Update system
  ☐ Run: sudo apt update && sudo apt upgrade -y

☐ Node.js 18+ LTS installed
  ☐ Run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  ☐ Run: sudo apt install -y nodejs
  ☐ Verify: node --version (shows v18+)

☐ Build tools installed
  ☐ Run: sudo apt install -y build-essential python3

☐ (Optional) Git installed
  ☐ Run: sudo apt install -y git

☐ (Optional) VS Code installed
  ☐ Run: sudo apt install -y code

☐ Frontend dependencies
  ☐ Run: cd frontend && npm install

☐ Backend dependencies
  ☐ Run: cd nodejs-backend && npm install
```

### For Fedora/RHEL:
```
☐ Fedora 30+ or RHEL 7+
☐ 1+ GB RAM available
☐ 500+ MB disk space free

☐ Update system
  ☐ Run: sudo dnf upgrade -y

☐ Node.js 18+ installed
  ☐ Run: sudo dnf install -y nodejs npm

☐ Build tools installed
  ☐ Run: sudo dnf groupinstall -y "Development Tools"

☐ (Optional) Git
  ☐ Run: sudo dnf install -y git

☐ Frontend dependencies
  ☐ Run: cd frontend && npm install

☐ Backend dependencies
  ☐ Run: cd nodejs-backend && npm install
```

---

## 7️⃣ Verify Linux Setup

```bash
# 1. Check Node
node --version

# 2. Check npm
npm --version

# 3. Check git (if installed)
git --version

# 4. Check build tools
gcc --version

# 5. Check frontend
cd frontend
npm list react | head -5

# 6. Check backend
cd ../nodejs-backend
npm list express | head -5
npm list sqlite3 | head -5

# 7. List database location (created on first run)
# ls -lh ./database/tasktrackr.db
```

---

## 8️⃣ Troubleshooting Linux

**Problem:** `npm: command not found`
```bash
# Solution 1: Set PATH
export PATH=/usr/local/bin:$PATH
echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc

# Solution 2: Reinstall Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Problem:** `sqlite3` build error
```bash
# Solution: Install build essentials
sudo apt install -y build-essential python3    # Ubuntu/Debian
sudo dnf groupinstall -y "Development Tools"   # Fedora
# Then retry: npm install
```

**Problem:** `Permission denied` errors
```bash
# Solution: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Problem:** Port 3000 or 8080 already in use
```bash
# Find what's using the port:
lsof -i :3000        # For frontend
lsof -i :8080        # For backend

# Kill the process (if needed):
kill -9 <PID>
```

---

# ✅ FINAL VERIFICATION (All Platforms)

After installation, run these commands:

## Windows (Command Prompt or PowerShell):
```bash
node --version
npm --version
cd frontend && npm list react
cd ../nodejs-backend && npm list sqlite3
```

## Mac (Terminal):
```bash
node --version
npm --version
cd frontend && npm list react
cd ../nodejs-backend && npm list sqlite3
```

## Linux (Terminal):
```bash
node --version
npm --version
cd frontend && npm list react
cd ../nodejs-backend && npm list sqlite3
```

**Expected output:**
```
v18.17.0 or v20.x.x   (Node version)
8.x.x or 9.x.x        (npm version)
react@18.0.0 or higher
sqlite3@5.1.6 or higher
```

---

# 🚀 Ready to Run!

Once all prerequisites are installed, you can start the project:

```bash
# Terminal 1: Start Backend
cd nodejs-backend
npm install   # First time only
npm start     # OR npm run dev for auto-reload

# Terminal 2: Start Frontend
cd frontend
npm install   # First time only
npm start

# Open browser to http://localhost:3000
```

---

# 📞 Need Help?

| Issue | Solution |
|-------|----------|
| Node.js won't install | Download directly from nodejs.org instead of package manager |
| npm showing old version | Run `npm install -g npm@latest` |
| Dependencies fail | Delete `node_modules` and `package-lock.json`, then `npm install` again |
| Port 3000/8080 in use | Change port or kill the process using that port |
| sqlite3 build fails | Install build-essential (Linux) or Xcode tools (Mac) |

---

# 📊 Disk Space Summary

| Component | Size |
|-----------|------|
| Node.js (Windows/Mac/Linux) | 100-200 MB |
| Frontend node_modules | 150 MB |
| Backend node_modules | 10 MB |
| Project source code | 5 MB |
| SQLite database (empty) | <1 MB |
| **Total required** | **~350 MB** |

---

**✨ All set! Your system is now ready for TaskTrackr development! 🎉**
