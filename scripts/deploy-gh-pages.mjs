#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, 'dist');
const gitDir = path.join(repoRoot, '.git');
const tempIndex = path.join(gitDir, `deploy_index_${Date.now()}_${process.pid}`);

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');
const remote = args.find((a) => a.startsWith('--remote='))?.split('=')[1] ?? 'origin';
const targetBranch = args.find((a) => a.startsWith('--branch='))?.split('=')[1] ?? 'gh-pages';

console.log(`\n🚀 Preparing local build for GitHub Pages (${targetBranch})...\n`);

try {
  if (!skipBuild) {
    console.log('📦 Building production bundle (tsc && vite build)...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  const indexPath = path.join(distDir, 'index.html');
  const cnamePath = path.join(distDir, 'CNAME');
  const nojekyllPath = path.join(distDir, '.nojekyll');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Build output missing: ${indexPath}`);
  }

  if (!fs.existsSync(nojekyllPath)) {
    fs.writeFileSync(nojekyllPath, '');
  }

  if (!fs.existsSync(cnamePath)) {
    console.warn('⚠️ Warning: dist/CNAME not found. Ensure public/CNAME exists.');
  }

  console.log(`\n📂 Staging dist/ into temporary git tree...`);
  execSync(`git --git-dir="${gitDir}" --work-tree="${distDir}" add -A`, {
    env: { ...process.env, GIT_INDEX_FILE: tempIndex },
    stdio: 'inherit',
  });

  const treeId = execSync(`git --git-dir="${gitDir}" write-tree`, {
    env: { ...process.env, GIT_INDEX_FILE: tempIndex },
    encoding: 'utf-8',
  }).trim();

  let mainCommit = 'head';
  try {
    mainCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {}

  let parentArg = '';
  try {
    const parent = execSync(`git rev-parse --verify ${remote}/${targetBranch}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (parent) {
      parentArg = `-p ${parent}`;
    }
  } catch {}

  const commitMessage = `Deploy ${mainCommit} to ${targetBranch} (${new Date().toISOString()})`;
  const commitId = execSync(
    `git --git-dir="${gitDir}" commit-tree ${treeId} ${parentArg} -m "${commitMessage}"`,
    { encoding: 'utf-8' }
  ).trim();

  console.log(`\n📤 Pushing tree ${treeId.slice(0, 7)} (commit ${commitId.slice(0, 7)}) to ${remote} ${targetBranch}...`);
  execSync(`git push ${remote} ${commitId}:refs/heads/${targetBranch} --force`, {
    stdio: 'inherit',
  });

  console.log(`\n✅ Successfully deployed local build to GitHub Pages (${targetBranch})!\n`);
} finally {
  if (fs.existsSync(tempIndex)) {
    try {
      fs.unlinkSync(tempIndex);
    } catch {}
  }
}
