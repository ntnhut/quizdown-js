import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Run after npm run build. No browser automation dependency is required.
const profile = mkdtempSync(join(tmpdir(), 'quizdown-browser-test-'));
try {
    const browser = process.env.CHROME_BIN || 'google-chrome';
    const result = spawnSync(browser, [
        '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
        '--no-first-run', `--user-data-dir=${profile}`,
        '--dump-dom', '--virtual-time-budget=30000',
        new URL('./inline-explanations.html', import.meta.url).href,
    ], { encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
    if (result.error) throw result.error;
    const report = result.stdout.match(/<pre id="report"[^>]*>([\s\S]*?)<\/pre>/);
    console.log(report ? report[1] : result.stderr);
    if (result.status !== 0 || !result.stdout.includes('data-result="passed"')) {
        process.exitCode = 1;
    }
} finally {
    rmSync(profile, { recursive: true, force: true });
}
