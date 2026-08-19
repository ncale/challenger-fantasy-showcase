import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const packagesDir = "packages";

const dirs = readdirSync(packagesDir);

for (const dir of dirs) {
  const pkgPath = join(packagesDir, dir, "package.json");
  if (!existsSync(pkgPath)) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const quality = pkg["x-quality"];

  const icon = quality === "wired" ? "✅" : quality === "typecheck-only" ? "🔶" : "⏳";

  console.log(`${icon} ${pkg.name}`);
}
