import type { Plugin } from "vite";

export function searchIndexing(allowIndexing: boolean): Plugin {
  const robots = `User-agent: *\n${allowIndexing ? "Allow: /" : "Disallow: /"}\n`;

  return {
    name: "search-indexing",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== "/robots.txt") return next();
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end(robots);
      });
    },
    transformIndexHtml() {
      return allowIndexing
        ? []
        : [
            {
              tag: "meta",
              attrs: { name: "robots", content: "noindex, nofollow" },
              injectTo: "head",
            },
          ];
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
    },
  };
}
