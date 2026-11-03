<?php
/**
 * PathForge - Careers API Endpoint
 * Handles GET, POST, PUT, DELETE operations for Career Tracks
 * Path: api/careers.php
 */

require_once __DIR__ . '/db_connect.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request
if ($method === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

// ==========================================================
// GET: Retrieve All Careers or a Specific Career
// ==========================================================
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM careers WHERE career_id = :id");
        $stmt->execute(['id' => (int)$_GET['id']]);
        $career = $stmt->fetch();
        if (!$career) {
            sendJsonResponse(['status' => 'error', 'message' => 'Career not found'], 404);
        }
        sendJsonResponse(['status' => 'success', 'data' => $career]);
    } else {
        // Fetch all careers with skill count and estimated total weeks
        $query = "
            SELECT 
                c.*, 
                COUNT(s.skill_id) AS total_skills,
                COALESCE(SUM(s.estimated_hours), 0) AS total_curriculum_hours
            FROM careers c
            LEFT JOIN skill_paths s ON c.career_id = s.career_id
            GROUP BY c.career_id
            ORDER BY c.career_id ASC
        ";
        $stmt = $pdo->query($query);
        $careers = $stmt->fetchAll();
        sendJsonResponse(['status' => 'success', 'data' => $careers]);
    }
}

// ==========================================================
// POST: Create a New Career Track (Admin)
// ==========================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $career_name = sanitize($input['career_name'] ?? '');
    $career_slug = sanitize($input['career_slug'] ?? '');
    $description = sanitize($input['description'] ?? '');
    $icon_key = sanitize($input['icon_key'] ?? 'Globe');
    $avg_salary = sanitize($input['avg_salary'] ?? '$80,000 - $120,000 / yr');
    $difficulty_level = sanitize($input['difficulty_level'] ?? 'Moderate');
    $total_duration_weeks = (int)($input['total_duration_weeks'] ?? 20);
    $tagline = sanitize($input['tagline'] ?? 'Master modern industry skills');
    $badge_color = sanitize($input['badge_color'] ?? 'emerald');

    if (empty($career_name)) {
        sendJsonResponse(['status' => 'error', 'message' => 'Career name is required'], 400);
    }

    if (empty($career_slug)) {
        $career_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $career_name)));
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO careers 
            (career_slug, career_name, description, icon_key, avg_salary, difficulty_level, total_duration_weeks, tagline, badge_color)
            VALUES 
            (:slug, :name, :description, :icon, :salary, :difficulty, :duration, :tagline, :color)
        ");
        $stmt->execute([
            'slug' => $career_slug,
            'name' => $career_name,
            'description' => $description,
            'icon' => $icon_key,
            'salary' => $avg_salary,
            'difficulty' => $difficulty_level,
            'duration' => $total_duration_weeks,
            'tagline' => $tagline,
            'color' => $badge_color
        ]);

        $newId = (int)$pdo->lastInsertId();
        sendJsonResponse([
            'status' => 'success',
            'message' => 'Career track created successfully.',
            'career_id' => $newId
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// ==========================================================
// PUT: Update an Existing Career Track (Admin)
// ==========================================================
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $career_id = (int)($input['career_id'] ?? 0);

    if ($career_id <= 0) {
        sendJsonResponse(['status' => 'error', 'message' => 'Valid career_id is required'], 400);
    }

    $career_name = sanitize($input['career_name'] ?? '');
    $career_slug = sanitize($input['career_slug'] ?? '');
    $description = sanitize($input['description'] ?? '');
    $icon_key = sanitize($input['icon_key'] ?? 'Globe');
    $avg_salary = sanitize($input['avg_salary'] ?? '');
    $difficulty_level = sanitize($input['difficulty_level'] ?? 'Moderate');
    $total_duration_weeks = (int)($input['total_duration_weeks'] ?? 20);
    $tagline = sanitize($input['tagline'] ?? '');
    $badge_color = sanitize($input['badge_color'] ?? 'emerald');

    try {
        $stmt = $pdo->prepare("
            UPDATE careers SET 
                career_name = :name,
                career_slug = :slug,
                description = :description,
                icon_key = :icon,
                avg_salary = :salary,
                difficulty_level = :difficulty,
                total_duration_weeks = :duration,
                tagline = :tagline,
                badge_color = :color
            WHERE career_id = :id
        ");
        $stmt->execute([
            'name' => $career_name,
            'slug' => $career_slug,
            'description' => $description,
            'icon' => $icon_key,
            'salary' => $avg_salary,
            'difficulty' => $difficulty_level,
            'duration' => $total_duration_weeks,
            'tagline' => $tagline,
            'color' => $badge_color,
            'id' => $career_id
        ]);

        sendJsonResponse(['status' => 'success', 'message' => 'Career updated successfully.']);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// ==========================================================
// DELETE: Delete a Career Track (Admin)
// ==========================================================
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $career_id = (int)($input['career_id'] ?? ($_GET['id'] ?? 0));

    if ($career_id <= 0) {
        sendJsonResponse(['status' => 'error', 'message' => 'Valid career_id required'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM careers WHERE career_id = :id");
        $stmt->execute(['id' => $career_id]);

        sendJsonResponse(['status' => 'success', 'message' => 'Career track and associated milestones removed successfully.']);
    } catch (PDOException $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

sendJsonResponse(['status' => 'error', 'message' => 'Method not supported'], 405);
