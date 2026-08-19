import { fetchWithPlaywright } from "../packages/adapters/src/utils";

const html = await fetchWithPlaywright("http://example-site.com");

console.log("bytes:", html.length);

await Bun.write("example-site.html", html);
