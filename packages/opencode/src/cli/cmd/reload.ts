import { Effect } from "effect"
import { createOpencodeClient } from "@opencode-ai/sdk/v2"
import { effectCmd, fail } from "../effect-cmd"

export const ReloadCommand = effectCmd({
  command: "reload",
  describe:
    "reload config, permissions, LLM/provider settings, AGENTS.md instructions, plugins, commands, skills",
  instance: false,
  handler: Effect.fn("Cli.reload")(function* () {
    const { Server } = yield* Effect.promise(() => import("@/server/server"))
    const url =
      Server.url ??
      (process.env.OPENCODE_SERVER_URL ? new URL(process.env.OPENCODE_SERVER_URL) : undefined)
    if (!url)
      return yield* fail(
        "no running opencode server — reload targets a running instance (start one via `opencode serve` or run a TUI first)",
        1,
      )

    const client = createOpencodeClient({ baseUrl: url.toString() })
    yield* Effect.promise(() => client.instance.reload({ workspace: "default" }))

    process.stdout.write(`Reloaded ~/.config/opencode/opencode.jsonc\n`)
    process.stdout.write(`  ✓ Permissions (ruleset rebuilt)\n`)
    process.stdout.write(`  ✓ LLM/Provider settings (catalog rebuilt)\n`)
    process.stdout.write(`  ✓ System instructions (AGENTS.md / CLAUDE.md / cfg.instructions)\n`)
    process.stdout.write(`  ✓ Plugins (re-imported from cfg.plugin)\n`)
    process.stdout.write(`  ✓ Commands (cfg.command + MCP prompts + skills rebuilt)\n`)
    process.stdout.write(`  ✓ Agents (mode/permission re-resolved)\n`)
    process.stdout.write(`  ✓ Skills, LSP, Format, Vcs, Snapshot state\n`)
  }),
})
