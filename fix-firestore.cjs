const fs = require('fs');

const files = [
    'index.html',
    'dashboard/index.html',
    'pricing/index.html',
    'tools/index.html',
    'tools/image-to-code/index.html',
    'tools/handwriting-to-text/index.html',
    'tools/hindi-handwriting-to-text/index.html',
];

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Add initializeFirestore to import
        if (!content.includes('initializeFirestore')) {
            content = content.replace('import { getFirestore,', 'import { initializeFirestore, getFirestore,');
        }
        
        // Replace getFirestore call with initializeFirestore
        content = content.replace(/const db = getFirestore\(app, firebaseConfig\.firestoreDatabaseId\);/g, 'const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);');
        
        fs.writeFileSync(f, content);
    }
}
console.log('Fixed Firestore connection logic');
