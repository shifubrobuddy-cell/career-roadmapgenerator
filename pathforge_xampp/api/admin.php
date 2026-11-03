<?php
/**
 * PathForge - Admin & Instructor Management API
 * Provides student roster tracking, academic defense analytics, and curriculum administration
 * Path: api/admin.php
 */

require_once __DIR__ . '/db_connect.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

// ==========================================================
// GET: System Stats and Student Roster
// ==========================================================
if ($method === 'GET') {
    // 1. System counts
    $stats = [
        'total_students' => (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn(),
        'total_careers' => (int)$pdo->query("SELECT COUNT(*) FROM careers")->fetchColumn(),
        'total_skills' => (int)$pdo->query("SELECT COUNT(*) FROM skill_paths")->fetchColumn(),
        'total_completions' => (int)$pdo->query("SELECT COUNT(*) FROM user_progress WHERE status = 'completed'")->fetchColumn(),
    ];

    // 2. Student Roster with progress details
    $rosterQuery = "
        SELECT 
            u.user_id,
            u.username,
            u.full_name,
            u.email,
            u.target_goal,
            u.study_streak_days,
            u.active_career_id,
            u.created_at as enrolled_at,
            c.career_name,
            COUNT(DISTINCT s.skill_id) AS total_career_skills,
            SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed_skills,
            SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_skills
        FROM users u
        LEFT JOIN careers c ON u.active_career_id = c.career_id
        LEFT JOIN skill_paths s ON c.career_id = s.career_id
        LEFT JOIN user_progress p ON u.user_id = p.user_id AND s.skill_id = p.skill_id
        WHERE u.role = 'student'
        GROUP BY u.user_id, c.career_id
        ORDER BY u.user_id ASC
    ";

    $students = $pdo->query($rosterQuery)->fetchAll();

    foreach ($students as &$s) {
        $tot = (int)$s['total_career_skills'];
        $comp = (int)$s['completed_skills'];
        $s['progress_percentage'] = $tot > 0 ? round(($comp / $tot) * 100) : 0;
    }

    sendJsonResponse([
        'status' => 'success',
        'stats' => $stats,
        'students' => $students
    ]);
}

// ==========================================================
// POST: Student and System Admin Actions
// ==========================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = sanitize($input['action'] ?? '');
    $target_user_id = (int)($input['user_id'] ?? 0);

    if ($action === 'reset_student_progress') {
        if ($target_user_id <= 0) {
            sendJsonResponse(['status' => 'error', 'message' => 'Invalid user ID'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM user_progress WHERE user_id = :uid");
        $stmt->execute(['uid' => $target_user_id]);

        sendJsonResponse(['status' => 'success', 'message' => "Progress for student #{$target_user_id} was reset to 0%."]);
    }

    if ($action === 'grant_student_mastery') {
        if ($target_user_id <= 0) {
            sendJsonResponse(['status' => 'error', 'message' => 'Invalid user ID'], 400);
        }

        // Find active career for this student
        $userStmt = $pdo->prepare("SELECT active_career_id FROM users WHERE user_id = :uid");
        $userStmt->execute(['uid' => $target_user_id]);
        $careerId = (int)$userStmt->fetchColumn();

        if (!$careerId) $careerId = 1;

        // Fetch all skill IDs
        $sStmt = $pdo->prepare("SELECT skill_id FROM skill_paths WHERE career_id = :cid");
        $sStmt->execute(['cid' => $careerId]);
        $skillIds = $sStmt->fetchAll(PDO::FETCH_COLUMN);

        $upsert = $pdo->prepare("
            INSERT INTO user_progress (user_id, career_id, skill_id, status, confidence_rating, notes)
            VALUES (:uid, :cid, :sid, 'completed', 5, 'Mastery granted by administrator')
            ON DUPLICATE KEY UPDATE status = 'completed', confidence_rating = 5
        ");

        foreach ($skillIds as $sid) {
            $upsert->execute(['uid' => $target_user_id, 'cid' => $careerId, 'sid' => $sid]);
        }

        sendJsonResponse(['status' => 'success', 'message' => "Full 100% mastery granted to student #{$target_user_id}."]);
    }

    sendJsonResponse(['status' => 'error', 'message' => 'Unknown admin action'], 400);
}

sendJsonResponse(['status' => 'error', 'message' => 'Method not supported'], 405);
