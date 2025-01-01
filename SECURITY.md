## Known Development Dependencies Vulnerabilities

### Current Status (as of January 1, 2025)

The following vulnerabilities have been identified in development dependencies:

1. **ip Package** (High Severity)
   - Issue: SSRF improper categorization in isPublic
   - Affected Package: `ip` in `@react-native-community/cli-doctor`
   - Advisory: https://github.com/advisories/GHSA-2p57-rm9w-gvfp
   - Status: Known issue in development tooling, not affecting production code

2. **semver Package** (High Severity)
   - Issue: Regular Expression Denial of Service
   - Affected Package: `semver` in `@expo/image-utils`
   - Advisory: https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
   - Status: Development dependency only

3. **send Package** (High Severity)
   - Issue: Template injection vulnerability leading to XSS
   - Affected Package: `send` in `@expo/cli`
   - Advisory: https://github.com/advisories/GHSA-m6fv-jmcg-4jfg
   - Status: Development tooling only

### Impact Assessment

These vulnerabilities are present in development dependencies only and do not affect the production build of the application. They are primarily found in:
- React Native CLI tools
- Expo development tools
- Build and development utilities

### Mitigation

1. These vulnerabilities do not affect end users or production deployments
2. The development tools are used in a trusted environment
3. We are tracking upstream fixes in React Native and Expo

### Update Plan

We will update these dependencies when new stable versions of our core frameworks (React Native and Expo) are released that address these issues.

<!-- BEGIN MICROSOFT SECURITY.MD V0.0.9 BLOCK -->

## Security

Microsoft takes the security of our software products and services seriously, which includes all source code repositories managed through our GitHub organizations, which include [Microsoft](https://github.com/Microsoft), [Azure](https://github.com/Azure), [DotNet](https://github.com/dotnet), [AspNet](https://github.com/aspnet) and [Xamarin](https://github.com/xamarin).

If you believe you have found a security vulnerability in any Microsoft-owned repository that meets [Microsoft's definition of a security vulnerability](https://aka.ms/security.md/definition), please report it to us as described below.

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them to the Microsoft Security Response Center (MSRC) at [https://msrc.microsoft.com/create-report](https://aka.ms/security.md/msrc/create-report).

If you prefer to submit without logging in, send email to [secure@microsoft.com](mailto:secure@microsoft.com).  If possible, encrypt your message with our PGP key; please download it from the [Microsoft Security Response Center PGP Key page](https://aka.ms/security.md/msrc/pgp).

You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message. Additional information can be found at [microsoft.com/msrc](https://www.microsoft.com/msrc). 

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

  * Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
  * Full paths of source file(s) related to the manifestation of the issue
  * The location of the affected source code (tag/branch/commit or direct URL)
  * Any special configuration required to reproduce the issue
  * Step-by-step instructions to reproduce the issue
  * Proof-of-concept or exploit code (if possible)
  * Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

If you are reporting for a bug bounty, more complete reports can contribute to a higher bounty award. Please visit our [Microsoft Bug Bounty Program](https://aka.ms/security.md/msrc/bounty) page for more details about our active programs.

## Preferred Languages

We prefer all communications to be in English.

## Policy

Microsoft follows the principle of [Coordinated Vulnerability Disclosure](https://aka.ms/security.md/cvd).

<!-- END MICROSOFT SECURITY.MD BLOCK -->
