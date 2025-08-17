"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const hostname = '127.0.0.1';
const port = 8080;
// Define the content of the index.html file with a new placeholder for the list
const indexHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown File List</title>
    <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; background-color: #f8f8f8; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 30px; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; }
        a { text-decoration: none; color: #3498db; font-weight: bold; }
        a:hover { text-decoration: underline; color: #2980b9; }
    </style>
</head>
<body>
    <h1>Available Markdown Files</h1>
    <ul id="markdown-list">
        <!-- MARKDOWN_LIST_PLACEHOLDER -->
    </ul>
</body>
</html>
`;
// Define paths
const distDir = path.join(__dirname); // __dirname will be the 'dist' directory after compilation
const markdownDir = path.join(path.resolve(__dirname, '..'), 'markdown'); // Go up one level from 'dist' to find 'markdown'
const generatedIndexHtmlPath = path.join(distDir, 'index.html');
// Function to generate the base index.html file (template)
function generateIndexHtmlTemplate() {
    return new Promise((resolve, reject) => {
        // Ensure the 'dist' directory exists
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }
        fs.writeFile(generatedIndexHtmlPath, indexHtmlTemplate, 'utf8', (err) => {
            if (err) {
                console.error('Error writing index.html template to dist directory:', err);
                reject(err);
                return;
            }
            console.log('index.html template generated successfully in:', generatedIndexHtmlPath);
            resolve();
        });
    });
}
const server = http.createServer((req, res) => {
    // Only handle requests for the root path ('/') to display the list
    if (req.url === '/') {
        fs.readdir(markdownDir, (err, files) => {
            if (err) {
                console.warn(`Warning: "markdown" directory not found or error reading it (${err?.message}). Serving an empty list.`);
                // Serve the template without any list items if there's an error reading markdown dir
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexHtmlTemplate.replace('<!-- MARKDOWN_LIST_PLACEHOLDER -->', '<li>Error reading markdown files.</li>'));
                return;
            }
            // Filter for .md and .markdown files
            const markdownFiles = files.filter((file) => file.endsWith('.md') || file.endsWith('.markdown'));
            // Generate list items (<li><a>) for each markdown file
            const listItems = markdownFiles.map((file) => {
                // The link will be to /markdown/filename.md
                // We'll need another route to actually serve these files later.
                return `<li><a href="/markdown/${encodeURIComponent(file)}">${file}</a></li>`;
            }).join('\n');
            // Replace the placeholder in the template with the generated list
            const finalHtml = indexHtmlTemplate.replace('<!-- MARKDOWN_LIST_PLACEHOLDER -->', listItems);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(finalHtml);
        });
    }
    else {
        // For any other request, return a 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});
// Generate the base index.html template before starting the server
generateIndexHtmlTemplate().then(() => {
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}).catch(error => {
    console.error('Failed to start server due to index.html template generation error:', error);
});
