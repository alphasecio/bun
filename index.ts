import { serve, file } from "bun";
import { join } from "path";

// Function to serve the index.html page
function serveIndex(): Response {
  const indexPath = join(__dirname, "views", "index.html");
  try {
    console.log(`Serving index from: ${indexPath}`);
    return new Response(file(indexPath), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) { 
      console.error(`Index file not found: ${indexPath}`, error);
      return routeTo404();
  }
}

// Function to serve the 404 page
function routeTo404(): Response {
  const errorPagePath = join(__dirname, "views", "404.html");
  try {
    console.log(`Serving 404 from: ${errorPagePath}`);
    return new Response(file(errorPagePath), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
      console.error(`404 file not found: ${errorPagePath}`, error);
      return new Response("404: Page Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
  }
}

// Serve static files from the "public" directory
async function serveStatic(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const urlPath = url.pathname;
  const safePath = join("/", urlPath).substr(1);
  const staticPath = join(__dirname, "public", safePath);
  try {
    console.log(`Attempting to serve static file from: ${staticPath}`);
    const fileContent = await file(staticPath).arrayBuffer();
    console.log(`Successfully served static file: ${staticPath}`);
    return new Response(fileContent, {
      headers: { "Content-Type": getContentType(urlPath) },
    });
  } catch (error) {
      console.error(`Static file not found: ${staticPath}`, error);  
      return null;
  }
}

// Determine MIME type (Content-Type) for static files -> add more as required
function getContentType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'ico': return 'image/x-icon';
    default: return 'application/octet-stream';
  }
}

// Main server logic
const server = serve({
  port: 3000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Serve index.html
    if (url.pathname === "/") {
      return serveIndex();
    }

    // Serve static files (css, images, or any file in public)
    const staticFile = await serveStatic(req);
    if (staticFile) {
      return staticFile;
    }

    // Route to 404 for all other paths
    return routeTo404();
  },
});

console.log(`Bun server running at ${server.url.origin}`);
