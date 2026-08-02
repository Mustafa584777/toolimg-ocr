<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Guest-ID, Authorization, *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

require_once __DIR__ . '/gemini-helper.php';

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['base64Data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image data provided']);
    exit;
}

$base64Data = $input['base64Data'];
$mimeType = isset($input['mimeType']) ? $input['mimeType'] : 'image/png';

$systemInstruction = "You are a highly accurate handwriting recognition AI.
Extract all text from the provided image accurately. Preserve formatting, line breaks, and spelling as best as possible.
Respond with a JSON object.";

$promptText = "Transcribe the handwriting in this image into text and put the result in the markdownSummary field. For htmlCode and frameworkCode, you can just return the raw text as well.";

$responseSchema = [
    'type' => 'OBJECT',
    'properties' => [
        'htmlCode' => ['type' => 'STRING'],
        'frameworkCode' => ['type' => 'STRING'],
        'markdownSummary' => ['type' => 'STRING'],
        'designAnalysis' => [
            'type' => 'OBJECT',
            'properties' => [
                'colors' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING']
                ],
                'typography' => ['type' => 'STRING'],
                'layout' => ['type' => 'STRING'],
                'componentsIdentified' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING']
                ]
            ],
            'required' => ['colors', 'typography', 'layout', 'componentsIdentified']
        ]
    ],
    'required' => ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
];

$result = callGeminiAPI($base64Data, $mimeType, $systemInstruction, $promptText, $responseSchema);

if (isset($result['error'])) {
    http_response_code(500);
}
echo json_encode($result);
