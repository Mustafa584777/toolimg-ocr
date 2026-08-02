<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Guest-ID, Authorization, *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$configData = [
    'apiKey' => getenv('VITE_FIREBASE_API_KEY') ?: getenv('FIREBASE_API_KEY') ?: '',
    'authDomain' => getenv('VITE_FIREBASE_AUTH_DOMAIN') ?: getenv('FIREBASE_AUTH_DOMAIN') ?: '',
    'projectId' => getenv('VITE_FIREBASE_PROJECT_ID') ?: getenv('FIREBASE_PROJECT_ID') ?: '',
    'firestoreDatabaseId' => getenv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') ?: getenv('FIREBASE_FIRESTORE_DATABASE_ID') ?: '',
    'storageBucket' => getenv('VITE_FIREBASE_STORAGE_BUCKET') ?: getenv('FIREBASE_STORAGE_BUCKET') ?: '',
    'messagingSenderId' => getenv('VITE_FIREBASE_MESSAGING_SENDER_ID') ?: getenv('FIREBASE_MESSAGING_SENDER_ID') ?: '',
    'appId' => getenv('VITE_FIREBASE_APP_ID') ?: getenv('FIREBASE_APP_ID') ?: '',
    'razorpayKeyId' => getenv('RAZORPAY_KEY_ID') ?: getenv('VITE_RAZORPAY_KEY_ID') ?: ''
];

// Fallback: parse .env if keys are missing
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath) && (empty($configData['apiKey']) || empty($configData['projectId']))) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            $value = trim($value, "\"'");
            
            if ($name === 'VITE_FIREBASE_API_KEY' || $name === 'FIREBASE_API_KEY') {
                if (empty($configData['apiKey'])) $configData['apiKey'] = $value;
            } elseif ($name === 'VITE_FIREBASE_AUTH_DOMAIN' || $name === 'FIREBASE_AUTH_DOMAIN') {
                if (empty($configData['authDomain'])) $configData['authDomain'] = $value;
            } elseif ($name === 'VITE_FIREBASE_PROJECT_ID' || $name === 'FIREBASE_PROJECT_ID') {
                if (empty($configData['projectId'])) $configData['projectId'] = $value;
            } elseif ($name === 'VITE_FIREBASE_FIRESTORE_DATABASE_ID' || $name === 'FIREBASE_FIRESTORE_DATABASE_ID') {
                if (empty($configData['firestoreDatabaseId'])) $configData['firestoreDatabaseId'] = $value;
            } elseif ($name === 'VITE_FIREBASE_STORAGE_BUCKET' || $name === 'FIREBASE_STORAGE_BUCKET') {
                if (empty($configData['storageBucket'])) $configData['storageBucket'] = $value;
            } elseif ($name === 'VITE_FIREBASE_MESSAGING_SENDER_ID' || $name === 'FIREBASE_MESSAGING_SENDER_ID') {
                if (empty($configData['messagingSenderId'])) $configData['messagingSenderId'] = $value;
            } elseif ($name === 'VITE_FIREBASE_APP_ID' || $name === 'FIREBASE_APP_ID') {
                if (empty($configData['appId'])) $configData['appId'] = $value;
            } elseif ($name === 'RAZORPAY_KEY_ID' || $name === 'VITE_RAZORPAY_KEY_ID') {
                if (empty($configData['razorpayKeyId'])) $configData['razorpayKeyId'] = $value;
            }
        }
    }
}

// Fallback to local json file if keys are still empty
$jsonPath = dirname(__DIR__) . '/firebase-applet-config.json';
if (file_exists($jsonPath) && (empty($configData['apiKey']) || empty($configData['projectId']))) {
    $fileConfig = json_decode(file_get_contents($jsonPath), true);
    if ($fileConfig) {
        foreach ($fileConfig as $key => $val) {
            if (empty($configData[$key])) {
                $configData[$key] = $val;
            }
        }
    }
}

echo json_encode($configData);
