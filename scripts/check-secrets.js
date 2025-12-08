#!/usr/bin/env node

/**
 * Security Check: Verify Service Role Key is Never Exposed
 * 
 * This script checks that the SUPABASE_SERVICE_ROLE_KEY is never
 * exposed in client-side code or public files.
 * 
 * Run this as part of your build process or CI/CD pipeline.
 */

const fs = require('fs')
const path = require('path')

const FORBIDDEN_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY/,
  /service.*role.*key/i,
  /service_role_key/i,
]

const ALLOWED_FILES = [
  // Server-side API routes are allowed to use service role key
  /app\/api\/.*\.ts$/,
  /app\/api\/.*\.js$/,
  // Environment files are allowed (but should be gitignored)
  /\.env/,
  // Documentation is allowed
  /\.md$/,
  // Build scripts are allowed
  /scripts\/.*\.js$/,
  /scripts\/.*\.ts$/,
]

const CLIENT_SIDE_PATTERNS = [
  /^app\/\(.*\)\/.*\.tsx$/,
  /^app\/\(.*\)\/.*\.jsx$/,
  /^components\/.*\.tsx$/,
  /^components\/.*\.jsx$/,
  /^lib\/supabase\/client\.ts$/,
  /^lib\/supabase\/middleware\.ts$/,
]

function isAllowedFile(filePath) {
  return ALLOWED_FILES.some(pattern => pattern.test(filePath))
}

function isClientSideFile(filePath) {
  return CLIENT_SIDE_PATTERNS.some(pattern => pattern.test(filePath))
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []

  FORBIDDEN_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      // Check if it's in a comment or string (less critical)
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          // Check if it's in a comment
          const commentMatch = line.match(/\/\/.*|<!--.*-->|\/\*.*\*\//)
          if (!commentMatch || line.indexOf(pattern.source) < line.indexOf(commentMatch[0])) {
            issues.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              severity: isClientSideFile(filePath) ? 'CRITICAL' : 'WARNING',
            })
          }
        }
      })
    }
  })

  return issues
}

function scanDirectory(dir, issues = []) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file === 'node_modules' || file === '.next' || file === '.git') {
        return
      }
      scanDirectory(filePath, issues)
    } else if (stat.isFile()) {
      // Only check TypeScript, JavaScript, and TSX/JSX files
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        // Skip if it's an allowed file (server-side API routes)
        if (!isAllowedFile(filePath)) {
          const fileIssues = checkFile(filePath)
          issues.push(...fileIssues)
        }
      }
    }
  })

  return issues
}

// Main execution
console.log('🔒 Checking for service role key exposure...\n')

const rootDir = path.join(__dirname, '..')
const issues = scanDirectory(rootDir)

if (issues.length === 0) {
  console.log('✅ No issues found! Service role key is secure.')
  process.exit(0)
}

console.log(`❌ Found ${issues.length} potential issue(s):\n`)

const criticalIssues = issues.filter(i => i.severity === 'CRITICAL')
const warnings = issues.filter(i => i.severity === 'WARNING')

if (criticalIssues.length > 0) {
  console.log('🔴 CRITICAL ISSUES (Service role key in client-side code):\n')
  criticalIssues.forEach(issue => {
    console.log(`  File: ${issue.file}`)
    console.log(`  Line: ${issue.line}`)
    console.log(`  Content: ${issue.content.substring(0, 80)}...`)
    console.log('')
  })
}

if (warnings.length > 0) {
  console.log('🟡 WARNINGS (Service role key in server-side code - verify it\'s not exposed):\n')
  warnings.forEach(issue => {
    console.log(`  File: ${issue.file}`)
    console.log(`  Line: ${issue.line}`)
    console.log(`  Content: ${issue.content.substring(0, 80)}...`)
    console.log('')
  })
}

if (criticalIssues.length > 0) {
  console.log('❌ Build failed: Service role key found in client-side code!')
  process.exit(1)
} else {
  console.log('⚠️  Warnings found. Please review the files above.')
  process.exit(0)
}

