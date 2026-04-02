# 🗄️ Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Open phpMyAdmin
Open in your browser: **http://localhost:8080/phpmyadmin**

### Step 2: Create Database
1. Click **"New"** in the left sidebar
2. Enter database name: `tasktrackr`
3. Select collation: `utf8mb4_general_ci`
4. Click **"Create"**

### Step 3: Import Schema
1. Click on the **`tasktrackr`** database in the left sidebar
2. Go to the **"Import"** tab at the top
3. Click **"Choose File"**
4. Navigate to: `C:\Users\anshu\OneDrive\Desktop\5th sem\WebTech MiniProject\database\schema.sql`
5. Click **"Go"** at the bottom

### Step 4: Verify Tables Created
You should see 4 tables created:
- ✅ `users`
- ✅ `tasks`
- ✅ `pomodoro_sessions`
- ✅ `user_preferences`

---

## Alternative: SQL Command Line

If phpMyAdmin doesn't work, you can use MySQL command line:

1. Open XAMPP Shell or Command Prompt
2. Navigate to MySQL bin folder:
   ```bash
   cd D:\NEw\mysql\bin
   ```
3. Login to MySQL:
   ```bash
   mysql -u root -p
   ```
   (Press Enter if there's no password)

4. Run these commands:
   ```sql
   CREATE DATABASE tasktrackr;
   USE tasktrackr;
   SOURCE C:/Users/anshu/OneDrive/Desktop/5th sem/WebTech MiniProject/database/schema.sql;
   SHOW TABLES;
   ```

---

## After Database Setup

### Test the Application:

1. **Register a New User**
   - Go to http://localhost:3000
   - Click "Register" or go to Register page
   - Fill in: Name, Email, Password
   - Click "Register"

2. **Login**
   - Use your email and password
   - You should be redirected to the Tasks page

3. **Create Your First Task**
   - Click "Add Task" button
   - Fill in task details
   - Choose category: Upcoming, In Progress, Priority, or Completed
   - Set priority level
   - Click "Create Task"

4. **Test Drag & Drop**
   - Drag tasks between columns
   - Tasks should move smoothly

5. **Test Pomodoro Timer**
   - Click on the Focus/Timer icon in sidebar
   - Select a task
   - Start the timer
   - Watch the circular progress animation

6. **Check Dashboard Footer**
   - See real-time statistics
   - Total tasks, completed, in progress counts

---

## Troubleshooting

### Can't access phpMyAdmin?
- Make sure Apache and MySQL are both running in XAMPP Control Panel
- Try: http://localhost:8080/phpmyadmin (with port 8080)

### "Access denied for user 'root'"?
- Default username: `root`
- Default password: (empty/blank)
- If not working, check `backend/config/db.php` for correct credentials

### Import fails?
- Make sure you selected the `tasktrackr` database before importing
- Check if file path is correct
- Try copying SQL content and pasting in "SQL" tab instead

---

## 🎉 You're All Set!

Once database is created, your TaskTrackr app is fully functional!

**Application URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/backend/api
- phpMyAdmin: http://localhost:8080/phpmyadmin
- Apache Test: http://localhost:8080

**Next Steps:**
1. Create database in phpMyAdmin
2. Register your first user
3. Start creating and managing tasks!
4. Test all features using TESTING_GUIDE.md

Happy Task Tracking! 📋✨
