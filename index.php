<?php
/**
 * PathForge - Career Roadmap Generator
 * Technology Stack: PHP 8.x + MySQL 8.0/MariaDB + HTML5 + CSS3 + Vanilla JS
 * Environment: XAMPP (Apache + MySQL) / phpMyAdmin
 * Path: index.php
 */

require_once __DIR__ . '/config/config.php';

// Check DB status gracefully
$dbConnected = false;
$dbError = '';
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $dbConnected = true;
} catch (PDOException $e) {
    $dbConnected = false;
    $dbError = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PathForge — Career Roadmap Generator & Diagnostic Skill Platform</title>
  <meta name="description" content="Personalized career roadmap generator and diagnostic skill benchmark built for XAMPP (PHP 8, MySQL, HTML5, CSS3, Vanilla JS).">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧭</text></svg>">
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="navbar">
    <div class="nav-brand" onclick="setActiveTab('roadmap')">
      <div class="brand-icon">PF</div>
      <div>
        <div class="brand-title">PathForge</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">PHP 8 + MySQL (XAMPP Edition)</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button class="nav-tab-btn active" data-tab="roadmap">
        <span>🗺️</span> Roadmap
      </button>
      <button class="nav-tab-btn" data-tab="assessment">
        <span>⚡</span> Diagnostic Quiz
      </button>
      <button class="nav-tab-btn" data-tab="resources">
        <span>📚</span> Resources
      </button>
      <button class="nav-tab-btn" data-tab="profile">
        <span>👤</span> Student Profile
      </button>
      <button class="nav-tab-btn admin-tab" data-tab="admin">
        <span>🛡️</span> Admin & Faculty
      </button>
    </nav>

    <!-- Top Right Actions -->
    <div class="nav-actions">
      <div class="streak-pill">
        <span>🔥</span>
        <span>5 Day Streak</span>
      </div>
      <select id="careerSelect" class="career-switcher" title="Switch Career Track">
        <option value="1">Web Developer (24 wks)</option>
        <option value="2">Data Analyst (20 wks)</option>
        <option value="3">UI/UX Designer (18 wks)</option>
        <option value="4">Android App Developer (22 wks)</option>
        <option value="5">Digital Marketing Specialist (16 wks)</option>
      </select>
    </div>
  </header>

  <!-- Main Application Body -->
  <main class="app-container">

    <?php if (!$dbConnected): ?>
    <!-- Notice for first-time XAMPP setup if MySQL database is not yet imported -->
    <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
      <div>
        <strong style="color: #fbbf24; font-size: 0.95rem;">⚠️ Database Setup Notice:</strong>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">
          MySQL database <code>pathforge_db</code> is not detected. Please open <strong>phpMyAdmin</strong> (<a href="http://localhost/phpmyadmin" target="_blank" style="color: #38bdf8; text-decoration: underline;">http://localhost/phpmyadmin</a>) and import <code>database/pathforge_db.sql</code>.
        </p>
      </div>
      <a href="database/pathforge_db.sql" download class="btn-guide" style="background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; color: #fde68a;">
        📥 Download SQL Script
      </a>
    </div>
    <?php endif; ?>

    <!-- Beginner Guide Banner -->
    <div class="guide-banner" id="guideBanner">
      <div class="guide-banner-text">
        <div class="guide-sparkle">✨</div>
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">New to PathForge? Beginner's Quick Orientation</div>
          <div style="font-size: 0.825rem; color: var(--text-secondary);">
            Learn how diagnostic assessments, 4-view roadmaps, and the XAMPP PHP backend guide your career step-by-step.
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn-guide" id="openGuideBtn">How It Works & FAQ</button>
      </div>
    </div>

    <!-- Hero / Career Progress Banner -->
    <section class="career-hero" id="careerHero">
      <!-- Dynamically filled by assets/js/app.js -->
      <div class="hero-top">
        <div class="career-info">
          <h1>Web Developer</h1>
          <p class="career-tagline">Craft interactive digital experiences from client to server</p>
          <div class="career-meta-chips">
            <span class="chip chip-emerald">Fundamentals</span>
            <span class="chip chip-salary">$85,000 - $130,000 / yr</span>
            <span class="chip">Moderate Difficulty</span>
            <span class="chip">24 Weeks Roadmap</span>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-box">
            <div class="stat-value">25%</div>
            <div class="stat-label">Progress</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">3 / 12</div>
            <div class="stat-label">Milestones</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">5 Days</div>
            <div class="stat-label">Study Streak</div>
          </div>
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: 25%;"></div>
      </div>
      <div class="progress-subtext">
        <span>Curriculum Mastered: 3 of 12 milestones</span>
        <span>Target Pace: 15 hrs / week</span>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- TAB 1: ROADMAP (4 Dynamic Views) -->
    <!-- ====================================================== -->
    <section id="tab-roadmap" class="tab-pane">
      <div class="roadmap-controls">
        <!-- View Mode Switcher -->
        <div class="view-mode-group">
          <button class="view-mode-btn active" data-view="network" title="Serpentine Step Path">
            <span>🧭</span> Step Path
          </button>
          <button class="view-mode-btn" data-view="split" title="Split Master-Detail IDE Lab">
            <span>🔬</span> Study Lab & Pomodoro
          </button>
          <button class="view-mode-btn" data-view="board" title="3-Column Kanban Workflow">
            <span>📋</span> Kanban Board
          </button>
          <button class="view-mode-btn" data-view="schedule" title="Weekly Sprint & Graduation Velocity">
            <span>📅</span> Sprint Planner
          </button>
        </div>

        <!-- Stage Filter Buttons -->
        <div class="stage-filters">
          <button class="stage-btn active" data-stage="all">All Stages</button>
          <button class="stage-btn" data-stage="fundamentals">Fundamentals</button>
          <button class="stage-btn" data-stage="intermediate">Intermediate</button>
          <button class="stage-btn" data-stage="advanced">Advanced</button>
        </div>
      </div>

      <!-- Roadmap View Container (Step Path, Lab, Kanban, or Sprint) -->
      <div id="roadmapViewContainer">
        <!-- Injected by JavaScript -->
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- TAB 2: DIAGNOSTIC ASSESSMENT -->
    <!-- ====================================================== -->
    <section id="tab-assessment" class="tab-pane" style="display: none;">
      <div id="assessmentContainer">
        <!-- Injected by JavaScript -->
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- TAB 3: LEARNING RESOURCES -->
    <!-- ====================================================== -->
    <section id="tab-resources" class="tab-pane" style="display: none;">
      <!-- Injected by JavaScript -->
    </section>

    <!-- ====================================================== -->
    <!-- TAB 4: STUDENT PROFILE -->
    <!-- ====================================================== -->
    <section id="tab-profile" class="tab-pane" style="display: none;">
      <!-- Injected by JavaScript -->
    </section>

    <!-- ====================================================== -->
    <!-- TAB 5: ADMIN & FACULTY PORTAL -->
    <!-- ====================================================== -->
    <section id="tab-admin" class="tab-pane" style="display: none;">
      <div id="adminContainer">
        <!-- Injected by JavaScript -->
      </div>
    </section>

  </main>

  <!-- ======================================================== -->
  <!-- MODALS -->
  <!-- ======================================================== -->

  <!-- Beginner Guide & Architecture FAQ Modal -->
  <div id="guideModal" class="modal-overlay" style="display: none;">
    <div class="modal-content">
      <div class="modal-header">
        <h3 style="font-size: 1.25rem; color: #fff;">About PathForge & XAMPP Architecture</h3>
        <button class="btn-icon" onclick="closeGuideModal()">✕</button>
      </div>
      <div style="font-size: 0.9rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--primary);">What is PathForge?</strong>
          <p style="margin-top: 0.25rem;">
            PathForge is a complete, full-stack Academic Mini-Project engineered to solve career confusion for students. It creates a personalized learning trajectory through diagnostic testing, structured milestone tracks, and focus study timers.
          </p>
        </div>
        <div>
          <strong style="color: var(--primary);">Technology Architecture (Mandatory College Stack):</strong>
          <ul style="margin-top: 0.25rem; padding-left: 1.25rem;">
            <li><strong>Frontend:</strong> HTML5 semantic markup, CSS3 styling (zero Node/Tailwind build tools needed), and Vanilla ES6 JavaScript.</li>
            <li><strong>Backend:</strong> PHP 8.x with PDO (PHP Data Objects) for secure, prepared SQL interactions.</li>
            <li><strong>Database:</strong> MySQL 8.0 / MariaDB with normalized 3NF relational schemas.</li>
            <li><strong>Local Server:</strong> Runs directly inside XAMPP Apache <code>htdocs/PathForge</code>.</li>
          </ul>
        </div>
        <div>
          <strong style="color: var(--primary);">4-View Roadmap Modes:</strong>
          <ul style="margin-top: 0.25rem; padding-left: 1.25rem;">
            <li><strong>Step Path:</strong> Visual sequential milestone path from fundamentals to advanced.</li>
            <li><strong>Study Lab:</strong> Split workbench featuring an interactive 25-minute Pomodoro timer, checklist, and notes.</li>
            <li><strong>Kanban Board:</strong> 3-column agile workflow (To Do, In Progress, Completed).</li>
            <li><strong>Sprint Planner:</strong> Dynamic hours/week velocity calculator projecting your graduation date.</li>
          </ul>
        </div>
        <div style="text-align: right; margin-top: 1rem;">
          <button class="btn-primary" onclick="closeGuideModal()">Got It, Let's Build!</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Application JavaScript -->
  <script src="assets/js/app.js"></script>
</body>
</html>
