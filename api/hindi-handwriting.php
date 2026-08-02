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

$systemInstruction = "You are an expert handwriting recognition AI specializing in Hindi (Devanagari script) and mixed Hindi-English (Hinglish) text.
Your goal is to extract all handwritten text in Hindi/Devanagari from the provided image with the highest possible level of accuracy.
- Accurately transcribe Devanagari characters, matras (vowels), half-letters, conjuncts (sanyuktakshtra), and punctuation.
- If some words are written in English or mixed Hinglish, transcribe them accurately in their respective language/script.
- Strictly preserve formatting, line breaks, paragraphs, list structures, and layout where possible.
- Respond with a JSON object containing the transcribed Hindi text.";

$promptText = "Transcribe the Hindi handwriting (Devanagari script) in this image into text and put the final transcribed result in the markdownSummary field. For htmlCode and frameworkCode, you can just return the raw text as well.";

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
