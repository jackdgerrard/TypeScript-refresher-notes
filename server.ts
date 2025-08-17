// server.ts
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

const hostname: string = '127.0.0.1';
const port: number = 8080;

// Define the content of the index.html file with a new placeholder for the list
const indexHtmlTemplate: string = `
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
const distDir: string = path.join(__dirname); // __dirname will be the 'dist' directory after compilation
const markdownDir: string = path.join(path.resolve(__dirname, '..'), 'markdown'); // Go up one level from 'dist' to find 'markdown'
const generatedIndexHtmlPath: string = path.join(distDir, 'index.html');

// Function to generate the base index.html file (template)
function generateIndexHtmlTemplate(): Promise<void> {
    return new Promise((resolve, reject) => {
        // Ensure the 'dist' directory exists
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }

        fs.writeFile(generatedIndexHtmlPath, indexHtmlTemplate, 'utf8', (err: NodeJS.ErrnoException | null) => {
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

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    // Only handle requests for the root path ('/') to display the list
    if (req.url === '/') {
        fs.readdir(markdownDir, (err: NodeJS.ErrnoException | null, files: string[]) => {
            if (err) {
                console.warn(`Warning: "markdown" directory not found or error reading it (${err?.message}). Serving an empty list.`);
                // Serve the template without any list items if there's an error reading markdown dir
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexHtmlTemplate.replace('<!-- MARKDOWN_LIST_PLACEHOLDER -->', '<li>Error reading markdown files.</li>'));
                return;
            }

            // Filter for .md and .markdown files
            const markdownFiles: string[] = files.filter((file: string) => file.endsWith('.md') || file.endsWith('.markdown'));

            // Generate list items (<li><a>) for each markdown file
            const listItems: string = markdownFiles.map((file: string) => {
                // The link will be to /markdown/filename.md
                // We'll need another route to actually serve these files later.
                return `<li><a href="/markdown/${encodeURIComponent(file)}">${file}</a></li>`;
            }).join('\n');

            // Replace the placeholder in the template with the generated list
            const finalHtml: string = indexHtmlTemplate.replace('<!-- MARKDOWN_LIST_PLACEHOLDER -->', listItems);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(finalHtml);
        });
    } else {
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
