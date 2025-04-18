import http from "http";
import { Request, Response } from "express";
import { env } from "../config/env";
import { URL } from "url";

export const authProxy = async (req: Request, res: Response) => {
  try {
    const targetPath = req.originalUrl.replace("/api/v1", "");
    const authUrl = new URL(targetPath, env.AUTH_SERVICE_URL);

    const options = {
      hostname: authUrl.hostname,
      port: authUrl.port,
      path: authUrl.pathname,
      method: req.method,
      headers: {
        ...req.headers,
        host: authUrl.hostname,
      },
      timeout: 30000,
    };

    console.log(`Proxying to: ${authUrl.toString()}`); // Debug log

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err);
      res.status(502).json({ message: "Auth service unavailable" });
    });

    if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.end();
  } catch (err) {
    console.error("Proxy setup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
