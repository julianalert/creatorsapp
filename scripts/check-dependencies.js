#!/usr/bin/env node

/**
 * Dependency Security Audit Script
 * 
 * Checks for known vulnerabilities in dependencies and provides
 * recommendations for updates.
 * 
 * Run: npm run check-dependencies
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Checking dependencies for security vulnerabilities...\n')

try {
  // Run npm audit
  console.log('Running npm audit...')
  const auditOutput = execSync('npm audit --json', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  })

  const audit = JSON.parse(auditOutput)

  if (audit.vulnerabilities) {
    const total = Object.keys(audit.vulnerabilities).length
    const critical = Object.values(audit.vulnerabilities).filter(v => v.severity === 'critical').length
    const high = Object.values(audit.vulnerabilities).filter(v => v.severity === 'high').length
    const moderate = Object.values(audit.vulnerabilities).filter(v => v.severity === 'moderate').length
    const low = Object.values(audit.vulnerabilities).filter(v => v.severity === 'low').length

    console.log(`\n📊 Vulnerability Summary:`)
    console.log(`   Total: ${total}`)
    console.log(`   Critical: ${critical}`)
    console.log(`   High: ${high}`)
    console.log(`   Moderate: ${moderate}`)
    console.log(`   Low: ${low}\n`)

    if (critical > 0 || high > 0) {
      console.log('🔴 CRITICAL/HIGH vulnerabilities found!\n')
      console.log('Vulnerable packages:')
      
      Object.entries(audit.vulnerabilities).forEach(([name, vuln]) => {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          console.log(`\n  ${name}:`)
          console.log(`    Severity: ${vuln.severity.toUpperCase()}`)
          console.log(`    Issues: ${vuln.via.length}`)
          vuln.via.slice(0, 3).forEach(via => {
            if (typeof via === 'string') {
              console.log(`    - ${via}`)
            } else {
              console.log(`    - ${via.title} (${via.url || 'No URL'})`)
            }
          })
        }
      })

      console.log('\n⚠️  Action Required:')
      console.log('   1. Run: npm audit fix')
      console.log('   2. Review breaking changes')
      console.log('   3. Test thoroughly')
      console.log('   4. Update package-lock.json\n')
      
      process.exit(1)
    } else if (moderate > 0) {
      console.log('🟡 Moderate vulnerabilities found.')
      console.log('   Consider running: npm audit fix\n')
      process.exit(0)
    } else {
      console.log('✅ No critical or high severity vulnerabilities found!\n')
      process.exit(0)
    }
  } else {
    console.log('✅ No vulnerabilities found!\n')
    process.exit(0)
  }
} catch (error) {
  if (error.status === 1) {
    // npm audit returns exit code 1 when vulnerabilities are found
    // This is expected, we've already handled it above
    process.exit(1)
  } else {
    console.error('❌ Error running npm audit:', error.message)
    console.log('\nTry running manually: npm audit')
    process.exit(1)
  }
}

