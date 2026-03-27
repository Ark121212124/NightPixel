const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;

// Папка, где лежит сам сайт
const publicDir = path.join(__dirname, "nightpixel_full");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav"
};

function send404(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>404 — Страница не найдена</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #0b0f19;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 20px;
        }
        .box {
          max-width: 600px;
        }
        h1 {
          font-size: 42px;
          margin-bottom: 16px;
        }
        p {
          font-size: 18px;
          color: #b8c0d9;
        }
        a {
          display: inline-block;
          margin-top: 20px;
          color: #fff;
          text-decoration: none;
          background: #4f46e5;
          padding: 12px 20px;
          border-radius: 12px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>404 — Страница не найдена</h1>
        <p>Похоже, такой страницы нет. Вернись на главную.</p>
        <a href="/">На главную</a>
      </div>
    </body>
    </html>
  `);
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);

  if (reqPath === "/") {
    reqPath = "/index.html";
  }

  // Поддержка адресов без .html, например /shop -> /shop.html
  if (!path.extname(reqPath)) {
    const htmlCandidate = path.join(publicDir, reqPath + ".html");
    if (fs.existsSync(htmlCandidate)) {
      const ext = ".html";
      const contentType = mimeTypes[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(htmlCandidate).pipe(res);
      return;
    }
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Доступ запрещён");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    send404(res);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
