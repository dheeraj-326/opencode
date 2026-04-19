A AI generated summary of all the workflows for my future reference.

1. CI/CD & Build:
   - test.yml - Unit and E2E tests
   - typecheck.yml - TypeScript type checking
   - generate.yml - Code generation
   - deploy.yml - Deployment to dev/production
   - publish.yml - Main release workflow (CLI, Desktop, Electron, Docker)
   - publish-github-action.yml - Publish GitHub Action
   - publish-vscode.yml - Publish VSCode extension
   - release-github-action.yml - Release GitHub Action
   - containers.yml - Build and push container images
   - storybook.yml - Build Storybook
   - nix-eval.yml - Nix flake evaluation
   - nix-hashes.yml - Compute and update Nix hashes
2. Issue & PR Management:
   - triage.yml - Triage new issues
   - duplicate-issues.yml - Check for duplicate issues
   - close-issues.yml - Close stale issues
   - close-stale-prs.yml - Close stale PRs
   - pr-management.yml - PR duplicate checking and contributor labeling
   - pr-standards.yml - Check PR title format and template compliance
   - compliance-close.yml - Close non-compliant issues/PRs after 2 hours
   - review.yml - PR review via /review command
   - opencode.yml - Run opencode via /oc or /opencode command
3. Community & Governance:
   - vouch-check-issue.yml - Check if issue author is denounced/vouched
   - vouch-check-pr.yml - Check if PR author is denounced/vouched
   - vouch-manage-by-issue.yml - Manage vouched users via issue comments
   
4. Documentation:
   - docs-update.yml - Update documentation based on recent commits
   - docs-locale-sync.yml - Sync localized docs with English changes
   
5. External Integrations:
   - sync-zed-extension.yml - Sync Zed extension releases
   - notify-discord.yml - Post release notifications to Discord
   - daily-issues-recap.yml - Daily summary of community issues
   - daily-pr-recap.yml - Daily summary of community PRs
   - stats.yml - Track and report download metrics
   
6. Project Maintenance:
   - beta.yml - Maintain beta branch synchronization
   - roam.yml - Execute code quality assessments