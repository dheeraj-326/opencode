import type { Plugin } from "@opencode-ai/plugin"

/**
 * CommandReviewPlugin — safety review for bash commands.
 *
 * This plugin hooks into `tool.execute.before` and blocks any bash command
 * that matches dangerous patterns. Safe commands (git status, ls, uv run, pytest, etc.)
 * are approved immediately.
 */

const CommandReviewPlugin: Plugin = async ({ directory }) => {
  // Patterns that are always considered safe — no review needed.
  const SAFE_PATTERNS: RegExp[] = [
    /^git\s+(status|log|diff|show|branch|remote|config\s+--get)/,
    /^ls\s+/,
    /^pwd$/,
    /^uv\s+(run|pip|sync|lock|tree)/,
    /^pytest\s+/,
    /^python\s+-m\s+pytest/,
    /^cat\s+/,
    /^grep\s+/,
    /^head\s+/,
    /^tail\s+/,
    /^find\s+/,
    /^wc\s+/,
    /^sort\s+/,
    /^uniq\s+/,
    /^printenv/,
    /^env\s+/,
    /^which\s+/,
    /^whoami$/,
    /^hostname$/,
    /^uname/,
    /^df\s+/,
    /^du\s+/,
    /^stat\s+/,
    /^file\s+/,
    /^realpath\s+/,
    /^tput\s+/,
    /^stty\s+/,
    /^echo\s+/,
    /^test\s+/,
    /^\[\s+/,
    /^bun\s+typecheck/,
    /^bun\s+run/,
    /^bun\s+test/,
    /^npm\s+/,
    /^pnpm\s+/,
    /^yarn\s+/,
    /^cd\s+/,
    /^mkdir\s+/,
    /^touch\s+/,
    /^cp\s+/,
    /^mv\s+/,
    /^chmod\s+/,
    /^chown\s+/,
  ]

  // Patterns that are always considered dangerous — blocked immediately.
  const DANGEROUS_PATTERNS: RegExp[] = [
    /^rm\s+.*-rf/,
    /^rm\s+.*\s+\//,
    /^sudo\s+/,
    /^su\s+/,
    /^dd\s+/,
    /^mkfs/,
    /^fdisk/,
    /^format\s+/,
    /^>:?\s*\/etc/,
    /^>:?\s*\/usr/,
    /^>:?\s*\/bin/,
    /^>:?\s*\/sbin/,
    /^>:?\s*\/lib/,
    /^>:?\s*\/boot/,
    /^>:?\s*\/dev/,
    /^>:?\s*\/sys/,
    /^>:?\s*\/proc/,
    /^shred\s+/,
    /^>:?\s*~\/\.ssh/,
    /^>:?\s*~\/\.gnupg/,
    /^>:?\s*~\/\.config/,
    /^curl\s+.*\|\s*sh/,
    /^curl\s+.*\|\s*bash/,
    /^wget\s+.*\|\s*sh/,
    /^wget\s+.*\|\s*bash/,
    /^eval\s+/,
    /^exec\s+/,
    /^systemctl\s+(stop|restart|disable|mask)/,
    /^service\s+(stop|restart)/,
    /^killall\s+/,
    /^pkill\s+/,
    /^kill\s+-9/,
    /^chmod\s+.*777/,
    /^chmod\s+.*666/,
    /^chown\s+.*root/,
    /passwd\s+--stdin/,
    /usermod\s+/,
    /userdel\s+/,
    /groupdel\s+/,
    /^git\s+push\s+.*--force/,
    /^git\s+push\s+.*-f/,
    /^git\s+reset\s+--hard/,
    /^git\s+clean\s+-fd/,
    /^git\s+branch\s+-D/,
    /^docker\s+rm\s+.*-f/,
    /^docker\s+system\s+prune/,
    /^docker\s+volume\s+rm/,
    /^npm\s+publish/,
    /^yarn\s+publish/,
    /^pnpm\s+publish/,
    /^brew\s+uninstall/,
    /^brew\s+remove/,
    /^pip\s+uninstall/,
    /^pip\s+.*--force-reinstall/,
    /^npm\s+uninstall/,
    /^yarn\s+remove/,
    /^pnpm\s+remove/,
    /^gem\s+uninstall/,
    /^cargo\s+uninstall/,
    /^go\s+get\s+.*@/,
    /^terraform\s+destroy/,
    /^pulumi\s+destroy/,
    /^serverless\s+remove/,
    /^kubectl\s+delete/,
    /^helm\s+delete/,
    /^helm\s+uninstall/,
    /^aws\s+.*delete/,
    /^gcloud\s+.*delete/,
    /^az\s+.*delete/,
    /^firebase\s+.*delete/,
    /^netlify\s+.*delete/,
    /^vercel\s+.*delete/,
    /^flyctl\s+.*destroy/,
    /^heroku\s+.*destroy/,
    /^railway\s+.*delete/,
    /^render\s+.*delete/,
    /^supabase\s+.*delete/,
    /^planetscale\s+.*delete/,
    /^neon\s+.*delete/,
    /^mongo\s+.*drop/,
    /^mongosh\s+.*drop/,
    /^redis-cli\s+.*FLUSH/,
    /^redis-cli\s+.*SHUTDOWN/,
    /^mysql\s+.*DROP/,
    /^psql\s+.*DROP/,
    /^sqlite3\s+.*DROP/,
    /^sqlcipher\s+.*drop/,
    /^pg_dump\s+.*-c/,
    /^pg_restore\s+.*-c/,
    /^dropdb\s+/,
    /^createdb\s+.*--replace/,
  ]

  function isSafe(command: string): boolean {
    return SAFE_PATTERNS.some((p) => p.test(command))
  }

  function isDangerous(command: string): boolean {
    return DANGEROUS_PATTERNS.some((p) => p.test(command))
  }

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return

      const command: string = output.args.command
      if (!command) return

      // Fast-path: known-safe commands skip review entirely.
      if (isSafe(command)) {
        console.log(`[command-review] ALLOWED (safe pattern): ${command}`)
        return
      }

      // Fast-path: known-dangerous commands are blocked immediately.
      if (isDangerous(command)) {
        console.log(`[command-review] BLOCKED (dangerous pattern): ${command}`)
        throw new Error(
          `🚫 Command blocked by safety review\n\n` +
            `Reason: Command matches a dangerous pattern that could cause irreversible damage.\n\n` +
            `If you want to run it manually, copy the command below:\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `${command}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
      }

      // Commands that are neither safe nor dangerous are allowed through
      // but logged for auditability.
      console.log(`[command-review] ALLOWED (unknown, logged): ${command}`)
    },
  }
}

export default CommandReviewPlugin
