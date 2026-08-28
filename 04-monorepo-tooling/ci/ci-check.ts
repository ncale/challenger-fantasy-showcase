import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ***

function logPackageVersion(packageName: string) {
  try {
    const pkgPath = join("node_modules", packageName, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`  ${packageName}: ${pkg.version}`);
  } catch {
    console.log(`  ${packageName}: not found`);
  }
}

console.log("=== Key dependency versions ===");
logPackageVersion("typescript");
logPackageVersion("react-native");
logPackageVersion("@types/react-native");
logPackageVersion("expo");
logPackageVersion("@react-native/typescript-config");
logPackageVersion("expo");
logPackageVersion("react-native");
console.log("==============================\n");

// ***

const command = process.argv[2] as "typecheck" | "test";
if (!command) {
  console.error("Usage: bun run scripts/ci-check.ts <typecheck|test>");
  process.exit(1);
}

const packagesDir = "packages";
const wiredPackages: string[] = [];

for (const dir of readdirSync(packagesDir)) {
  const pkgPath = join(packagesDir, dir, "package.json");
  if (!existsSync(pkgPath)) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const quality = pkg["x-quality"];

  if (quality === "wired" || quality === "typecheck-only") {
    wiredPackages.push(pkg.name);
  }
}

if (wiredPackages.length === 0) {
  console.log("No wired packages found, nothing to check.");
  process.exit(0);
}

console.log(`Running ${command} on ${wiredPackages.length} wired package(s):`);
wiredPackages.forEach((name) => {
  console.log(`  - ${name}`);
});

let failed = false;

for (const name of wiredPackages) {
  console.log(`\n▶ ${name}`);
  const result = spawnSync("bun", ["run", "--filter", name, command], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`✗ ${name} failed ${command}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nOne or more wired packages failed. Fix them or remove their x-quality field.");
  process.exit(1);
}

console.log("\nAll wired packages passed.");
