#!/usr/bin/env python3
import re

print("Applying Bug #11 fixes...")

# Fix #11.1: Add session assignment to login endpoint
print("Fix #11.1: Adding req.session.userId to login endpoint...")
with open('server/routes.ts', 'r') as f:
    content = f.read()

# Find the login endpoint and add session assignment after password verification
# Look for the pattern after password verification, before JWT generation
pattern = r'(// Verify password.*?if \(!isValidPassword\) \{.*?\}\s*})\s*(// Generate JWT token)'
replacement = r'\1\n\n    // Set session userId for session-based auth\n    req.session.userId = user.id;\n\n    \2'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('server/routes.ts', 'w') as f:
    f.write(content)
print("✓ Fix #11.1 complete")

# Fix #11.2: Simplify auth checks in preview/download endpoints
print("Fix #11.2: Simplifying auth checks...")
with open('server/routes.ts', 'r') as f:
    content = f.read()

# Replace all occurrences of "req.session?.userId || req.user?.id" with just "req.session?.userId"
content = content.replace('req.session?.userId || req.user?.id', 'req.session?.userId')

with open('server/routes.ts', 'w') as f:
    f.write(content)
print("✓ Fix #11.2 complete")

# Fix #11.3 & #11.4: Update apiRequest in client/src/lib/api.ts
print("Fix #11.3 & #11.4: Updating apiRequest...")
with open('client/src/lib/api.ts', 'r') as f:
    content = f.read()

# Find the apiRequest function and update it
# Add credentials: 'include' and remove JWT Authorization header logic
pattern = r'(export const apiRequest = async \(url: string, options: RequestInit = \{\}\) => \{\s*)// Build headers.*?\}\);'
replacement = r'''\1// Build headers with session credentials
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send session cookies
  });'''
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('client/src/lib/api.ts', 'w') as f:
    f.write(content)
print("✓ Fix #11.3 & #11.4 complete")

print("\n✅ All Bug #11 backend and frontend fixes applied!")
print("Next: Remove localStorage JWT from Login component manually")
