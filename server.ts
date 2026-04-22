import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";

// Read Firebase config directly
import { readFileSync } from 'fs';
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));

// Initialize Firebase for server-side fetches
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const server = express();
  const PORT = 3000;

  // Serve sitemap
  server.get("/sitemap.xml", async (req, res) => {
    try {
      const q = query(collection(db, "content"), where("status", "==", "published"));
      const snapshot = await getDocs(q);
      const domain = `https://${req.get('host')}`;
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      xml += `  <url>\n    <loc>${domain}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const slug = data.slug || doc.id;
        const type = data.type || "articles";
        const section = type === "thesis" ? "theses" : type === "conference_paper" ? "conference-papers" : type === "poetry" ? "poems" : "articles";
        xml += `  <url>\n    <loc>${domain}/${section}/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Serve robots.txt
  server.get("/robots.txt", (req, res) => {
    const domain = `https://${req.get('host')}`;
    const txt = `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`;
    res.header("Content-Type", "text/plain");
    res.send(txt);
  });

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    server.use(express.static(path.join(__dirname, "dist"), { index: false }));
  }

  // Intercept all routes to inject meta tags for scientific content
  server.use("*", async (req, res, next) => {
    try {
      let template = "";
      if (process.env.NODE_ENV !== "production") {
        template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, "dist", "index.html"), "utf-8");
      }

      // Check if URL looks like a content detail page: /articles/:slug, /theses/:slug, /conference-papers/:slug
      const contentMatch = req.originalUrl.match(/^\/(articles|theses|conference-papers)\/([^/?]+)/);
      
      if (contentMatch) {
        const section = contentMatch[1];
        const slug = contentMatch[2];
        
        let q = query(
          collection(db, "content"),
          where("slug", "==", slug),
          where("status", "==", "published"),
          limit(1)
        );
        let snapshot = await getDocs(q);

        // Fallback to id
        if (snapshot.empty) {
          const docIdQuery = query(
            collection(db, "content"),
            where("__name__", "==", slug),
            where("status", "==", "published"),
            limit(1)
          );
          snapshot = await getDocs(docIdQuery);
        }

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const domain = `https://${req.get('host')}`;
          
          let metaTags = `\n    <!-- Google Scholar Meta Tags -->`;
          
          if (data.citation_title) metaTags += `\n    <meta name="citation_title" content="${data.citation_title.replace(/"/g, '&quot;')}" />`;
          else if (data.title?.uz) metaTags += `\n    <meta name="citation_title" content="${data.title.uz.replace(/"/g, '&quot;')}" />`;
          
          if (data.citation_authors && Array.isArray(data.citation_authors)) {
            data.citation_authors.forEach((author: string) => {
              metaTags += `\n    <meta name="citation_author" content="${author.replace(/"/g, '&quot;')}" />`;
            });
          } else if (data.authorName) {
            metaTags += `\n    <meta name="citation_author" content="${data.authorName.replace(/"/g, '&quot;')}" />`;
          }
          
          if (data.citation_publication_date) {
            metaTags += `\n    <meta name="citation_publication_date" content="${data.citation_publication_date}" />`;
          }
          
          if (data.journal_title) metaTags += `\n    <meta name="citation_journal_title" content="${data.journal_title.replace(/"/g, '&quot;')}" />`;
          if (data.conference_title) metaTags += `\n    <meta name="citation_conference_title" content="${data.conference_title.replace(/"/g, '&quot;')}" />`;
          if (data.volume) metaTags += `\n    <meta name="citation_volume" content="${data.volume}" />`;
          if (data.issue) metaTags += `\n    <meta name="citation_issue" content="${data.issue}" />`;
          if (data.pages) {
            const pts = String(data.pages).split('-');
            if(pts[0]) metaTags += `\n    <meta name="citation_firstpage" content="${pts[0].trim()}" />`;
            if(pts[1]) metaTags += `\n    <meta name="citation_lastpage" content="${pts[1].trim()}" />`;
          }
          if (data.doi) metaTags += `\n    <meta name="citation_doi" content="${data.doi}" />`;
          if (data.language) metaTags += `\n    <meta name="citation_language" content="${data.language}" />`;
          if (data.keywords && Array.isArray(data.keywords)) {
            data.keywords.forEach((kw: string) => {
              metaTags += `\n    <meta name="citation_keywords" content="${kw.replace(/"/g, '&quot;')}" />`;
            });
          }
          
          if (data.pdf_url) {
            metaTags += `\n    <meta name="citation_pdf_url" content="${data.pdf_url}" />`;
          }
          
          metaTags += `\n    <meta name="citation_abstract_html_url" content="${domain}${req.originalUrl.split('?')[0]}" />`;
          
          // Inject
          template = template.replace("</head>", `${metaTags}\n  </head>`);
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
