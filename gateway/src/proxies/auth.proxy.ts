import https from "https";
import { Request, Response } from "express";
import { env } from "../config/env";
import { URL } from "url";

export const authProxy = async (req: Request, res: Response) => {
  if (!env.AUTH_SERVICE_URL) {
    return res.status(500).json({ message: "Auth service URL not configured" });
  }

  try {
    const authServiceUrl = env.AUTH_SERVICE_URL.startsWith("http")
      ? env.AUTH_SERVICE_URL
      : `https://${env.AUTH_SERVICE_URL}`;

    const targetUrl = new URL(req.originalUrl, authServiceUrl);
    targetUrl.protocol = "https:";

    console.log(`Proxying to: ${targetUrl.toString()}`);

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 443,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.hostname,
        "accept-encoding": "identity", // Disable compression
        connection: "keep-alive",
        "content-type": req.headers["content-type"] || "application/json",
      },
      timeout: 30000, // 30-second timeout
      rejectUnauthorized: false,
    };

    // Remove Postman-specific headers that can cause issues
    const filteredReqHeaders = { ...req.headers };
    delete filteredReqHeaders["postman-token"];
    delete filteredReqHeaders["user-agent"];
    delete filteredReqHeaders["accept-encoding"];

    const proxyReq = https.request(options, (proxyRes) => {
      // Forward headers excluding problematic ones
      const { "transfer-encoding": _, ...resHeaders } = proxyRes.headers;
      res.writeHead(proxyRes.statusCode || 500, resHeaders);

      // Stream the response
      proxyRes.pipe(res);
    });

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      console.error("Proxy request timed out");
      if (!res.headersSent) {
        res.status(504).json({ message: "Gateway timeout" });
      }
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

    // Handle request body
    if (req.body) {
      const bodyData =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
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
