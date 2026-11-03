========================================================================
PATHFORGE — PERSONALIZED CAREER ROADMAP & DIAGNOSTIC SKILL PLATFORM
Academic Mini-Project | College Technology Stack (PHP 8 + MySQL + XAMPP)
========================================================================

Author: Final Year B.Tech / BCA / MCA Engineering Student
Project Name: PathForge (Career Roadmap Generator)
Technology Stack: HTML5, CSS3, Vanilla JavaScript, PHP 8.x (PDO), MySQL 8.0 / MariaDB
Local Server: XAMPP (Apache + MySQL) & phpMyAdmin

------------------------------------------------------------------------
TABLE OF CONTENTS
------------------------------------------------------------------------
1. System Requirements
2. Folder Structure
3. Step-by-Step Installation in XAMPP (Beginner Friendly)
4. Importing the Database in phpMyAdmin
5. Running the Application
6. Verifying API & Database Endpoints
7. Default Accounts & Testing Scenarios
8. Troubleshooting Common College Lab Errors
9. Viva Voce & Academic Defense Quick Answers

------------------------------------------------------------------------
1. SYSTEM REQUIREMENTS
------------------------------------------------------------------------
- Operating System: Windows 10/11, macOS, or Linux
- Local Server Suite: XAMPP 8.0, 8.1, or 8.2 (with Apache & MySQL)
  (Download free from: https://www.apachefriends.org)
- Web Browser: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari
- Text Editor (Optional): VS Code, Sublime Text, or Notepad++

NOTE: This application does NOT require Node.js, npm, Vite, TypeScript, or Tailwind.
It is 100% native HTML5, CSS3, Vanilla JS, and PHP PDO.

------------------------------------------------------------------------
2. FOLDER STRUCTURE
------------------------------------------------------------------------
PathForge/
│
├── index.php                      Main entry point and SPA dashboard
├── README.txt                     This beginner-friendly setup guide
│
├── config/
│   └── config.php                 Database credentials and JSON response helpers
│
├── api/
│   ├── db_connect.php             PDO database connection & health check
│   ├── careers.php                CRUD operations for Career Tracks
│   ├── skills.php                 CRUD operations for Milestones / Skills
│   ├── progress.php               User progress tracking & status updates
│   ├── assessment.php             Diagnostic quiz & roadmap calibration
│   └── admin.php                  Admin student roster & reset actions
│
├── database/
│   └── pathforge_db.sql           MySQL 8.0 schema and seed dataset for 5 careers
│
├── assets/
│   ├── css/
│   │   └── style.css              Pure CSS3 stylesheet (Emerald / Dark theme)
│   └── js/
│       └── app.js                 Vanilla JS controller (Roadmap 4 views, timer, AJAX)
│
└── docs/
    └── PROJECT_REPORT.md          Comprehensive academic project report & Viva Q&A

------------------------------------------------------------------------
3. STEP-BY-STEP INSTALLATION IN XAMPP
------------------------------------------------------------------------
STEP 1: Start XAMPP
- Open the "XAMPP Control Panel" from your desktop or start menu.
- Click the "Start" button next to "Apache". The module should turn GREEN.
- Click the "Start" button next to "MySQL". The module should turn GREEN.

STEP 2: Copy Project Files to htdocs
- Extract the ZIP archive: PathForge_PHP_MySQL_XAMPP.zip
- Move or copy the entire extracted folder "PathForge" into your XAMPP web root:
  - On Windows: C:\xampp\htdocs\PathForge
  - On macOS (XAMPP-VM): /Applications/XAMPP/htdocs/PathForge
  - On Linux: /opt/lampp/htdocs/PathForge

------------------------------------------------------------------------
4. IMPORTING THE DATABASE IN PHPMYADMIN
------------------------------------------------------------------------
STEP 1: Open phpMyAdmin
- Open your browser and navigate to: http://localhost/phpmyadmin

STEP 2: Create the Database
- Click "New" in the top-left sidebar.
- Enter Database name: pathforge_db
- Choose collation: utf8mb4_unicode_ci (or default)
- Click the "Create" button.

STEP 3: Import SQL Script
- Click on the newly created `pathforge_db` in the left sidebar.
- Click on the "Import" tab at the top.
- Click the "Choose File" or "Browse..." button.
- Select the file located at:
  C:\xampp\htdocs\PathForge\database\pathforge_db.sql
- Scroll to the bottom and click the "Import" (or "Go") button.
- You will see a green checkmark message: "Import has been successfully finished."

------------------------------------------------------------------------
5. RUNNING THE APPLICATION
------------------------------------------------------------------------
Open any web browser and visit:
http://localhost/PathForge

You will see the PathForge dashboard with:
- Top navigation bar showing career switchers, study streak, and tab links
- Hero summary banner with progress bar and statistics
- 4-View Interactive Roadmap:
  1. Step Path (Sequential node path with stage filters)
  2. Study Lab & Pomodoro (Master-detail workbench with 25-minute focus timer)
  3. Kanban Board (3 columns: To Do, In Progress, Completed)
  4. Sprint Planner (Interactive hours/week velocity calculator)
- Diagnostic Quiz tab (Skill evaluation and automatic roadmap calibration)
- Learning Resources library
- Student Profile with study streak metrics
- Admin & Faculty Management Portal (Career CRUD, Milestone CRUD, Student Roster)

------------------------------------------------------------------------
6. VERIFYING API & DATABASE ENDPOINTS
------------------------------------------------------------------------
You can test the PHP backend endpoints directly in your browser:

1. Database Connection Test:
   http://localhost/PathForge/api/db_connect.php?test=1
   Expected response: JSON with "status": "success", "message": "PathForge PDO connection established"

2. Careers API:
   http://localhost/PathForge/api/careers.php
   Expected response: JSON list of all 5 career tracks with metadata

3. Milestones / Skills API for Web Developer (Career 1):
   http://localhost/PathForge/api/skills.php?career_id=1&user_id=1
   Expected response: JSON array of 12 skills with progress states

4. Diagnostic Quiz API:
   http://localhost/PathForge/api/assessment.php?career_id=1
   Expected response: Diagnostic questions with multiple-choice options

5. Admin Statistics:
   http://localhost/PathForge/api/admin.php
   Expected response: JSON with system stats and enrolled student roster

------------------------------------------------------------------------
7. DEFAULT ACCOUNTS & TESTING SCENARIOS
------------------------------------------------------------------------
Student User:
- Username: alex_student
- Email: alex@pathforge.edu
- Role: Student (Junior Full-Stack Web Developer track)

Admin User:
- Username: admin
- Email: admin@pathforge.edu
- Role: Administrator / Faculty

Demonstration Flow for External Examiners & Faculty:
1. Show the Roadmap tab in "Step Path" view: click the status dropdown to change
   a skill to "Completed" and watch the progress bar increase.
2. Switch to "Study Lab & Pomodoro" view: click "Start Focus" to demonstrate the
   live 25:00 countdown timer, check off deliverable items, and type a study note.
3. Switch to "Kanban Board": move cards between To Do, In Progress, and Completed.
4. Switch to "Sprint Planner": adjust the velocity slider from 15 hrs/wk to 30 hrs/wk
   and watch the estimated weeks update dynamically.
5. Go to the "Diagnostic Quiz" tab: answer questions, click "Submit Assessment",
   and show the score report and automatic roadmap acceleration.
6. Open "Admin & Faculty" tab: demonstrate the Career CRUD table, Milestone CRUD,
   and the Student Roster with progress monitoring.

------------------------------------------------------------------------
8. TROUBLESHOOTING COMMON COLLEGE LAB ERRORS
------------------------------------------------------------------------
Issue 1: "Unable to connect to MySQL database: Unknown database 'pathforge_db'"
Solution: Make sure you performed Section 4 (Importing the Database) in phpMyAdmin.

Issue 2: "Port 80 in use by another application (Skype / IIS / VMware)"
Solution: In XAMPP Control Panel, click "Config" next to Apache -> "httpd.conf",
find "Listen 80" and change it to "Listen 8080". Then access the app at:
http://localhost:8080/PathForge

Issue 3: "Access denied for user 'root'@'localhost'"
Solution: If your MySQL has a root password, open `config/config.php` and set:
define('DB_PASS', 'your_mysql_password');

------------------------------------------------------------------------
9. VIVA VOCE & ACADEMIC DEFENSE QUICK ANSWERS
------------------------------------------------------------------------
Q: Why use PHP PDO over mysqli?
A: PDO is database-independent, supports prepared statements with named parameters
which completely neutralizes SQL Injection (OWASP Top 10), and throws standard
catchable PDOExceptions.

Q: How is the database normalized?
A: The schema adheres to 3NF (Third Normal Form). Transitive dependencies are
eliminated; User progress is isolated in `user_progress` with foreign keys
referencing `users` and `skill_paths`.

Q: How does the application operate without Node.js or React?
A: The frontend utilizes ES6 Fetch API to exchange JSON payloads with PHP REST
endpoints, updating the DOM dynamically while server-side scripts handle
persistence and business logic.
========================================================================
