<?php
// Shared helper for Gemini API calls in PHP

// Disable error reporting output to avoid corrupting JSON responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

function getGeminiApiKey() {
    $apiKey = getenv('GEMINI_API_KEY');
    if ($apiKey) return $apiKey;
    
    // Check $_ENV or $_SERVER
    if (isset($_ENV['GEMINI_API_KEY'])) return $_ENV['GEMINI_API_KEY'];
    if (isset($_SERVER['GEMINI_API_KEY'])) return $_SERVER['GEMINI_API_KEY'];
    
    // Fallback: parse .env in the parent directory of /api/ (the root directory)
    $envPath = dirname(__DIR__) . '/.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $name = trim($parts[0]);
                $value = trim($parts[1]);
                // strip quotes
                $value = trim($value, "\"'");
                if ($name === 'GEMINI_API_KEY') {
                    return $value;
                }
            }
        }
    }
    return '';
}

function callGeminiAPI($base64Data, $mimeType, $systemInstruction, $promptText, $responseSchema, $model = 'gemini-2.5-flash') {
    $apiKey = getGeminiApiKey();
    if (!$apiKey) {
        return ['error' => 'GEMINI_API_KEY is not configured on the server.'];
    }

    // Prepare JSON payload
    $payload = [
        'contents' => [
            [
                'parts' => [
                    [
                        'inlineData' => [
                            'mimeType' => $mimeType ?: 'image/png',
                            'data' => $base64Data
                        ]
                    ],
                    [
                        'text' => $promptText
                    ]
                ]
            ]
        ],
        'systemInstruction' => [
            'parts' => [
                ['text' => $systemInstruction]
            ]
        ],
        'generationConfig' => [
            'responseMimeType' => 'application/json',
            'responseSchema' => $responseSchema
        ]
    ];

    // Try multiple models if the primary fails (fallback mechanism)
    $modelsToTry = [$model, 'gemini-1.5-flash', 'gemini-1.5-pro'];
    $lastError = 'Unknown error';

    foreach ($modelsToTry as $currentModel) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$currentModel}:generateContent?key=" . urlencode($apiKey);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'User-Agent: aistudio-build-php'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 60s timeout for complex OCR
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            $lastError = "Curl error: " . $curlError;
            continue;
        }

        if ($httpCode === 200) {
            $resData = json_decode($response, true);
            if (isset($resData['candidates'][0]['content']['parts'][0]['text'])) {
                $textResult = $resData['candidates'][0]['content']['parts'][0]['text'];
                $parsedJson = json_decode($textResult, true);
                if ($parsedJson) {
                    return $parsedJson;
                } else {
                    // Sometimes the response has markdown code blocks, try to clean it
                    $cleanedText = preg_replace('/^```json\s*|\s*```$/i', '', trim($textResult));
                    $parsedJson = json_decode($cleanedText, true);
                    if ($parsedJson) {
                        return $parsedJson;
                    }
                    return [
                        'error' => 'Failed to parse Gemini JSON response.',
                        'rawText' => $textResult
                    ];
                }
            } else {
                $lastError = "Unexpected response structure from Gemini: " . $response;
            }
        } else {
            $lastError = "Gemini API returned HTTP {$httpCode}: " . $response;
        }
    }

    return ['error' => $lastError];
}
