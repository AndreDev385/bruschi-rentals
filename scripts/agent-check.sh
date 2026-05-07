#!/usr/bin/env bash
# Agent verification loop script for landing page
# Usage: ./scripts/agent-check.sh [fast|full]
set -euo pipefail

MODE="${1:-fast}"
EXIT_CODE=0

if [ "$MODE" == "fast" ]; then
  echo "=== Agent Fast Check ==="

  echo "[1/3] Astro TypeScript check..."
  if ! output=$(pnpm exec astro check 2>&1); then
    echo "FAIL: Astro check failed"
    echo "$output"
    exit 2
  fi
  echo "    ✓ Astro check passed"

  echo "[2/3] Build..."
  if ! output=$(pnpm build 2>&1); then
    echo "FAIL: Build failed"
    echo "$output"
    exit 3
  fi
  echo "    ✓ Build passed"

  echo "[3/3] Prettier formatting check..."
  if ! output=$(pnpm exec prettier --check . 2>&1); then
    echo "FAIL: Prettier formatting check failed"
    echo "$output"
    echo "Run 'pnpm exec prettier --write .' to fix"
    exit 1
  fi
  echo "    ✓ Formatting check passed"

  echo "=== PASS ==="

else
  echo "=== Agent Full Check ==="

  echo "[1/3] Astro TypeScript check..."
  if ! pnpm exec astro check; then
    echo "FAIL: Astro check failed"
    exit 2
  fi

  echo "[2/3] Build (verbose)..."
  if ! pnpm build; then
    echo "FAIL: Build failed"
    exit 3
  fi

  echo "[3/3] Prettier formatting check..."
  if ! pnpm exec prettier --check .; then
    echo "FAIL: Prettier formatting check failed"
    echo "Run 'pnpm exec prettier --write .' to fix"
    exit 1
  fi

  echo "=== PASS ==="
fi
