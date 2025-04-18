import http from "http";
import { Request, Response } from "express";
import { env } from "../config/env";
import { URL } from "url";

export const authProxy = async (req: Request, res: Response) => {
  try {
    // 1. Preserve exact path (including /api/v1)
    const targetUrl = new URL(req.originalUrl, env.AUTH_SERVICE_URL);

    // 2. Debug log the full URL
    console.log(`Proxying to: ${targetUrl.toString()}`);

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search, // Include query params
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.hostname, // Critical for Render
        connection: "close",
        "content-type": "application/json", // Force JSON
      },
      timeout: 30000,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward status and headers
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);

      // Stream response
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

    // 3. Ensure body is forwarded correctly
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Length", bodyData.length);
      proxyReq.write(bodyData);
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
