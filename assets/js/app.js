/**
 * PathForge - Frontend Application Controller
 * Technology: Vanilla JavaScript (ES6+) - 100% Dependency-free
 * Connects to PHP 8.x PDO endpoints at api/*.php
 */

const AppState = {
  activeTab: 'roadmap',
  activeViewMode: 'network', // 'network' (Step Path), 'split' (Study Lab), 'board' (Kanban), 'schedule' (Sprint)
  activeStageFilter: 'all',
  activeCareerId: 1,
  currentUserId: 1,
  careers: [],
  skills: [],
  progressSummary: null,
  focusedSkillId: null,
  
  // Timer state
  timerDuration: 25 * 60,
  timerSecondsLeft: 25 * 60,
  timerInterval: null,
  isTimerRunning: false,
  studyHoursPerWeek: 15,
  
  // Diagnostic quiz
  quizQuestions: [],
  quizAnswers: {},
  quizResult: null,

  // Admin state
  adminSubtab: 'tracks',
  adminStudents: [],
  adminStats: null,
  editingCareer: null,
  editingSkill: null
};

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', async () => {
  initEventListeners();
  await loadCareers();
  await switchCareer(1);
  setupTimerControls();
});

// ==========================================================
// EVENT LISTENERS & TAB ROUTING
// ==========================================================
function initEventListeners() {
  // Main Tab Buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
    });
  });

  // Career Switcher
  const careerSelect = document.getElementById('careerSelect');
  if (careerSelect) {
    careerSelect.addEventListener('change', (e) => {
      switchCareer(parseInt(e.target.value, 10));
    });
  }

  // View Mode Switcher
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeViewMode = btn.dataset.view;
      renderCurrentRoadmapView();
    });
  });

  // Stage Filter Buttons
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeStageFilter = btn.dataset.stage;
      renderCurrentRoadmapView();
    });
  });

  // Guide Modal
  const guideBtn = document.getElementById('openGuideBtn');
  if (guideBtn) {
    guideBtn.addEventListener('click', openGuideModal);
  }
}

function setActiveTab(tab) {
  AppState.activeTab = tab;
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.style.display = 'none';
  });

  const activePane = document.getElementById(`tab-${tab}`);
  if (activePane) {
    activePane.style.display = 'block';
  }

  if (tab === 'assessment') {
    loadDiagnosticAssessment();
  } else if (tab === 'admin') {
    loadAdminData();
  } else if (tab === 'resources') {
    renderResourcesTab();
  } else if (tab === 'profile') {
    renderProfileTab();
  } else if (tab === 'roadmap') {
    renderCurrentRoadmapView();
  }
}

// ==========================================================
// DATA FETCHING & API INTEGRATION
// ==========================================================
// DATA FETCHING & API INTEGRATION (With Offline Resilience)
// ==========================================================
async function loadCareers() {
  try {
    const res = await fetch('api/careers.php');
    if (!res.ok) throw new Error('HTTP error');
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      AppState.careers = json.data;
      populateCareerSwitcher();
      return;
    }
    throw new Error('Invalid data');
  } catch (err) {
    console.info('Using local career tracks catalog');
    loadFallbackData();
  }
}

function populateCareerSwitcher() {
  const select = document.getElementById('careerSelect');
  if (!select) return;
  select.innerHTML = '';
  AppState.careers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.career_id;
    opt.textContent = `${c.career_name} (${c.total_duration_weeks} wks)`;
    select.appendChild(opt);
  });
  select.value = AppState.activeCareerId;
}

async function switchCareer(careerId) {
  AppState.activeCareerId = careerId;
  const select = document.getElementById('careerSelect');
  if (select) select.value = careerId;

  await loadSkillsForCareer(careerId);
  await loadProgressSummary(careerId);
  renderHeroBanner();
  renderCurrentRoadmapView();
}

async function loadSkillsForCareer(careerId) {
  try {
    const res = await fetch(`api/skills.php?career_id=${careerId}&user_id=${AppState.currentUserId}`);
    if (!res.ok) throw new Error('HTTP error');
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      AppState.skills = json.data;
      if (!AppState.focusedSkillId && AppState.skills.length > 0) {
        AppState.focusedSkillId = AppState.skills[0].skill_id;
      }
      return;
    }
    throw new Error('Invalid skills response');
  } catch (err) {
    // Fall back to local embedded skills catalog
    loadFallbackSkills(careerId);
  }
}

async function loadProgressSummary(careerId) {
  try {
    const res = await fetch(`api/progress.php?career_id=${careerId}&user_id=${AppState.currentUserId}`);
    if (!res.ok) throw new Error('HTTP error');
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      AppState.progressSummary = json.data;
      return;
    }
  } catch (err) {
    // Calculate progress summary locally
    calculateLocalProgressSummary();
  }
}

function calculateLocalProgressSummary() {
  const total = AppState.skills.length;
  const completed = AppState.skills.filter(s => s.user_status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let currentStage = 'Fundamentals';
  const firstUnfinished = AppState.skills.find(s => s.user_status !== 'completed');
  if (firstUnfinished) {
    currentStage = firstUnfinished.stage_label;
  } else if (total > 0 && completed === total) {
    currentStage = 'Advanced (Mastered)';
  }

  AppState.progressSummary = {
    completion_percentage: percentage,
    completed_skills: completed,
    total_skills: total,
    current_stage: currentStage
  };
}

// ==========================================================
// HERO BANNER RENDERING
// ==========================================================
function renderHeroBanner() {
  const career = AppState.careers.find(c => c.career_id == AppState.activeCareerId) || AppState.careers[0];
  if (!career) return;

  const summary = AppState.progressSummary || {
    completion_percentage: 0,
    completed_skills: 0,
    total_skills: AppState.skills.length,
    current_stage: 'Fundamentals'
  };

  const heroContainer = document.getElementById('careerHero');
  if (!heroContainer) return;

  heroContainer.innerHTML = `
    <div class="hero-top">
      <div class="career-info">
        <h1>${career.career_name}</h1>
        <p class="career-tagline">${career.tagline || career.description}</p>
        <div class="career-meta-chips">
          <span class="chip chip-emerald">${summary.current_stage}</span>
          <span class="chip chip-salary">${career.avg_salary}</span>
          <span class="chip">${career.difficulty_level} Difficulty</span>
          <span class="chip">${career.total_duration_weeks} Weeks Roadmap</span>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-box">
          <div class="stat-value">${summary.completion_percentage}%</div>
          <div class="stat-label">Progress</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${summary.completed_skills} / ${summary.total_skills}</div>
          <div class="stat-label">Milestones</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">5 Days</div>
          <div class="stat-label">Study Streak</div>
        </div>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width: ${summary.completion_percentage}%;"></div>
    </div>
    <div class="progress-subtext">
      <span>Curriculum Mastered: ${summary.completed_skills} of ${summary.total_skills} milestones</span>
      <span>Target Pace: 15 hrs / week</span>
    </div>
  `;
}

// ==========================================================
// 4 ROADMAP VIEWS RENDERING
// ==========================================================
function renderCurrentRoadmapView() {
  const container = document.getElementById('roadmapViewContainer');
  if (!container) return;

  let filtered = AppState.skills;
  if (AppState.activeStageFilter !== 'all') {
    filtered = filtered.filter(s => s.stage_label.toLowerCase() === AppState.activeStageFilter.toLowerCase());
  }

  if (AppState.activeViewMode === 'network') {
    renderStepPathView(container, filtered);
  } else if (AppState.activeViewMode === 'split') {
    renderSplitWorkbenchView(container, filtered);
  } else if (AppState.activeViewMode === 'board') {
    renderKanbanBoardView(container, filtered);
  } else if (AppState.activeViewMode === 'schedule') {
    renderSprintScheduleView(container, filtered);
  }
}

// View 1: Step Path (Serpentine Node Graph)
function renderStepPathView(container, skills) {
  if (skills.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--text-muted);">No milestones in this stage.</div>`;
    return;
  }

  let html = `<div class="step-path-container">`;
  skills.forEach((skill, idx) => {
    const status = skill.user_status || 'not_started';
    const topics = skill.key_topics ? skill.key_topics.split(',').map(t => t.trim()) : ['Core Concept'];

    html += `
      <div class="step-card ${status}">
        <div class="step-number">${skill.step_order || (idx + 1)}</div>
        <div class="step-content">
          <div class="step-header">
            <span class="step-title">${skill.skill_name}</span>
            <span class="step-stage-badge">${skill.stage_label}</span>
          </div>
          <p class="step-desc">${skill.description}</p>
          <div class="step-topics">
            ${topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
          </div>
          <div class="step-footer">
            <div class="step-meta">
              <span>⏱ ${skill.estimated_hours} Hours</span>
              <span>⚡ ${skill.difficulty}</span>
              ${skill.resource_link ? `<a href="${skill.resource_link}" target="_blank" rel="noopener">📖 Resource &nearr;</a>` : ''}
            </div>
            <div>
              <select class="status-dropdown" onchange="updateSkillStatus(${skill.skill_id}, this.value)">
                <option value="not_started" ${status === 'not_started' ? 'selected' : ''}>To Do</option>
                <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// View 2: Study Lab / Split Workbench with Pomodoro
function renderSplitWorkbenchView(container, skills) {
  const focusedSkill = skills.find(s => s.skill_id === AppState.focusedSkillId) || skills[0] || {};
  const status = focusedSkill.user_status || 'not_started';
  const checklist = focusedSkill.checklist || [
    'Review documentation and key concepts',
    'Write code exercises and verify edge cases',
    'Document findings and complete self-check'
  ];

  let html = `
    <div class="split-workbench">
      <div class="workbench-list">
        <h3 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem;">Curriculum Milestones</h3>
        ${skills.map(s => `
          <div class="workbench-item ${s.skill_id === focusedSkill.skill_id ? 'active' : ''}" onclick="selectFocusedSkill(${s.skill_id})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; font-size:0.9rem;">${s.step_order}. ${s.skill_name}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${s.estimated_hours}h</span>
            </div>
            <div style="font-size:0.75rem; color:${s.user_status === 'completed' ? 'var(--primary)' : 'var(--text-muted)'}; margin-top:0.25rem;">
              ● ${s.user_status || 'not_started'}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="workbench-detail">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="chip chip-emerald" style="margin-bottom:0.5rem; display:inline-block;">${focusedSkill.stage_label || 'Stage'}</span>
            <h2 style="font-size:1.4rem; color:#fff;">${focusedSkill.skill_name || 'Select a Milestone'}</h2>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">${focusedSkill.description || ''}</p>
          </div>
          <select class="status-dropdown" onchange="updateSkillStatus(${focusedSkill.skill_id}, this.value)">
            <option value="not_started" ${status === 'not_started' ? 'selected' : ''}>To Do</option>
            <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <!-- Pomodoro Focus Timer -->
        <div class="timer-box">
          <div>
            <div style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">Focus Session</div>
            <div class="timer-display" id="pomodoroDisplay">${formatTime(AppState.timerSecondsLeft)}</div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-timer" id="timerToggleBtn" onclick="togglePomodoroTimer()">
              ${AppState.isTimerRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button class="btn-timer" style="background:var(--bg-card); color:var(--text-secondary); border:1px solid var(--border-color);" onclick="resetPomodoroTimer()">
              Reset
            </button>
          </div>
        </div>

        <!-- Checklist -->
        <div class="checklist-box">
          <h4 style="font-size:0.9rem; margin-bottom:0.75rem; color:#fff;">Milestone Deliverable Checklist</h4>
          ${checklist.map((item, i) => `
            <div class="checklist-item">
              <input type="checkbox" id="chk_${i}" checked>
              <label for="chk_${i}">${item}</label>
            </div>
          `).join('')}
        </div>

        <!-- Study Notes -->
        <div>
          <label class="form-label">Personal Reflection & Notes</label>
          <textarea class="notes-area" placeholder="Write quick notes, code snippets, or key takeaways..." onchange="saveSkillNotes(${focusedSkill.skill_id}, this.value)">${focusedSkill.notes || ''}</textarea>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function selectFocusedSkill(skillId) {
  AppState.focusedSkillId = skillId;
  renderCurrentRoadmapView();
}

// View 3: 3-Column Kanban Board
function renderKanbanBoardView(container, skills) {
  const notStarted = skills.filter(s => !s.user_status || s.user_status === 'not_started');
  const inProgress = skills.filter(s => s.user_status === 'in_progress');
  const completed = skills.filter(s => s.user_status === 'completed');

  const html = `
    <div class="kanban-grid">
      <!-- To Do -->
      <div class="kanban-col">
        <div class="kanban-header">
          <div class="kanban-title">To Do</div>
          <span class="kanban-count">${notStarted.length}</span>
        </div>
        ${notStarted.map(s => renderKanbanCard(s, 'not_started')).join('')}
      </div>

      <!-- In Progress -->
      <div class="kanban-col">
        <div class="kanban-header">
          <div class="kanban-title" style="color:var(--warning);">In Progress</div>
          <span class="kanban-count">${inProgress.length}</span>
        </div>
        ${inProgress.map(s => renderKanbanCard(s, 'in_progress')).join('')}
      </div>

      <!-- Completed -->
      <div class="kanban-col">
        <div class="kanban-header">
          <div class="kanban-title" style="color:var(--primary);">Completed</div>
          <span class="kanban-count">${completed.length}</span>
        </div>
        ${completed.map(s => renderKanbanCard(s, 'completed')).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderKanbanCard(skill, currentColumn) {
  return `
    <div class="kanban-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="step-stage-badge" style="font-size:0.65rem;">${skill.stage_label}</span>
        <span style="font-size:0.75rem; color:var(--text-muted);">${skill.estimated_hours}h</span>
      </div>
      <div class="kanban-card-title">${skill.skill_name}</div>
      <div class="kanban-actions">
        ${currentColumn !== 'not_started' ? `<button class="btn-move" onclick="updateSkillStatus(${skill.skill_id}, 'not_started')">&larr; To Do</button>` : '<span></span>'}
        ${currentColumn !== 'in_progress' ? `<button class="btn-move" onclick="updateSkillStatus(${skill.skill_id}, 'in_progress')">In Progress</button>` : ''}
        ${currentColumn !== 'completed' ? `<button class="btn-move" onclick="updateSkillStatus(${skill.skill_id}, 'completed')">Complete &rarr;</button>` : ''}
      </div>
    </div>
  `;
}

// View 4: Weekly Sprint Schedule Planner
function renderSprintScheduleView(container, skills) {
  const totalHours = skills.reduce((acc, s) => acc + (s.estimated_hours || 15), 0);
  const remainingHours = skills
    .filter(s => s.user_status !== 'completed')
    .reduce((acc, s) => acc + (s.estimated_hours || 15), 0);

  const estimatedWeeks = Math.ceil(remainingHours / AppState.studyHoursPerWeek);

  // Group skills into weekly buckets based on studyHoursPerWeek
  const weeklyBuckets = [];
  let currentBucket = [];
  let currentBucketHours = 0;

  skills.forEach(s => {
    const h = s.estimated_hours || 15;
    if (currentBucketHours + h > AppState.studyHoursPerWeek && currentBucket.length > 0) {
      weeklyBuckets.push(currentBucket);
      currentBucket = [s];
      currentBucketHours = h;
    } else {
      currentBucket.push(s);
      currentBucketHours += h;
    }
  });
  if (currentBucket.length > 0) weeklyBuckets.push(currentBucket);

  const html = `
    <div>
      <div class="sprint-calc-card">
        <div>
          <h3 style="font-size:1.15rem; color:#fff; margin-bottom:0.25rem;">Weekly Velocity & Graduation Calculator</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem;">
            Estimated time to complete remaining milestones: <strong style="color:var(--primary);">${estimatedWeeks} Weeks</strong> (${remainingHours} hours left)
          </p>
        </div>
        <div class="slider-container">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600;">
            <span>Target Pace:</span>
            <span style="color:var(--primary);">${AppState.studyHoursPerWeek} Hours / Week</span>
          </div>
          <input type="range" class="sprint-slider" min="5" max="40" step="5" value="${AppState.studyHoursPerWeek}" oninput="updateStudyPace(this.value)">
        </div>
      </div>

      <div class="sprint-timeline">
        ${weeklyBuckets.map((week, idx) => `
          <div class="sprint-week-card">
            <div class="week-num-badge">Sprint Week ${idx + 1}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
              Capacity: ${week.reduce((a, b) => a + b.estimated_hours, 0)} hours
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${week.map(s => `
                <div style="background:var(--bg-secondary); padding:0.5rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.06);">
                  <div style="font-size:0.85rem; font-weight:600; color:${s.user_status === 'completed' ? 'var(--primary)' : '#fff'};">
                    ${s.user_status === 'completed' ? '✓ ' : ''}${s.skill_name}
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${s.estimated_hours} hrs</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function updateStudyPace(val) {
  AppState.studyHoursPerWeek = parseInt(val, 10);
  renderCurrentRoadmapView();
}

// ==========================================================
// PROGRESS UPDATES (AJAX TO api/progress.php)
// ==========================================================
async function updateSkillStatus(skillId, newStatus) {
  try {
    const res = await fetch('api/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        user_id: AppState.currentUserId,
        career_id: AppState.activeCareerId,
        skill_id: skillId,
        status: newStatus
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      showToast('Progress Saved', `Status updated to ${newStatus}`);
      // Update local state
      const target = AppState.skills.find(s => s.skill_id == skillId);
      if (target) target.user_status = newStatus;
      await loadProgressSummary(AppState.activeCareerId);
      renderHeroBanner();
      renderCurrentRoadmapView();
    }
  } catch (err) {
    console.error('Error updating status:', err);
    showToast('Offline Mode', 'Status updated in session');
  }
}

async function saveSkillNotes(skillId, notes) {
  try {
    await fetch('api/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        user_id: AppState.currentUserId,
        career_id: AppState.activeCareerId,
        skill_id: skillId,
        notes: notes
      })
    });
    showToast('Notes Saved', 'Personal study note synchronized to database.');
  } catch (err) {
    console.error('Error saving notes:', err);
  }
}

// ==========================================================
// DIAGNOSTIC ASSESSMENT ENGINE
// ==========================================================
async function loadDiagnosticAssessment() {
  const container = document.getElementById('assessmentContainer');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Loading diagnostic questions...</div>`;

  try {
    const res = await fetch(`api/assessment.php?career_id=${AppState.activeCareerId}`);
    if (!res.ok) throw new Error('HTTP error');
    const json = await res.json();
    if (json.status === 'success') {
      AppState.quizQuestions = json.questions;
      AppState.quizAnswers = {};
      renderDiagnosticQuiz();
      return;
    }
    throw new Error('Invalid quiz response');
  } catch (err) {
    loadFallbackQuiz();
  }
}

function renderDiagnosticQuiz() {
  const container = document.getElementById('assessmentContainer');
  if (!container) return;

  if (AppState.quizQuestions.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem;">No diagnostic quiz configured for this track yet.</div>`;
    return;
  }

  let html = `
    <div class="assessment-wrap">
      <div style="text-align:center; margin-bottom:2rem;">
        <span class="chip chip-emerald" style="margin-bottom:0.5rem; display:inline-block;">Skill Benchmark</span>
        <h2 style="font-size:1.75rem; color:#fff;">Diagnostic Skill Assessment</h2>
        <p style="color:var(--text-secondary); max-width:600px; margin:0.5rem auto;">
          Answer these multiple-choice questions to calibrate your roadmap. Any topics you master will automatically be fast-tracked!
        </p>
      </div>

      <form id="quizForm" onsubmit="submitDiagnosticQuiz(event)">
        ${AppState.quizQuestions.map((q, idx) => `
          <div class="question-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--primary);">Question ${idx + 1} of ${AppState.quizQuestions.length}</span>
              <span class="step-stage-badge">${q.topic || 'Skill Evaluation'}</span>
            </div>
            <h3 style="font-size:1.1rem; color:#fff; margin-bottom:1.25rem;">${q.question}</h3>
            <div>
              ${q.options.map((opt, optIdx) => `
                <label class="quiz-option" id="opt_lbl_${q.quiz_id}_${optIdx}">
                  <input type="radio" name="quiz_${q.quiz_id}" value="${optIdx}" onchange="selectQuizOption(${q.quiz_id}, ${optIdx})" style="margin-right:0.75rem;">
                  ${opt}
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <div style="text-align:center; margin-top:1.5rem;">
          <button type="submit" class="btn-primary" style="padding:0.9rem 2.5rem; font-size:1.05rem;">
            Submit Assessment & Generate Roadmap &rarr;
          </button>
        </div>
      </form>
    </div>
  `;

  container.innerHTML = html;
}

function selectQuizOption(quizId, optIdx) {
  AppState.quizAnswers[quizId] = optIdx;
  document.querySelectorAll(`[id^="opt_lbl_${quizId}_"]`).forEach(lbl => lbl.classList.remove('selected'));
  const selectedLabel = document.getElementById(`opt_lbl_${quizId}_${optIdx}`);
  if (selectedLabel) selectedLabel.classList.add('selected');
}

async function submitDiagnosticQuiz(e) {
  e.preventDefault();

  try {
    const res = await fetch('api/assessment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: AppState.currentUserId,
        career_id: AppState.activeCareerId,
        answers: AppState.quizAnswers
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      renderQuizResult(json);
      await loadSkillsForCareer(AppState.activeCareerId);
      await loadProgressSummary(AppState.activeCareerId);
      renderHeroBanner();
      return;
    }
    throw new Error('Invalid quiz response');
  } catch (err) {
    evaluateFallbackQuiz();
    calculateLocalProgressSummary();
    renderHeroBanner();
    showToast('Submission Complete', 'Benchmark calculated successfully.');
  }
}

function renderQuizResult(result) {
  const container = document.getElementById('assessmentContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="assessment-wrap">
      <div class="benchmark-result">
        <div class="result-score-circle">${result.score_percentage}%</div>
        <h2 style="font-size:1.6rem; color:#fff; margin-bottom:0.5rem;">Diagnostic Complete!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
          Recommended Placement: <strong style="color:var(--primary); font-size:1.1rem;">${result.placement}</strong>
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; text-align:left; margin-bottom:2rem;">
          <div style="background:var(--bg-card); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--primary); font-size:0.9rem; margin-bottom:0.75rem;">Verified Strengths</h4>
            ${(result.skills_mastered || []).length > 0 
              ? result.skills_mastered.map(s => `<div style="font-size:0.85rem; padding:0.25rem 0;">✓ ${s}</div>`).join('') 
              : '<div style="font-size:0.85rem; color:var(--text-muted);">None marked as mastered yet. Great opportunity to learn!</div>'}
          </div>

          <div style="background:var(--bg-card); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--warning); font-size:0.9rem; margin-bottom:0.75rem;">Priority Growth Areas</h4>
            ${(result.skills_to_study || []).length > 0 
              ? result.skills_to_study.map(s => `<div style="font-size:0.85rem; padding:0.25rem 0;">⚡ ${s}</div>`).join('') 
              : '<div style="font-size:0.85rem; color:var(--text-muted);">All core concepts validated!</div>'}
          </div>
        </div>

        <button class="btn-primary" onclick="setActiveTab('roadmap')">
          Go To Calibrated Roadmap &rarr;
        </button>
      </div>
    </div>
  `;
}

// ==========================================================
// ADMIN & TEACHER PORTAL
// ==========================================================
async function loadAdminData() {
  try {
    const res = await fetch('api/admin.php');
    if (!res.ok) throw new Error('HTTP error');
    const json = await res.json();
    if (json.status === 'success') {
      AppState.adminStats = json.stats;
      AppState.adminStudents = json.students;
      renderAdminPortal();
      return;
    }
    throw new Error('Invalid admin data');
  } catch (err) {
    loadFallbackAdmin();
  }
}

function renderAdminPortal() {
  const container = document.getElementById('adminContainer');
  if (!container) return;

  const stats = AppState.adminStats || { total_students: 3, total_careers: 5, total_skills: 48, total_completions: 14 };

  const html = `
    <div>
      <div class="admin-header">
        <div>
          <h2 style="font-size:1.5rem; color:#fff;">Admin & Faculty Management Portal</h2>
          <p style="color:var(--text-secondary); font-size:0.875rem;">Manage tracks, adjust milestones, and track student completion</p>
        </div>
        <div class="admin-subtabs">
          <button class="admin-subtab-btn ${AppState.adminSubtab === 'tracks' ? 'active' : ''}" onclick="switchAdminSubtab('tracks')">Careers</button>
          <button class="admin-subtab-btn ${AppState.adminSubtab === 'skills' ? 'active' : ''}" onclick="switchAdminSubtab('skills')">Milestones</button>
          <button class="admin-subtab-btn ${AppState.adminSubtab === 'students' ? 'active' : ''}" onclick="switchAdminSubtab('students')">Students Roster</button>
          <button class="admin-subtab-btn ${AppState.adminSubtab === 'defense' ? 'active' : ''}" onclick="switchAdminSubtab('defense')">Viva Defense Q&A</button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1.5rem;">
        <div class="stat-box">
          <div class="stat-value">${stats.total_students}</div>
          <div class="stat-label">Enrolled Students</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.total_careers}</div>
          <div class="stat-label">Career Tracks</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.total_skills}</div>
          <div class="stat-label">Total Milestones</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.total_completions}</div>
          <div class="stat-label">Verified Completions</div>
        </div>
      </div>

      <div id="adminSubtabContent">
        ${renderAdminSubtabContent()}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function switchAdminSubtab(subtab) {
  AppState.adminSubtab = subtab;
  renderAdminPortal();
}

function renderAdminSubtabContent() {
  if (AppState.adminSubtab === 'tracks') {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3 style="font-size:1.1rem; color:#fff;">Configured Career Tracks</h3>
        <button class="btn-primary" onclick="openAddCareerModal()">+ Add New Track</button>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Track Name</th>
              <th>Duration</th>
              <th>Avg Salary</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${AppState.careers.map(c => `
              <tr>
                <td>#${c.career_id}</td>
                <td><strong>${c.career_name}</strong><br><small style="color:var(--text-muted);">${c.tagline || ''}</small></td>
                <td>${c.total_duration_weeks} wks</td>
                <td>${c.avg_salary}</td>
                <td><span class="chip">${c.difficulty_level}</span></td>
                <td>
                  <button class="btn-icon" onclick="openEditCareerModal(${c.career_id})">✏️ Edit</button>
                  <button class="btn-icon btn-delete" onclick="deleteCareer(${c.career_id})">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (AppState.adminSubtab === 'skills') {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3 style="font-size:1.1rem; color:#fff;">Milestones for Active Track</h3>
        <button class="btn-primary" onclick="openAddSkillModal()">+ Add Milestone</button>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Milestone Name</th>
              <th>Stage</th>
              <th>Est. Hours</th>
              <th>Resource</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${AppState.skills.map(s => `
              <tr>
                <td>#${s.step_order}</td>
                <td><strong>${s.skill_name}</strong></td>
                <td><span class="step-stage-badge">${s.stage_label}</span></td>
                <td>${s.estimated_hours} hrs</td>
                <td><a href="${s.resource_link}" target="_blank" rel="noopener">Link &nearr;</a></td>
                <td>
                  <button class="btn-icon" onclick="openEditSkillModal(${s.skill_id})">✏️ Edit</button>
                  <button class="btn-icon btn-delete" onclick="deleteSkill(${s.skill_id})">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (AppState.adminSubtab === 'students') {
    return `
      <h3 style="font-size:1.1rem; color:#fff; margin-bottom:1rem;">Enrolled Students Progress Tracking</h3>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Enrolled Track</th>
              <th>Streak</th>
              <th>Completion Progress</th>
              <th>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            ${(AppState.adminStudents || []).map(stu => `
              <tr>
                <td><strong>${stu.full_name || stu.username}</strong><br><small style="color:var(--text-muted);">${stu.target_goal || ''}</small></td>
                <td>${stu.email}</td>
                <td><span class="chip chip-emerald">${stu.career_name || 'Web Developer'}</span></td>
                <td>🔥 ${stu.study_streak_days} days</td>
                <td style="width:200px;">
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.25rem;">
                    <span>${stu.completed_skills || 0} / ${stu.total_career_skills || 12}</span>
                    <span>${stu.progress_percentage || 0}%</span>
                  </div>
                  <div class="progress-track" style="height:6px;">
                    <div class="progress-fill" style="width:${stu.progress_percentage || 0}%;"></div>
                  </div>
                </td>
                <td>
                  <button class="btn-move" onclick="grantStudentMastery(${stu.user_id})">Grant 100%</button>
                  <button class="btn-move" style="color:var(--danger);" onclick="resetStudentProgress(${stu.user_id})">Reset</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (AppState.adminSubtab === 'defense') {
    return `
      <div style="background:var(--bg-card); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <h3 style="font-size:1.25rem; color:#fff; margin-bottom:0.75rem;">Academic Project Defense & Viva Voce Quick Sheet</h3>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">
          These standard examiner questions can be verified directly on this live system:
        </p>

        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="background:var(--bg-secondary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <strong style="color:var(--primary); font-size:0.95rem;">Q1: Why was PHP PDO chosen instead of deprecated mysqli or raw queries?</strong>
            <p style="color:var(--text-secondary); font-size:0.875rem; margin-top:0.25rem;">
              PDO (PHP Data Objects) offers database-independent parameter binding, eliminating SQL Injection vulnerabilities and providing robust exception handling.
            </p>
          </div>

          <div style="background:var(--bg-secondary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <strong style="color:var(--primary); font-size:0.95rem;">Q2: How does the Diagnostic Assessment generate personalized roadmaps?</strong>
            <p style="color:var(--text-secondary); font-size:0.875rem; margin-top:0.25rem;">
              The assessment verifies prerequisite skills using topic-mapped questions. Correct answers mark milestones as "Completed", adjusting starting recommendations to the student's actual competence.
            </p>
          </div>

          <div style="background:var(--bg-secondary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <strong style="color:var(--primary); font-size:0.95rem;">Q3: How is data normalized in MySQL?</strong>
            <p style="color:var(--text-secondary); font-size:0.875rem; margin-top:0.25rem;">
              The database follows Third Normal Form (3NF). Users, Careers, and Skill Paths exist in dedicated tables linked via Foreign Keys with cascading referential integrity.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

  try {
    const res = await fetch('api/admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'grant_student_mastery', user_id: userId })
    });
    const json = await res.json();
    showToast('Admin Action', json.message || '100% Mastery granted.');
    loadAdminData();
  } catch (err) {
    const target = (AppState.adminStudents || []).find(s => s.user_id === userId);
    if (target) {
      target.completed_skills = target.total_career_skills || 12;
      target.progress_percentage = 100;
    }
    showToast('Admin Action', 'Granted 100% mastery for student.');
    renderAdminPortal();
  }
  if (userId === AppState.currentUserId) {
    AppState.skills.forEach(s => s.user_status = 'completed');
    calculateLocalProgressSummary();
    renderHeroBanner();
    renderCurrentRoadmapView();
  }
}

async function resetStudentProgress(userId) {
  if (!confirm('Are you sure you want to reset this student progress to 0%?')) return;
  try {
    const res = await fetch('api/admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_student_progress', user_id: userId })
    });
    const json = await res.json();
    showToast('Admin Action', json.message || 'Progress reset.');
    loadAdminData();
  } catch (err) {
    const target = (AppState.adminStudents || []).find(s => s.user_id === userId);
    if (target) {
      target.completed_skills = 0;
      target.progress_percentage = 0;
    }
    showToast('Admin Action', 'Reset student progress to 0%.');
    renderAdminPortal();
  }
  if (userId === AppState.currentUserId) {
    AppState.skills.forEach(s => s.user_status = 'not_started');
    calculateLocalProgressSummary();
    renderHeroBanner();
    renderCurrentRoadmapView();
  }
}

// ==========================================================
// POMODORO TIMER
// ==========================================================
function setupTimerControls() {
  // Timer setup helper
}

function togglePomodoroTimer() {
  if (AppState.isTimerRunning) {
    clearInterval(AppState.timerInterval);
    AppState.isTimerRunning = false;
  } else {
    AppState.isTimerRunning = true;
    AppState.timerInterval = setInterval(() => {
      if (AppState.timerSecondsLeft > 0) {
        AppState.timerSecondsLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(AppState.timerInterval);
        AppState.isTimerRunning = false;
        showToast('Pomodoro Complete!', 'Great focus session! Take a 5 minute break.');
        updateTimerDisplay();
      }
    }, 1000);
  }
  updateTimerButton();
}

function resetPomodoroTimer() {
  clearInterval(AppState.timerInterval);
  AppState.isTimerRunning = false;
  AppState.timerSecondsLeft = AppState.timerDuration;
  updateTimerDisplay();
  updateTimerButton();
}

function updateTimerDisplay() {
  const el = document.getElementById('pomodoroDisplay');
  if (el) el.textContent = formatTime(AppState.timerSecondsLeft);
}

function updateTimerButton() {
  const btn = document.getElementById('timerToggleBtn');
  if (btn) btn.textContent = AppState.isTimerRunning ? 'Pause' : 'Start Focus';
}

function formatTime(totalSecs) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ==========================================================
// TOAST NOTIFICATIONS & MODALS
// ==========================================================
function showToast(title, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div>
      <div style="font-weight:700;">${title}</div>
      <div style="font-size:0.8rem; color:var(--text-secondary);">${message}</div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function openGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) modal.style.display = 'flex';
}

function closeGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) modal.style.display = 'none';
}

// ==========================================================
// RESOURCES & PROFILE TABS
// ==========================================================
function renderResourcesTab() {
  const container = document.getElementById('tab-resources');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width:960px; margin:0 auto;">
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.5rem; color:#fff;">Curated Learning Resources</h2>
        <p style="color:var(--text-secondary); font-size:0.9rem;">High-yield documentation, video courses, and books for ${AppState.careers.find(c => c.career_id == AppState.activeCareerId)?.career_name || 'all tracks'}</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.25rem;">
        ${AppState.skills.map(s => `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
              <span class="step-stage-badge">${s.resource_type || 'Documentation'}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${s.estimated_hours}h</span>
            </div>
            <h4 style="font-size:1.05rem; color:#fff; margin-bottom:0.35rem;">${s.resource_title || s.skill_name}</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">${s.description}</p>
            <a href="${s.resource_link || '#'}" target="_blank" rel="noopener" class="btn-primary" style="padding:0.45rem 0.9rem; font-size:0.8rem;">
              Open Resource &nearr;
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfileTab() {
  const container = document.getElementById('tab-profile');
  if (!container) return;

  const summary = AppState.progressSummary || { completed_skills: 2, total_skills: 12 };
  const hoursLearned = summary.completed_skills * 25;

  container.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2rem; margin-bottom:1.5rem;">
        <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem;">
          <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; color:#fff;">
            AR
          </div>
          <div>
            <h2 style="font-size:1.4rem; color:#fff;">Alex Rivera</h2>
            <p style="color:var(--text-secondary); font-size:0.85rem;">alex@pathforge.edu • Enrolled in Junior Full-Stack Track</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">
          <div class="stat-box">
            <div class="stat-value">🔥 5</div>
            <div class="stat-label">Day Study Streak</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${hoursLearned} hrs</div>
            <div class="stat-label">Hours Invested</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${summary.completed_skills}</div>
            <div class="stat-label">Milestones Done</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================
// EMBEDDED SEED DATA & OFFLINE RESILIENCE ENGINE
// ==========================================================
const FALLBACK_CAREERS = [
  { career_id: 1, career_slug: 'web-developer', career_name: 'Web Developer', description: 'Build modern responsive websites, scalable web applications, REST APIs, and full-stack cloud platforms.', avg_salary: '$85,000 - $130,000 / yr', difficulty_level: 'Moderate', total_duration_weeks: 24, tagline: 'Craft interactive digital experiences from client to server' },
  { career_id: 2, career_slug: 'data-analyst', career_name: 'Data Analyst', description: 'Transform raw data into business intelligence, actionable statistical insights, predictive trends, and executive dashboards.', avg_salary: '$75,000 - $115,000 / yr', difficulty_level: 'Moderate', total_duration_weeks: 20, tagline: 'Uncover patterns and empower data-driven business decisions' },
  { career_id: 3, career_slug: 'ui-ux-designer', career_name: 'UI/UX Designer', description: 'Design intuitive digital products, conduct user research, master Figma design systems, and craft seamless user journeys.', avg_salary: '$80,000 - $125,000 / yr', difficulty_level: 'Creative / Analytical', total_duration_weeks: 18, tagline: 'Bridge empathy and aesthetics to build products people love' },
  { career_id: 4, career_slug: 'android-developer', career_name: 'Android App Developer', description: 'Engineer native Android mobile applications with Kotlin, Jetpack Compose, Room database, Coroutines, and modern architecture.', avg_salary: '$90,000 - $140,000 / yr', difficulty_level: 'Challenging', total_duration_weeks: 22, tagline: 'Deliver fluid mobile applications to billions of Google Play users' },
  { career_id: 5, career_slug: 'digital-marketing', career_name: 'Digital Marketing Specialist', description: 'Drive customer acquisition, SEO optimization, high-converting ad campaigns, GA4 analytics, and automated growth funnels.', avg_salary: '$65,000 - $105,000 / yr', difficulty_level: 'Strategic / Creative', total_duration_weeks: 16, tagline: 'Scale brand visibility, search rankings, and conversion ROI' }
];

const FALLBACK_SKILLS = {
  1: [
    { skill_id: 101, career_id: 1, step_order: 1, stage_label: 'Fundamentals', skill_name: 'HTML5 & Semantic Markup', description: 'Master document structure, accessibility (WCAG/ARIA), forms, inputs, and semantic document outlines.', estimated_hours: 15, difficulty: 'Beginner', key_topics: 'Semantic Elements, Forms & Validations, Accessibility ARIA, SEO Head Tags', resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', resource_title: 'MDN Web Docs: HTML Learning Journey', resource_type: 'Documentation', user_status: 'completed', checklist: ['Mastered HTML5 doctype and head metadata', 'Built accessible form with field validation', 'Understood semantic document outline'] },
    { skill_id: 102, career_id: 1, step_order: 2, stage_label: 'Fundamentals', skill_name: 'CSS3, Flexbox & Grid Systems', description: 'Build responsive mobile-first layouts using CSS Flexbox, Grid, custom properties, and transitions.', estimated_hours: 25, difficulty: 'Beginner', key_topics: 'Flexbox Axes, CSS Grid Areas, CSS Variables, Responsive Breakpoints', resource_link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', resource_title: 'CSS-Tricks: Complete Guide to Flexbox & Grid', resource_type: 'Article', user_status: 'completed', checklist: ['Built 12-column responsive grid', 'Created dark/light CSS variables theme', 'Applied flexbox alignment for navbars'] },
    { skill_id: 103, career_id: 1, step_order: 3, stage_label: 'Fundamentals', skill_name: 'JavaScript Core & DOM Manipulation', description: 'Master ES6+ syntax, scope, closures, event listeners, DOM querying, async/await, and browser fetch API.', estimated_hours: 45, difficulty: 'Beginner', key_topics: 'ES6 Syntax, DOM Manipulation, Event Loop & Promises, Fetch API & JSON', resource_link: 'https://javascript.info/', resource_title: 'The Modern JavaScript Tutorial', resource_type: 'Interactive', user_status: 'in_progress', checklist: ['Handled DOM events dynamically', 'Managed async data with async/await', 'Built modular ES6 classes/functions'] },
    { skill_id: 104, career_id: 1, step_order: 4, stage_label: 'Fundamentals', skill_name: 'Git & GitHub Version Control', description: 'Understand branching, pull requests, merge conflict resolution, conventional commits, and team collaboration.', estimated_hours: 15, difficulty: 'Beginner', key_topics: 'Git Init/Commit/Push, Branching & Merging, Pull Requests, Rebase & Stash', resource_link: 'https://git-scm.com/book/en/v2', resource_title: 'Pro Git Official Book', resource_type: 'Book', user_status: 'not_started', checklist: ['Initialized Git repos and branches', 'Resolved a manual merge conflict', 'Created GitHub Pull Requests with reviews'] },
    { skill_id: 105, career_id: 1, step_order: 5, stage_label: 'Intermediate', skill_name: 'React.js & Component Architecture', description: 'Build single-page apps using React components, hooks (useState, useEffect, useMemo), and state lifting.', estimated_hours: 50, difficulty: 'Intermediate', key_topics: 'JSX & Virtual DOM, Custom Hooks, Props & State Management, Component Composition', resource_link: 'https://react.dev/learn', resource_title: 'Official React Documentation', resource_type: 'Interactive', user_status: 'not_started', checklist: ['Created modular reusable components', 'Handled lifecycle with useEffect hooks', 'Lifted state across multiple sibling components'] },
    { skill_id: 106, career_id: 1, step_order: 6, stage_label: 'Intermediate', skill_name: 'Node.js & Express RESTful APIs', description: 'Create server-side HTTP microservices, route handling, middleware integration, and request validations.', estimated_hours: 35, difficulty: 'Intermediate', key_topics: 'Express Routing, Middleware Pipeline, RESTful Conventions, CORS & Body Parsing', resource_link: 'https://expressjs.com/', resource_title: 'Express.js Guide', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Built REST endpoints with GET/POST/PUT/DELETE', 'Implemented auth middleware validation', 'Structured MVC controller layers'] },
    { skill_id: 107, career_id: 1, step_order: 7, stage_label: 'Intermediate', skill_name: 'Relational Databases (MySQL / PostgreSQL)', description: 'Design normalized relational schemas, write parameterized SQL queries, indexing, and joins.', estimated_hours: 30, difficulty: 'Intermediate', key_topics: 'Third Normal Form (3NF), Inner & Left Joins, Foreign Keys & Cascades, Query Indexing', resource_link: 'https://www.mysqltutorial.org/', resource_title: 'MySQL Tutorial & 3NF Design', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Constructed 3NF normalized schema', 'Wrote complex JOIN aggregations', 'Configured foreign key constraints & indexes'] },
    { skill_id: 108, career_id: 1, step_order: 8, stage_label: 'Intermediate', skill_name: 'Authentication, JWT & Web Security', description: 'Implement secure user registration, bcrypt password hashing, session tokens, JWTs, and OWASP defenses.', estimated_hours: 25, difficulty: 'Intermediate', key_topics: 'Bcrypt Hashing, JWT Tokens & Cookies, CORS & CSRF Defenses, SQL Injection Prevention', resource_link: 'https://cheatsheetseries.owasp.org/', resource_title: 'OWASP Web Security & Auth', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Used bcrypt for password salting', 'Implemented JWT refresh & access tokens', 'Protected routes from unauthorized requests'] },
    { skill_id: 109, career_id: 1, step_order: 9, stage_label: 'Advanced', skill_name: 'TypeScript & Type-Safe Engineering', description: 'Strengthen codebases with interfaces, generics, union types, and strict static type checks.', estimated_hours: 30, difficulty: 'Advanced', key_topics: 'Type Annotations & Interfaces, Generics, Union & Intersection Types, Strict Mode', resource_link: 'https://www.typescriptlang.org/docs/', resource_title: 'TypeScript Official Handbook', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Typed complex API payloads', 'Used generics for reusable utility functions', 'Eliminated any types in strict mode'] },
    { skill_id: 110, career_id: 1, step_order: 10, stage_label: 'Advanced', skill_name: 'Full-Stack Performance & Core Web Vitals', description: 'Optimize bundle size, code splitting, lazy loading, database caching, and Core Web Vitals.', estimated_hours: 20, difficulty: 'Advanced', key_topics: 'Lighthouse 100/100, Image Compression, Code Splitting, Redis Caching', resource_link: 'https://web.dev/learn/performance', resource_title: 'web.dev Performance', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Achieved >90 Lighthouse score', 'Implemented asset lazy loading', 'Configured response caching'] },
    { skill_id: 111, career_id: 1, step_order: 11, stage_label: 'Advanced', skill_name: 'Docker, CI/CD & Cloud Deployment', description: 'Containerize applications, configure Dockerfiles, set up GitHub Actions CI/CD pipelines, and deploy.', estimated_hours: 25, difficulty: 'Advanced', key_topics: 'Dockerfile & Docker Compose, GitHub Actions Pipelines, Reverse Proxy Nginx, Cloud Hosting', resource_link: 'https://docs.docker.com/get-started/', resource_title: 'Docker Getting Started Guide', resource_type: 'Documentation', user_status: 'not_started', checklist: ['Wrote multi-stage production Dockerfile', 'Automated testing in GitHub Actions', 'Deployed containerized service to cloud'] },
    { skill_id: 112, career_id: 1, step_order: 12, stage_label: 'Advanced', skill_name: 'System Design & Scalable Architecture', description: 'Design distributed systems, load balancing, horizontal scaling, caching layers, and message queues.', estimated_hours: 35, difficulty: 'Advanced', key_topics: 'Load Balancers & Proxies, Database Sharding, Caching with Redis, Message Queues', resource_link: 'https://github.com/donnemartin/system-design-primer', resource_title: 'System Design Primer', resource_type: 'Book', user_status: 'not_started', checklist: ['Architected distributed system diagram', 'Selected right caching strategy', 'Calculated throughput and storage limits'] }
  ],
  2: [
    { skill_id: 201, career_id: 2, step_order: 1, stage_label: 'Fundamentals', skill_name: 'Advanced Excel & Google Sheets Analytics', description: 'Master XLOOKUP, INDEX/MATCH, Pivot Tables, and dynamic data cleansing.', estimated_hours: 20, difficulty: 'Beginner', key_topics: 'XLOOKUP, Pivot Tables, Conditional Formatting, Data Cleansing', user_status: 'completed' },
    { skill_id: 202, career_id: 2, step_order: 2, stage_label: 'Fundamentals', skill_name: 'SQL Querying & Relational Databases', description: 'Write complex SELECT queries, WHERE filters, GROUP BY aggregations, and JOINs.', estimated_hours: 30, difficulty: 'Beginner', key_topics: 'SELECT & WHERE, GROUP BY & HAVING, INNER/LEFT JOINs', user_status: 'completed' },
    { skill_id: 203, career_id: 2, step_order: 3, stage_label: 'Fundamentals', skill_name: 'Descriptive Statistics & Probability', description: 'Understand mean, variance, normal distribution, z-scores, and probability.', estimated_hours: 25, difficulty: 'Beginner', key_topics: 'Mean/Median/Mode, Standard Deviation, Probability Distributions', user_status: 'in_progress' },
    { skill_id: 204, career_id: 2, step_order: 4, stage_label: 'Fundamentals', skill_name: 'Python Foundations for Data Analysis', description: 'Learn Python data structures, list comprehensions, functions, and file I/O.', estimated_hours: 30, difficulty: 'Beginner', key_topics: 'Python Syntax, Dictionaries & Lists, Functions, File Handling', user_status: 'not_started' },
    { skill_id: 205, career_id: 2, step_order: 5, stage_label: 'Intermediate', skill_name: 'Data Manipulation with Pandas & NumPy', description: 'Master DataFrames, missing value handling, group-by logic, and vectorization.', estimated_hours: 40, difficulty: 'Intermediate', key_topics: 'DataFrames, Handling Nulls, GroupBy Aggregations', user_status: 'not_started' },
    { skill_id: 206, career_id: 2, step_order: 6, stage_label: 'Intermediate', skill_name: 'Exploratory Data Analysis (EDA)', description: 'Identify outliers, calculate correlations, and formulate hypothesis tests.', estimated_hours: 25, difficulty: 'Intermediate', key_topics: 'Correlation Matrices, Boxplot Outliers, Feature Engineering', user_status: 'not_started' },
    { skill_id: 207, career_id: 2, step_order: 7, stage_label: 'Intermediate', skill_name: 'Data Visualization (Matplotlib & Seaborn)', description: 'Craft publication-ready statistical plots, heatmaps, and pairplots.', estimated_hours: 25, difficulty: 'Intermediate', key_topics: 'Bar Charts, Scatter Plots, Heatmaps, Color Palettes', user_status: 'not_started' },
    { skill_id: 208, career_id: 2, step_order: 8, stage_label: 'Intermediate', skill_name: 'BI Dashboards (Power BI / Tableau)', description: 'Connect disparate sources, design interactive executive dashboards, and DAX measures.', estimated_hours: 35, difficulty: 'Intermediate', key_topics: 'DAX Measures, Star Schema Modeling, Interactive Filters', user_status: 'not_started' },
    { skill_id: 209, career_id: 2, step_order: 9, stage_label: 'Advanced', skill_name: 'Time Series Forecasting & Trends', description: 'Decompose seasonal trends, moving averages, and forecast metrics.', estimated_hours: 30, difficulty: 'Advanced', key_topics: 'Moving Averages, Seasonality Decomposition, ARIMA Foundations', user_status: 'not_started' },
    { skill_id: 210, career_id: 2, step_order: 10, stage_label: 'Advanced', skill_name: 'Data Storytelling & Executive Presentation', description: 'Translate complex numbers into clear business recommendations.', estimated_hours: 20, difficulty: 'Advanced', key_topics: 'Clutter Reduction, Color Focus, Audience Framing', user_status: 'not_started' }
  ],
  3: [
    { skill_id: 301, career_id: 3, step_order: 1, stage_label: 'Fundamentals', skill_name: 'Design Thinking & Human-Centered UX', description: 'Learn empathy mapping, user personas, problem definition, and iterative discovery.', estimated_hours: 20, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 302, career_id: 3, step_order: 2, stage_label: 'Fundamentals', skill_name: 'Information Architecture & Wireframing', description: 'Structure site trees, user flows, and low-fidelity wireframes.', estimated_hours: 25, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 303, career_id: 3, step_order: 3, stage_label: 'Fundamentals', skill_name: 'Figma Mastery: Auto Layout & Components', description: 'Harness Figma components, variants, Auto Layout, constraints, and styles.', estimated_hours: 35, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 304, career_id: 3, step_order: 4, stage_label: 'Fundamentals', skill_name: 'Visual Design Principles & Typography', description: 'Master contrast, typographic hierarchy, 8pt spatial grid, and color harmony.', estimated_hours: 25, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 305, career_id: 3, step_order: 5, stage_label: 'Intermediate', skill_name: 'Interactive Prototyping & Micro-Interactions', description: 'Craft clickable prototypes with smart animations and gesture flows.', estimated_hours: 30, difficulty: 'Intermediate', user_status: 'not_started' },
    { skill_id: 306, career_id: 3, step_order: 6, stage_label: 'Intermediate', skill_name: 'Scalable Design Systems Architecture', description: 'Build tokenized design systems with buttons, modals, badges, and guidelines.', estimated_hours: 35, difficulty: 'Intermediate', user_status: 'not_started' }
  ],
  4: [
    { skill_id: 401, career_id: 4, step_order: 1, stage_label: 'Fundamentals', skill_name: 'Kotlin Programming Foundations', description: 'Master Kotlin syntax, null safety, data classes, lambdas, and extension functions.', estimated_hours: 30, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 402, career_id: 4, step_order: 2, stage_label: 'Fundamentals', skill_name: 'Android Studio & Project Structure', description: 'Navigate Android Studio, Gradle dependencies, manifests, and activity lifecycles.', estimated_hours: 20, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 403, career_id: 4, step_order: 3, stage_label: 'Fundamentals', skill_name: 'Modern UI with Jetpack Compose', description: 'Build declarative reactive UI layouts with Compose Composables and state.', estimated_hours: 40, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 404, career_id: 4, step_order: 4, stage_label: 'Intermediate', skill_name: 'Kotlin Coroutines & Flow', description: 'Handle background threads, network calls, and reactive state streams with Flow.', estimated_hours: 35, difficulty: 'Intermediate', user_status: 'not_started' },
    { skill_id: 405, career_id: 4, step_order: 5, stage_label: 'Intermediate', skill_name: 'Local Persistence with Room Database', description: 'Store structured offline data using Room ORM entities, DAOs, and migrations.', estimated_hours: 30, difficulty: 'Intermediate', user_status: 'not_started' }
  ],
  5: [
    { skill_id: 501, career_id: 5, step_order: 1, stage_label: 'Fundamentals', skill_name: 'Marketing Fundamentals & Customer Funnels', description: 'Understand TOFU/MOFU/BOFU funnels, buyer personas, value propositions, and customer journeys.', estimated_hours: 15, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 502, career_id: 5, step_order: 2, stage_label: 'Fundamentals', skill_name: 'Search Engine Optimization (SEO)', description: 'Master on-page SEO, technical audits, keyword research, meta tags, and internal linking.', estimated_hours: 30, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 503, career_id: 5, step_order: 3, stage_label: 'Fundamentals', skill_name: 'Content Strategy & Copywriting', description: 'Write high-converting headlines, email sequences, blog strategies, and persuasive CTAs.', estimated_hours: 20, difficulty: 'Beginner', user_status: 'not_started' },
    { skill_id: 504, career_id: 5, step_order: 4, stage_label: 'Intermediate', skill_name: 'Google Analytics 4 (GA4) & Tracking', description: 'Set up GA4 events, conversion funnels, custom dimensions, and Google Tag Manager.', estimated_hours: 30, difficulty: 'Intermediate', user_status: 'not_started' }
  ]
};

const FALLBACK_QUIZZES = {
  1: [
    { quiz_id: 1, career_id: 1, question: 'Which HTML5 element is most semantically appropriate for self-contained, independently distributable content like a blog post or news item?', options: ['<div>', '<article>', '<section>', '<aside>'], correct_index: 1, associated_skill_id: 101, topic: 'Semantic HTML' },
    { quiz_id: 2, career_id: 1, question: 'In modern CSS Flexbox, which property aligns flex items along the cross axis (perpendicular to flex-direction)?', options: ['justify-content', 'align-items', 'flex-wrap', 'place-content'], correct_index: 1, associated_skill_id: 102, topic: 'CSS Flexbox' },
    { quiz_id: 3, career_id: 1, question: 'What is the key advantage of JavaScript `async/await` over raw nested Promise chains?', options: ['It makes code synchronous on the main thread', 'It allows writing async logic with sequential try/catch readability', 'It eliminates the event loop', 'It automatically caches network requests'], correct_index: 1, associated_skill_id: 103, topic: 'Asynchronous JS' },
    { quiz_id: 4, career_id: 1, question: 'In a React functional component, what happens when an empty dependency array `[]` is passed to `useEffect`?', options: ['The effect runs on every render', 'The effect runs only once after initial mount', 'The effect never executes', 'It throws a runtime error'], correct_index: 1, associated_skill_id: 105, topic: 'React Hooks' },
    { quiz_id: 5, career_id: 1, question: 'Which HTTP method and status code are standard for creating a new resource in a RESTful API?', options: ['GET with 200 OK', 'POST with 201 Created', 'PUT with 204 No Content', 'PATCH with 301 Moved'], correct_index: 1, associated_skill_id: 106, topic: 'REST Architecture' }
  ],
  2: [
    { quiz_id: 6, career_id: 2, question: 'Why is XLOOKUP preferred over legacy VLOOKUP in modern Excel and Google Sheets?', options: ['It only works for numbers', 'It searches in any direction, defaults to exact match, and does not require column indexes', 'It runs 100x slower', 'It requires third-party plugins'], correct_index: 1, associated_skill_id: 201, topic: 'Spreadsheet Analytics' },
    { quiz_id: 7, career_id: 2, question: 'In SQL, which clause filters aggregated results produced by a `GROUP BY` statement?', options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'], correct_index: 1, associated_skill_id: 202, topic: 'SQL Aggregations' },
    { quiz_id: 8, career_id: 2, question: 'In Python Pandas, which method is most effective for replacing NaN values with the column mean?', options: ['df.drop()', 'df.fillna(df.mean())', 'df.replace_nulls()', 'df.clean()'], correct_index: 1, associated_skill_id: 205, topic: 'Data Cleansing' }
  ]
};

const FALLBACK_STUDENTS = [
  { user_id: 1, username: 'alex_student', full_name: 'Alex Rivera', email: 'alex@pathforge.edu', career_name: 'Web Developer', study_streak_days: 5, completed_skills: 2, total_career_skills: 12, progress_percentage: 17, target_goal: 'Junior Full-Stack Web Developer' },
  { user_id: 2, username: 'priya_sharma', full_name: 'Priya Sharma', email: 'priya@pathforge.edu', career_name: 'Data Analyst', study_streak_days: 12, completed_skills: 8, total_career_skills: 10, progress_percentage: 80, target_goal: 'FinTech Data Analyst' },
  { user_id: 3, username: 'david_kim', full_name: 'David Kim', email: 'david@pathforge.edu', career_name: 'UI/UX Designer', study_streak_days: 3, completed_skills: 3, total_career_skills: 6, progress_percentage: 50, target_goal: 'Product UI/UX Designer' }
];

function loadFallbackData() {
  AppState.careers = FALLBACK_CAREERS;
  populateCareerSwitcher();
  loadFallbackSkills(AppState.activeCareerId);
  calculateLocalProgressSummary();
}

function loadFallbackSkills(careerId) {
  const baseSkills = FALLBACK_SKILLS[careerId] || FALLBACK_SKILLS[1];
  AppState.skills = baseSkills.map(s => {
    const savedStatus = getLocalSkillStatus(s.skill_id);
    return {
      ...s,
      user_status: savedStatus || s.user_status || 'not_started'
    };
  });
  if (!AppState.focusedSkillId && AppState.skills.length > 0) {
    AppState.focusedSkillId = AppState.skills[0].skill_id;
  }
}

function saveLocalSkillStatus(skillId, status) {
  try {
    localStorage.setItem(`pathforge_skill_${skillId}`, status);
  } catch (e) {}
}

function getLocalSkillStatus(skillId) {
  try {
    return localStorage.getItem(`pathforge_skill_${skillId}`);
  } catch (e) {
    return null;
  }
}

// Fallback handlers for quiz and admin
function loadFallbackQuiz() {
  AppState.quizQuestions = FALLBACK_QUIZZES[AppState.activeCareerId] || FALLBACK_QUIZZES[1];
  AppState.quizAnswers = {};
  renderDiagnosticQuiz();
}

function evaluateFallbackQuiz() {
  const questions = AppState.quizQuestions;
  let correctCount = 0;
  const mastered = [];
  const toStudy = [];

  questions.forEach(q => {
    const selected = AppState.quizAnswers[q.quiz_id];
    if (selected !== undefined && selected === q.correct_index) {
      correctCount++;
      if (q.associated_skill_id) {
        updateSkillStatus(q.associated_skill_id, 'completed');
        mastered.push(q.topic || 'Skill Node');
      }
    } else {
      toStudy.push(q.topic || 'Skill Node');
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  let placement = 'Fundamentals Foundation Track';
  if (percentage >= 80) placement = 'Accelerated Advanced Track';
  else if (percentage >= 50) placement = 'Intermediate Workbench Track';

  renderQuizResult({
    score_percentage: percentage,
    placement: placement,
    skills_mastered: mastered,
    skills_to_study: toStudy
  });
}

function loadFallbackAdmin() {
  AppState.adminStats = { total_students: 3, total_careers: 5, total_skills: 48, total_completions: 14 };
  AppState.adminStudents = FALLBACK_STUDENTS;
  renderAdminPortal();
}
