<?php
/**
 * PathForge - User Progress API Endpoint
 * Handles Skill Status updates, confidence scoring, notes, and metrics
 * Path: api/progress.php
 */

require_once __DIR__ . '/db_connect.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

// ==========================================================
// GET: User Progress Summary for a Career
// ==========================================================
if ($method === 'GET') {
    $user_id = (int)($_GET['user_id'] ?? 1);
    $career_id = (int)($_GET['career_id'] ?? 1);

    // 1. Fetch total skills for this career
    $totalSkillsStmt = $pdo->prepare("SELECT COUNT(*) FROM skill_paths WHERE career_id = :cid");
    $totalSkillsStmt->execute(['cid' => $career_id]);
    $totalSkills = (int)$totalSkillsStmt->fetchColumn();

    // 2. Fetch completed, in_progress, not_started counts
    $progressCountsStmt = $pdo->prepare("
        SELECT 
            status, 
            COUNT(*) as count 
        FROM user_progress 
        WHERE user_id = :uid AND career_id = :cid 
        GROUP BY status
    ");
    $progressCountsStmt->execute(['uid' => $user_id, 'cid' => $career_id]);
    $rawCounts = $progressCountsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $completedCount = (int)($rawCounts['completed'] ?? 0);
    $inProgressCount = (int)($rawCounts['in_progress'] ?? 0);
    $notStartedCount = $totalSkills - ($completedCount + $inProgressCount);
    if ($notStartedCount < 0) $notStartedCount = 0;

    $completionPercentage = $totalSkills > 0 ? round(($completedCount / $totalSkills) * 100) : 0;

    // 3. Find next recommended skill (first not completed)
    $nextSkillStmt = $pdo->prepare("
        SELECT s.* 
        FROM skill_paths s
        LEFT JOIN user_progress p 
            ON s.skill_id = p.skill_id 
            AND p.user_id = :uid 
            AND p.career_id = :cid
        WHERE s.career_id = :cid_param 
          AND (p.status IS NULL OR p.status != 'completed')
        ORDER BY s.step_order ASC
        LIMIT 1
    ");
    $nextSkillStmt->execute([
        'uid' => $user_id,
        'cid' => $career_id,
        'cid_param' => $career_id
    ]);
    $nextSkill = $nextSkillStmt->fetch();

    // 4. Determine current stage based on incomplete skills
    $currentStage = 'Fundamentals';
    if ($nextSkill && !empty($nextSkill['stage_label'])) {
        $currentStage = $nextSkill['stage_label'];
    } elseif ($totalSkills > 0 && $completedCount === $totalSkills) {
        $currentStage = 'Career Ready / Mastered';
    }

    sendJsonResponse([
        'status' => 'success',
        'data' => [
            'user_id' => $user_id,
            'career_id' => $career_id,
            'total_skills' => $totalSkills,
            'completed_skills' => $completedCount,
            'in_progress_skills' => $inProgressCount,
            'not_started_skills' => $notStartedCount,
            'completion_percentage' => $completionPercentage,
            'current_stage' => $currentStage,
            'next_recommended_skill' => $nextSkill ?: null
        ]
    ]);
}

// ==========================================================
// POST / PUT: Update Skill Status, Confidence, or Notes
// ==========================================================
if ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $action = $input['action'] ?? 'update_status';
    $user_id = (int)($input['user_id'] ?? 1);
    $career_id = (int)($input['career_id'] ?? 1);

    // Handle Bulk Action: Reset Progress
    if ($action === 'reset_career') {
        $stmt = $pdo->prepare("DELETE FROM user_progress WHERE user_id = :uid AND career_id = :cid");
        $stmt->execute(['uid' => $user_id, 'cid' => $career_id]);

        sendJsonResponse(['status' => 'success', 'message' => 'Progress reset to zero for this career track.']);
    }

    // Handle Bulk Action: Grant Full Mastery
    if ($action === 'grant_mastery') {
        $skillsStmt = $pdo->prepare("SELECT skill_id FROM skill_paths WHERE career_id = :cid");
        $skillsStmt->execute(['cid' => $career_id]);
        $allSkills = $skillsStmt->fetchAll(PDO::FETCH_COLUMN);

        $upsertStmt = $pdo->prepare("
            INSERT INTO user_progress (user_id, career_id, skill_id, status, confidence_rating, notes)
            VALUES (:uid, :cid, :sid, 'completed', 5, 'Mastery granted via Academic / Admin fast-track')
            ON DUPLICATE KEY UPDATE status = 'completed', confidence_rating = 5
        ");

        foreach ($allSkills as $sid) {
            $upsertStmt->execute(['uid' => $user_id, 'cid' => $career_id, 'sid' => $sid]);
        }

        sendJsonResponse(['status' => 'success', 'message' => 'All milestones marked as Completed (100% Mastery).']);
    }

    // Default Action: Update single skill progress
    $skill_id = (int)($input['skill_id'] ?? 0);
    $status = sanitize($input['status'] ?? 'in_progress');
    $confidence = (int)($input['confidence_rating'] ?? 3);
    $notes = sanitize($input['notes'] ?? '');

    if ($skill_id <= 0) {
        sendJsonResponse(['status' => 'error', 'message' => 'Valid skill_id is required'], 400);
    }

    if (!in_array($status, ['not_started', 'in_progress', 'completed'])) {
        $status = 'in_progress';
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO user_progress (user_id, career_id, skill_id, status, confidence_rating, notes)
            VALUES (:uid, :cid, :sid, :status, :confidence, :notes)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                confidence_rating = VALUES(confidence_rating),
                notes = CASE WHEN VALUES(notes) != '' THEN VALUES(notes) ELSE notes END,
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([
            'uid' => $user_id,
            'cid' => $career_id,
            'sid' => $skill_id,
            'status' => $status,
            'confidence' => $confidence,
            'notes' => $notes
        ]);

        sendJsonResponse([
            'status' => 'success',
            'message' => 'Progress updated.',
            'skill_id' => $skill_id,
            'new_status' => $status
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendJsonResponse(['status' => 'error', 'message' => 'Method not supported'], 405);
