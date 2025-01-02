# Contributing to GroundSchoolAI

## Development Setup Checklist

Before pushing changes or creating a pull request, please ensure:

### 1. Dependencies
- [ ] All dependencies are installed: `npm install --legacy-peer-deps`
- [ ] No unused dependencies: `npm prune`
- [ ] Dependencies are up to date: `npm outdated`
- [ ] No duplicate dependencies: `npm dedupe`

### 2. Environment
- [ ] All required environment variables are set:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - PAYSTACK_SECRET_KEY
  - ANTHROPIC_API_KEY
- [ ] Node.js version matches the project requirement (v18)

### 3. Code Quality
- [ ] TypeScript checks pass: `npm run test`
- [ ] Build succeeds locally: `npx expo export`
- [ ] No console errors when running the app

### 4. Git
- [ ] Changes are committed to the correct branch
- [ ] Commit messages follow the conventional commit format
- [ ] No sensitive information in commits

### 5. Testing
Before pushing:
```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps

# Run tests
npm test

# Build
npx expo export
```

## Common Issues and Solutions

### Build Failures
1. **Module Resolution Issues**
   - Clean install dependencies
   - Check metro.config.js for proper module aliases
   - Ensure all platform-specific files are properly configured

2. **Environment Variables**
   - Verify all required environment variables are set
   - Check for proper formatting in .env files

3. **TypeScript Errors**
   - Run `tsc --noEmit` to check for type errors
   - Ensure proper types are installed for all dependencies

### CI/CD Pipeline
The GitHub Actions workflow includes:
- Dependency caching
- Proper Node.js setup
- Environment variable handling
- Build artifact upload

## Need Help?
- Check the [documentation](./README.md)
- Open an issue with detailed information about your problem
- Include relevant error messages and logs
