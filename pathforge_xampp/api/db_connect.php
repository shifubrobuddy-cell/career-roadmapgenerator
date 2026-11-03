<?php
/**
 * PathForge - Database Connection Handler
 * Technology: PHP 8.x PDO (PHP Data Objects) with MySQL 8.0/MariaDB
 * Path: api/db_connect.php
 */

require_once __DIR__ . '/../config/config.php';

function getDbConnection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // If testing connection or API request fails, return clear guidance
        $errorMessage = $e->getMessage();
        $isDbMissing = str_contains($errorMessage, "Unknown database");

        $response = [
            'status' => 'error',
            'code' => 'DB_CONNECTION_FAILED',
            'message' => 'Unable to connect to MySQL database: ' . $errorMessage,
            'troubleshooting' => [
                'step_1' => 'Ensure Apache and MySQL services are started (Green) in the XAMPP Control Panel.',
                'step_2' => 'Verify that the database `' . DB_NAME . '` exists in phpMyAdmin (http://localhost/phpmyadmin).',
                'step_3' => 'Import the provided `database/pathforge_db.sql` script via phpMyAdmin Import tab.',
                'step_4' => 'Confirm DB_USER is `root` with empty password or update credentials in `config/config.php`.'
            ]
        ];

        sendJsonResponse($response, 500);
    }
}

// Allow health check ping
if (isset($_GET['test']) && $_GET['test'] == '1') {
    $db = getDbConnection();
    sendJsonResponse([
        'status' => 'success',
        'message' => 'PathForge PDO connection established successfully.',
        'database' => DB_NAME,
        'driver' => $db->getAttribute(PDO::ATTR_DRIVER_NAME),
        'server_info' => $db->getAttribute(PDO::ATTR_SERVER_INFO),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
