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
const marked_1 = require("marked");
const hostname = '127.0.0.1';
const port = 8080;
// Define the content of the index.html file with a new placeholder for the articles
const indexHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autumnal Markdown Content</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'); /* Import Inter font */

        body {
            font-family: 'Inter', sans-serif; /* Set Inter as the primary font */
            padding: 20px;
            line-height: 1.7; /* Slightly increased line height for readability */
            background-color: #F5EFE6; /* Soft cream background */
            color: #4A4A4A; /* Deep, soft charcoal-brown text */
        }
        h1 {
            color: #6B3F2A; /* Rich, warm brown for main heading */
            border-bottom: 2px solid #B86B3D; /* Burnt orange border */
            padding-bottom: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        #app {
            display: flex;
            flex-direction: column; /* Stacks articles vertically */
            gap: 25px; /* Adds space between articles */
            max-width: 800px; /* Max width for content for better readability */
            margin: 0 auto; /* Center the content area */
        }
        .markdown-article {
            background-color: white; /* Clean white background for articles */
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.08); /* Slightly more prominent, soft shadow */
            border: 1px solid #E0DED7; /* Subtle border for definition */
        }
        .markdown-article h2 {
            color: #8B4513; /* Saddle brown for article titles */
            border-bottom: 1px dashed #D08C4F; /* Dashed ochre border for subtlety */
            padding-bottom: 8px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        h3, h4, h5, h6 { /* Other headings */
            color: #8B4513; /* Keep them in the warm brown/orange family */
            margin-top: 25px;
            margin-bottom: 15px;
        }
        a {
            text-decoration: none;
            color: #D08C4F; /* Warm ochre/burnt orange for links */
            font-weight: bold;
            transition: color 0.3s ease; /* Smooth transition on hover */
        }
        a:hover {
            text-decoration: underline;
            color: #B86B3D; /* Deeper burnt orange on hover */
        }
        blockquote {
            border-left: 4px solid #A0522D; /* Sienna for blockquote border */
            padding-left: 15px;
            margin-left: 0;
            color: #6B3F2A; /* Match main heading color */
            font-style: italic;
        }
        code {
            background-color: #EDECE4; /* Light, subtle background for inline code */
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Fira Code', monospace; /* Use a monospace font for code */
            color: #2C3E50; /* Darker grey for code text */
        }
        pre code {
            display: block;
            padding: 15px;
            background-color: #333; /* Dark background for code blocks */
            color: #F8F8F8; /* Light text for code blocks */
            border-radius: 5px;
            overflow-x: auto;
        }
        ul, ol {
            margin-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #D08C4F; /* Ochre border for table cells */
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #EDECE4; /* Light background for table headers */
            color: #6B3F2A; /* Darker text for table headers */
        }
    </style>
</head>
<body>
    <h1>Markdown Content Display</h1>
    <main id="app">
        <!-- MARKDOWN_CONTENT_PLACEHOLDER -->
    </main>
</body>
</html>
`;
// Define paths
const distDir = path.join(__dirname);
const markdownDir = path.join(path.resolve(__dirname, '..'), 'markdown');
const generatedIndexHtmlPath = path.join(distDir, 'index.html');
// Function to generate the HTML content from markdown files
async function generateHtmlFromMarkdown() {
    try {
        const files = await fs.promises.readdir(markdownDir);
        const markdownFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.markdown')).sort();
        let articlesHtml = '';
        for (const file of markdownFiles) {
            const filePath = path.join(markdownDir, file);
            const markdownContent = await fs.promises.readFile(filePath, 'utf8');
            const htmlContent = await (0, marked_1.marked)(markdownContent);
            articlesHtml += `<article class="markdown-article">\n<h2>${file}</h2>\n${htmlContent}\n</article>\n`;
        }
        return indexHtmlTemplate.replace('<!-- MARKDOWN_CONTENT_PLACEHOLDER -->', articlesHtml);
    }
    catch (err) {
        console.warn(`Warning: Could not read markdown directory or files (${err.message}). Serving an empty page.`);
        return indexHtmlTemplate.replace('<!-- MARKDOWN_CONTENT_PLACEHOLDER -->', `<article>Error reading markdown files: ${err.message}</article>`);
    }
}
// Create and start the server
const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        const finalHtml = await generateHtmlFromMarkdown();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(finalHtml);
    }
    else {
        // For any other request, return a 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
