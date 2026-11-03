<?php
/**
 * PathForge - Diagnostic Assessment API
 * Handles Skill Evaluation Quizzes and Personalized Roadmap Generation
 * Path: api/assessment.php
 */

require_once __DIR__ . '/db_connect.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

// ==========================================================
// GET: Retrieve Diagnostic Quiz for a Career
// ==========================================================
if ($method === 'GET') {
    $career_id = (int)($_GET['career_id'] ?? 1);

    $stmt = $pdo->prepare("
        SELECT quiz_id, career_id, question, options_json, correct_index, explanation, associated_skill_id, skill_name, topic 
        FROM diagnostic_quizzes 
        WHERE career_id = :cid
        ORDER BY quiz_id ASC
    ");
    $stmt->execute(['cid' => $career_id]);
    $questions = $stmt->fetchAll();

    foreach ($questions as &$q) {
        $q['options'] = json_decode($q['options_json'], true);
        unset($q['options_json']);
    }

    sendJsonResponse([
        'status' => 'success',
        'career_id' => $career_id,
        'total_questions' => count($questions),
        'questions' => $questions
    ]);
}

// ==========================================================
// POST: Submit Diagnostic Answers & Update Roadmap
// ==========================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $user_id = (int)($input['user_id'] ?? 1);
    $career_id = (int)($input['career_id'] ?? 1);
    $answers = $input['answers'] ?? []; // Map of quiz_id => selected_option_index

    if (empty($answers)) {
        sendJsonResponse(['status' => 'error', 'message' => 'No answers submitted'], 400);
    }

    // Fetch correct answers for verification
    $stmt = $pdo->prepare("
        SELECT quiz_id, correct_index, associated_skill_id, skill_name, topic, explanation 
        FROM diagnostic_quizzes 
        WHERE career_id = :cid
    ");
    $stmt->execute(['cid' => $career_id]);
    $quizKeys = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    $total = count($quizKeys);
    $correctCount = 0;
    $results = [];
    $skillsMastered = [];
    $skillsToStudy = [];

    // Prepared statement for updating user progress based on assessment
    $progressStmt = $pdo->prepare("
        INSERT INTO user_progress (user_id, career_id, skill_id, status, confidence_rating, notes)
        VALUES (:uid, :cid, :sid, :status, :confidence, :notes)
        ON DUPLICATE KEY UPDATE 
            status = VALUES(status), 
            confidence_rating = VALUES(confidence_rating),
            notes = VALUES(notes),
            updated_at = CURRENT_TIMESTAMP
    ");

    foreach ($answers as $quizId => $userAnswerIndex) {
        if (!isset($quizKeys[$quizId])) continue;

        $qInfo = $quizKeys[$quizId];
        $isCorrect = ((int)$userAnswerIndex === (int)$qInfo['correct_index']);

        if ($isCorrect) {
            $correctCount++;
            if ($qInfo['associated_skill_id']) {
                $skillsMastered[] = $qInfo['skill_name'];
                $progressStmt->execute([
                    'uid' => $user_id,
                    'cid' => $career_id,
                    'sid' => $qInfo['associated_skill_id'],
                    'status' => 'completed',
                    'confidence' => 5,
                    'notes' => 'Verified through diagnostic benchmark assessment'
                ]);
            }
        } else {
            if ($qInfo['associated_skill_id']) {
                $skillsToStudy[] = $qInfo['skill_name'];
                $progressStmt->execute([
                    'uid' => $user_id,
                    'cid' => $career_id,
                    'sid' => $qInfo['associated_skill_id'],
                    'status' => 'in_progress',
                    'confidence' => 2,
                    'notes' => 'Identified as priority growth area in diagnostic assessment'
                ]);
            }
        }

        $results[] = [
            'quiz_id' => $quizId,
            'is_correct' => $isCorrect,
            'explanation' => $qInfo['explanation'],
            'topic' => $qInfo['topic']
        ];
    }

    $scorePercentage = $total > 0 ? round(($correctCount / $total) * 100) : 0;

    // Determine proficiency placement
    $placement = 'Foundations Track';
    if ($scorePercentage >= 80) {
        $placement = 'Accelerated Advanced Track';
    } elseif ($scorePercentage >= 50) {
        $placement = 'Intermediate Fast-Track';
    }

    sendJsonResponse([
        'status' => 'success',
        'score_percentage' => $scorePercentage,
        'correct_count' => $correctCount,
        'total_questions' => $total,
        'placement' => $placement,
        'skills_mastered' => $skillsMastered,
        'skills_to_study' => $skillsToStudy,
        'results' => $results,
        'message' => "Assessment completed: {$scorePercentage}% score. Your roadmap has been calibrated."
    ]);
}

sendJsonResponse(['status' => 'error', 'message' => 'Method not supported'], 405);
