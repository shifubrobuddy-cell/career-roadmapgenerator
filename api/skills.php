<?php
/**
 * PathForge - Skills / Milestones API Endpoint
 * Handles CRUD operations for Roadmap Skills and Milestones
 * Path: api/skills.php
 */

require_once __DIR__ . '/db_connect.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

// ==========================================================
// GET: Retrieve Skills by Career ID or Skill ID
// ==========================================================
if ($method === 'GET') {
    if (isset($_GET['skill_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM skill_paths WHERE skill_id = :id");
        $stmt->execute(['id' => (int)$_GET['skill_id']]);
        $skill = $stmt->fetch();
        if (!$skill) {
            sendJsonResponse(['status' => 'error', 'message' => 'Skill not found'], 404);
        }
        sendJsonResponse(['status' => 'success', 'data' => $skill]);
    }

    $career_id = (int)($_GET['career_id'] ?? 1);

    // Fetch skills with current user's progress if user_id is provided
    $user_id = (int)($_GET['user_id'] ?? 1);

    $query = "
        SELECT 
            s.*,
            COALESCE(p.status, 'not_started') AS user_status,
            COALESCE(p.confidence_rating, 3) AS confidence_rating,
            COALESCE(p.notes, '') AS notes,
            p.updated_at AS last_updated
        FROM skill_paths s
        LEFT JOIN user_progress p 
            ON s.skill_id = p.skill_id 
            AND p.user_id = :user_id 
            AND p.career_id = :career_id
        WHERE s.career_id = :career_id_param
        ORDER BY s.step_order ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([
        'user_id' => $user_id,
        'career_id' => $career_id,
        'career_id_param' => $career_id
    ]);
    $skills = $stmt->fetchAll();

    // Decode checklist_json if present
    foreach ($skills as &$skill) {
        if (!empty($skill['checklist_json'])) {
            $skill['checklist'] = json_decode($skill['checklist_json'], true);
        } else {
            $skill['checklist'] = [
                'Complete core concepts and theory',
                'Build hands-on practical implementation',
                'Pass milestone self-assessment'
            ];
        }
    }

    sendJsonResponse(['status' => 'success', 'data' => $skills]);
}

// ==========================================================
// POST: Add a New Skill Milestone (Admin)
// ==========================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $career_id = (int)($input['career_id'] ?? 1);
    $skill_name = sanitize($input['skill_name'] ?? '');
    $stage_label = sanitize($input['stage_label'] ?? 'Fundamentals');
    $step_order = (int)($input['step_order'] ?? 1);
    $estimated_hours = (int)($input['estimated_hours'] ?? 20);
    $difficulty = sanitize($input['difficulty'] ?? 'Beginner');
    $resource_title = sanitize($input['resource_title'] ?? 'Official Documentation');
    $resource_link = sanitize($input['resource_link'] ?? 'https://developer.mozilla.org');
    $resource_type = sanitize($input['resource_type'] ?? 'Documentation');
    $description = sanitize($input['description'] ?? '');
    $key_topics = sanitize($input['key_topics'] ?? 'Fundamentals, Practical Examples');
    $mini_project_title = sanitize($input['mini_project_title'] ?? 'Milestone Project');
    $mini_project_desc = sanitize($input['mini_project_desc'] ?? 'Build a practical deliverable showcasing this skill.');

    if (empty($skill_name)) {
        sendJsonResponse(['status' => 'error', 'message' => 'Skill name is required'], 400);
    }

    // Auto-calculate step_order if not provided
    if ($step_order <= 0) {
        $orderStmt = $pdo->prepare("SELECT COALESCE(MAX(step_order), 0) + 1 FROM skill_paths WHERE career_id = :cid");
        $orderStmt->execute(['cid' => $career_id]);
        $step_order = (int)$orderStmt->fetchColumn();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO skill_paths 
            (career_id, step_order, stage_label, skill_name, description, resource_link, resource_title, resource_type, estimated_hours, difficulty, key_topics, mini_project_title, mini_project_desc)
            VALUES 
            (:cid, :step, :stage, :name, :description, :link, :title, :type, :hours, :diff, :topics, :proj_title, :proj_desc)
        ");
        $stmt->execute([
            'cid' => $career_id,
            'step' => $step_order,
            'stage' => $stage_label,
            'name' => $skill_name,
            'description' => $description,
            'link' => $resource_link,
            'title' => $resource_title,
            'type' => $resource_type,
            'hours' => $estimated_hours,
            'diff' => $difficulty,
            'topics' => $key_topics,
            'proj_title' => $mini_project_title,
            'proj_desc' => $mini_project_desc
        ]);

        $newSkillId = (int)$pdo->lastInsertId();
        sendJsonResponse([
            'status' => 'success',
            'message' => 'Skill milestone created successfully.',
            'skill_id' => $newSkillId
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// ==========================================================
// PUT: Update an Existing Skill Milestone (Admin)
// ==========================================================
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $skill_id = (int)($input['skill_id'] ?? 0);

    if ($skill_id <= 0) {
        sendJsonResponse(['status' => 'error', 'message' => 'Valid skill_id is required'], 400);
    }

    $skill_name = sanitize($input['skill_name'] ?? '');
    $stage_label = sanitize($input['stage_label'] ?? 'Fundamentals');
    $step_order = (int)($input['step_order'] ?? 1);
    $estimated_hours = (int)($input['estimated_hours'] ?? 20);
    $difficulty = sanitize($input['difficulty'] ?? 'Beginner');
    $resource_title = sanitize($input['resource_title'] ?? '');
    $resource_link = sanitize($input['resource_link'] ?? '');
    $resource_type = sanitize($input['resource_type'] ?? 'Documentation');
    $description = sanitize($input['description'] ?? '');
    $key_topics = sanitize($input['key_topics'] ?? '');

    try {
        $stmt = $pdo->prepare("
            UPDATE skill_paths SET 
                skill_name = :name,
                stage_label = :stage,
                step_order = :step,
                estimated_hours = :hours,
                difficulty = :diff,
                resource_title = :title,
                resource_link = :link,
                resource_type = :type,
                description = :description,
                key_topics = :topics
            WHERE skill_id = :id
        ");
        $stmt->execute([
            'name' => $skill_name,
            'stage' => $stage_label,
            'step' => $step_order,
            'hours' => $estimated_hours,
            'diff' => $difficulty,
            'title' => $resource_title,
            'link' => $resource_link,
            'type' => $resource_type,
            'description' => $description,
            'topics' => $key_topics,
            'id' => $skill_id
        ]);

        sendJsonResponse(['status' => 'success', 'message' => 'Skill milestone updated successfully.']);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// ==========================================================
// DELETE: Delete a Skill Milestone (Admin)
// ==========================================================
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $skill_id = (int)($input['skill_id'] ?? ($_GET['id'] ?? 0));

    if ($skill_id <= 0) {
        sendJsonResponse(['status' => 'error', 'message' => 'Valid skill_id required'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM skill_paths WHERE skill_id = :id");
        $stmt->execute(['id' => $skill_id]);

        sendJsonResponse(['status' => 'success', 'message' => 'Skill milestone deleted successfully.']);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendJsonResponse(['status' => 'error', 'message' => 'Method not supported'], 405);
