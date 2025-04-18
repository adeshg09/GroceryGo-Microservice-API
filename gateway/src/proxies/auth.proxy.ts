import https from "https"; // Changed from http
import { Request, Response } from "express";
import { env } from "../config/env";
import { URL } from "url";

export const authProxy = async (req: Request, res: Response) => {
  if (!env.AUTH_SERVICE_URL) {
    return res.status(500).json({ message: "Auth service URL not configured" });
  }
  try {
    // Ensure HTTPS and correct URL format
    const authServiceUrl = env.AUTH_SERVICE_URL.startsWith("http")
      ? env.AUTH_SERVICE_URL
      : `https://${env.AUTH_SERVICE_URL}`;

    const targetUrl = new URL(req.originalUrl, authServiceUrl);
    targetUrl.protocol = "https:"; // Force HTTPS

    console.log(`Proxying to: ${targetUrl.toString()}`);

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 443, // Always use HTTPS port
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.hostname, // Critical for Render
        "content-type": "application/json",
        connection: "close",
      },
      rejectUnauthorized: false, // Bypass SSL cert verification (for Render)
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // Remove problematic headers
      const { "content-length": _, ...cleanHeaders } = proxyRes.headers;
      res.writeHead(proxyRes.statusCode || 500, cleanHeaders);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err);
      if (!res.headersSent) {
        res.status(502).json({
          message: "Auth service unavailable",
          error: err.message,
        });
      }
    });

    if (req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.end();
  } catch (err: any) {
    console.error("Proxy setup error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error",
        error: err.message,
      });
    }
  }
};
