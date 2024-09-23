import { serve, file } from "bun";
import { join } from "path";

// Router function to mimic indexRouter
function indexRouter(req: Request): Response {
  if (req.url === "/") {
    const indexPath = join(__dirname, "views/index.html");
    try {
      return new Response(file(indexPath), {
        headers: { "Content-Type": "text/html" },
      });
    } catch {
      return routeTo404();
    }
  }
  return routeTo404();
}

// Function to serve the 404 page
function routeTo404(): Response {
  const errorPagePath = join(__dirname, "views/404.html");
  try {
    return new Response(file(errorPagePath), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new Response("404: Page Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Serve static files from the "public" directory
async function serveStatic(req: Request) {
  const urlPath = req.url === "/" ? "/index.html" : req.url; // Default to index.html for root
  const staticPath = join(__dirname, "public", urlPath.substring(1)); // Trim leading '/'
  try {
    return file(staticPath);  // Serve the static file if it exists
  } catch {
    return null;
  }
}

// Main server logic
const server = serve({
  port: 3000,
  async fetch(req: Request) {
    // Serve favicon separately
    if (req.url === "/favicon.ico") {
      const faviconPath = join(__dirname, "public/favicon.ico");
      return new Response(file(faviconPath), {
        headers: { "Content-Type": "image/x-icon" },
      });
    }

    // Attempt to serve static files first (css, images, or any file in public)
    const staticFile = await serveStatic(req);
    if (staticFile) {
      return staticFile;
    }

    // Use router for handling dynamic routes
    return indexRouter(req);
  },
});

console.log(`Bun server running at ${server.url.origin}`);
