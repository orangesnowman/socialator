import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface SavedDesign {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  destinationUrl: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory + persistent file storage for saved designs
const DATA_FILE = path.join(process.cwd(), "saved-designs.json");

function loadSavedDesigns(): SavedDesign[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading saved designs file:", err);
  }
  return [
    {
      id: "elevate-space-1",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
      title: "Elevate Your Space",
      description: "Timeless design. Thoughtful living.",
      destinationUrl: "https://example.com/interior-design",
      createdAt: Date.now() - 3600000 * 4,
      updatedAt: Date.now() - 3600000 * 4,
    },
    {
      id: "dark-luxe-2",
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
      title: "Elevate Your Space - Dark Edition",
      description: "Timeless design. Modern moody aesthetics.",
      destinationUrl: "https://example.com/collection/dark",
      createdAt: Date.now() - 3600000 * 3,
      updatedAt: Date.now() - 3600000 * 3,
    },
    {
      id: "warm-neutral-3",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
      title: "Elevate Your Space - Warm Botanics",
      description: "Natural materials and organic textures for peaceful living.",
      destinationUrl: "https://example.com/collection/warm",
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
    },
    {
      id: "minimal-light-4",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
      title: "Elevate Your Space - Scandinavian Minimal",
      description: "Clean silhouettes and functional luxury.",
      destinationUrl: "https://example.com/collection/minimal",
      createdAt: Date.now() - 3600000 * 1,
      updatedAt: Date.now() - 3600000 * 1,
    },
    {
      id: "charcoal-lounge-5",
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
      title: "Elevate Your Space - Studio Collection",
      description: "Craftsmanship meets contemporary comfort.",
      destinationUrl: "https://example.com/collection/studio",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}

function persistSavedDesigns(designs: SavedDesign[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(designs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing saved designs file:", err);
  }
}

let savedDesigns: SavedDesign[] = loadSavedDesigns();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", count: savedDesigns.length });
  });

  // Get app configuration (including public APP_URL)
  app.get("/api/config", (req, res) => {
    let publicUrl = process.env.APP_URL || "";
    // If APP_URL is not explicitly set, determine best public URL base
    if (!publicUrl) {
      const host = req.get("host") || "";
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      // If running on ais-dev, the public preview without cookie-gate is ais-pre
      if (host.includes("ais-dev-")) {
        publicUrl = `${protocol}://${host.replace("ais-dev-", "ais-pre-")}`;
      } else {
        publicUrl = `${protocol}://${host}`;
      }
    }
    res.json({ appUrl: publicUrl });
  });

  // Get all saved designs
  app.get("/api/designs", (_req, res) => {
    res.json(savedDesigns);
  });

  // Save or update a design
  app.post("/api/designs", (req, res) => {
    const { id, imageUrl, title, description, destinationUrl } = req.body;
    if (!title && !imageUrl) {
      return res.status(400).json({ error: "Missing design data" });
    }

    const designId = id || `des_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = savedDesigns.findIndex((d) => d.id === designId);

    const newDesign: SavedDesign = {
      id: designId,
      imageUrl: imageUrl || "",
      title: title || "Untitled Preview",
      description: description || "",
      destinationUrl: destinationUrl || "https://your-website.com",
      createdAt: existingIndex >= 0 ? savedDesigns[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      savedDesigns[existingIndex] = newDesign;
    } else {
      savedDesigns.unshift(newDesign);
    }

    persistSavedDesigns(savedDesigns);
    res.json(newDesign);
  });

  // Delete a design
  app.delete("/api/designs/:id", (req, res) => {
    const { id } = req.params;
    savedDesigns = savedDesigns.filter((d) => d.id !== id);
    persistSavedDesigns(savedDesigns);
    res.json({ success: true });
  });

  // Public /share/:id Open Graph crawler + redirect endpoint
  app.get("/share/:id", (req, res) => {
    const { id } = req.params;
    const design = savedDesigns.find((d) => d.id === id);

    const title = design?.title || "Socialator Link Preview";
    const description = design?.description || "Preview created with Socialator";
    const imageUrl = design?.imageUrl || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop";
    let destinationUrl = design?.destinationUrl || "https://your-website.com";

    if (!destinationUrl.startsWith("http://") && !destinationUrl.startsWith("https://")) {
      destinationUrl = "https://" + destinationUrl;
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
    const currentShareUrl = `${protocol}://${host}/share/${id}`;

    // Escape HTML special characters for meta tags
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(imageUrl);
    const safeDestination = escapeHtml(destinationUrl);
    const safeShareUrl = escapeHtml(currentShareUrl);

    const userAgent = (req.get("user-agent") || "").toLowerCase();
    const isBot =
      /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|bingbot|googlebot/i.test(
        userAgent
      );

    // If it's a crawler / bot requesting the page, serve pure Open Graph metadata
    // If it's a regular browser user, render Open Graph tags + instant auto-redirection to the Destination URL
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${safeTitle}">
  <meta name="description" content="${safeDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeShareUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:alt" content="${safeTitle}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${safeShareUrl}">
  <meta property="twitter:title" content="${safeTitle}">
  <meta property="twitter:description" content="${safeDescription}">
  <meta property="twitter:image" content="${safeImage}">

  ${
    !isBot
      ? `
  <!-- Human Browser Redirection to Destination URL -->
  <meta http-equiv="refresh" content="0; url=${safeDestination}">
  <script>
    window.location.replace("${safeDestination.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}");
  </script>
  `
      : ""
  }
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #334155;
    }
    .card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      text-align: center;
      max-width: 480px;
      width: 90%;
      border: 1px solid #e2e8f0;
    }
    h2 { margin-top: 0; font-size: 1.25rem; color: #0f172a; }
    p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
    .btn {
      display: inline-block;
      margin-top: 1.25rem;
      padding: 0.75rem 1.5rem;
      background: #1877f2;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.95rem;
    }
    .btn:hover { background: #166fe5; }
    .meta-preview {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      text-align: left;
      font-size: 0.85rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Redirecting to destination...</h2>
    <p>You are being forwarded to <strong>${safeDestination}</strong></p>
    <a href="${safeDestination}" class="btn">Click here if not redirected</a>
    <div class="meta-preview">
      <strong>Preview Title:</strong> ${safeTitle}<br>
      <strong>Description:</strong> ${safeDescription}
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Socialator server running on http://localhost:${PORT}`);
  });
}

startServer();
