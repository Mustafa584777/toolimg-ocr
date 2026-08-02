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
$framework = isset($input['framework']) ? $input['framework'] : 'html-tailwind';
$styleTheme = isset($input['styleTheme']) ? $input['styleTheme'] : 'modern-dark';
$customPrompt = isset($input['customPrompt']) ? $input['customPrompt'] : '';
$interactivity = isset($input['interactivity']) ? $input['interactivity'] : 'interactive';

$systemInstruction = "You are a master frontend engineer specializing in converting user designs, wireframes, screenshots, or hand-drawn sketches into pixel-perfect, highly polished, responsive, and functional frontend code.
Analyze the provided screenshot/mockup image.
Your goal is to reconstruct the exact design, typography, spacing, visual layout, and color scheme.

We support different target output options:
1. TARGET FRAMEWORK:
   - html-tailwind: Generate a single, completely self-contained, valid HTML5 file. This file MUST include Tailwind CSS CDN (<script src=\"https://cdn.tailwindcss.com\"></script>), Google Fonts for typography matches, and FontAwesome/Lucide or clean custom SVGs for icons. Use a script block inside to implement realistic interactions if requested (tab switching, modals, dropdown toggles, counter increments, or search filters).
   - react-tailwind: Generate a modern, highly interactive React functional component using Tailwind CSS utility classes and Lucide React or inline custom SVG icons. Ensure complete state management is written using React hooks (useState, useEffect, etc.).
   - vue-tailwind: Generate a single-file Vue 3 component with <template>, <script setup> (using ref, computed, etc.), and Tailwind utility classes.

2. STYLE THEMES (If specified, adapt or apply it cleanly):
   - modern-dark: Sleek deep slate/charcoal colors, high-tech dark background, glowing indicators, smooth contrast.
   - clean-light: Minimalist off-white backdrops, charcoal typography, elegant soft shadows, pristine light design.
   - neon-cyberpunk: Dark background, vibrant electric pink, neon purple, and cyan highlights, glowing borders, high contrast.
   - retro-90s: Windows 95/98 nostalgic style, retro grey buttons, thick borders, pixelated feel, serif typography, fun color tabs.
   - minimalist-slate: Monochromatic grays, slate, spacious padding, heavy rely on bold/thin typography contrasts.

3. INTERACTIVITY LEVEL (If 'interactive' is requested):
   - Make the mockup feel completely alive! Write robust client-side event handlers/scripts or component state. For instance, if there's a sidebar, support folding/unfolding; if there are cards/tabs, allow clicking them to filter or switch active views; if there's an input/button, allow adding dummy items; if there's a search, implement simple client-side search/filter on dummy cards.

Return a JSON response with the following structured format:
{
  \"htmlCode\": \"A completely self-contained HTML file utilizing Tailwind CSS. This will be loaded into an iframe for instant rendering and interactive preview. It must be valid HTML with standard CSS/JS and no React syntax.\",
  \"frameworkCode\": \"The clean source code written exactly in the selected framework format (e.g. JSX React code or Vue SFC code). If 'html-tailwind' is selected, this can be identical to htmlCode or beautifully formatted clean HTML.\",
  \"markdownSummary\": \"A high-quality markdown document explaining: 1. Design Overview and color palette identified. 2. Key components implemented and their responsive adaptations. 3. Framework installation instructions (how to run the React/Vue component, what packages to install like 'lucide-react', 'recharts' if there were charts, etc.).\",
  \"designAnalysis\": {
    \"colors\": [\"list of hex codes or color names found\"],
    \"typography\": \"font names and styles identified or mapped\",
    \"layout\": \"structural strategy (e.g. sidebar left, main feed, header grid, bento box)\",
    \"componentsIdentified\": [\"navbar\", \"sidebar\", \"metrics card\", \"etc.\"]
  }
}";

$promptText = "Convert this image mockup into fully working frontend code.
Selected target framework: {$framework}
Selected theme option: {$styleTheme}
Interactivity: {$interactivity}
Custom notes/prompt instructions: {$customPrompt}";

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
