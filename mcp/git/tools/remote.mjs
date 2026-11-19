/**
 * Р Р°Р±РѕС‚Р° СЃ СѓРґР°Р»С‘РЅРЅС‹РјРё СЂРµРїРѕР·РёС‚РѕСЂРёСЏРјРё: remotes, fetch, pull, push, clone, init.
 */
import { ToolError } from "../lib/exec.mjs";
import { resolveExistingDir, resolveTargetPath } from "../lib/paths.mjs";
import { failure, gitAction, requireConfirm, toList } from "../lib/toolkit.mjs";

const cwdSchema = (z) =>
  z.string().optional().describe("РљР°С‚Р°Р»РѕРі СЂРµРїРѕР·РёС‚РѕСЂРёСЏ. РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ вЂ” РєРѕСЂРµРЅСЊ РїСЂРѕРµРєС‚Р°.");

export function registerRemoteTools(server, z) {
  server.registerTool(
    "git_remote",
    {
      title: "РЈРїСЂР°РІР»РµРЅРёРµ remotes",
      description:
        "  action=list вЂ” remotes Рё URL\n" +
        "  action=add вЂ” name + url\n" +
        "  action=remove вЂ” name (С‚СЂРµР±СѓРµС‚ confirm=true)\n" +
        "  action=rename вЂ” name + new_name\n" +
        "  action=set_url / get_url вЂ” name + url (push=true РґР»СЏ push-URL)\n" +
        "  action=show вЂ” РїРѕРґСЂРѕР±РЅРѕСЃС‚Рё Рѕ remote\n" +
        "  action=prune вЂ” СѓРґР°Р»РёС‚СЊ СѓСЃС‚Р°СЂРµРІС€РёРµ remote-РІРµС‚РєРё",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "add", "remove", "rename", "set_url", "get_url", "show", "prune"]).default("list"),
        name: z.string().optional().describe("РРјСЏ remote, РЅР°РїСЂРёРјРµСЂ origin"),
        new_name: z.string().optional(),
        url: z.string().optional(),
        push: z.boolean().default(false).describe("Р”Р»СЏ set_url/get_url вЂ” push-URL"),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, name, new_name, url, push, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "list") return await gitAction(["remote", "-v"], { cwd: dir, label: "git remote", emptyMessage: "Remotes РЅРµ РЅР°СЃС‚СЂРѕРµРЅС‹." });

        if (action === "add") {
          if (!name || !url) throw new ToolError("РЈРєР°Р¶Рё name Рё url.");
          return await gitAction(["remote", "add", name, url], { cwd: dir, mutating: true, label: "git remote add" });
        }
        if (!name) throw new ToolError("РЈРєР°Р¶Рё name.");
        if (action === "remove") {
          requireConfirm(confirm, `git remote remove ${name}`, " Р›РѕРєР°Р»СЊРЅС‹Рµ remote-РІРµС‚РєРё СЌС‚РѕРіРѕ remote С‚РѕР¶Рµ РёСЃС‡РµР·РЅСѓС‚.");
          return await gitAction(["remote", "remove", name], { cwd: dir, mutating: true, label: "git remote remove" });
        }
        if (action === "rename") {
          if (!new_name) throw new ToolError("РЈРєР°Р¶Рё new_name.");
          return await gitAction(["remote", "rename", name, new_name], { cwd: dir, mutating: true, label: "git remote rename" });
        }
        if (action === "set_url") {
          if (!url) throw new ToolError("РЈРєР°Р¶Рё url.");
          const args = ["remote", "set-url"];
          if (push) args.push("--push");
          args.push(name, url);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git remote set-url" });
        }
        if (action === "get_url") {
          const args = ["remote", "get-url"];
          if (push) args.push("--push");
          args.push(name);
          return await gitAction(args, { cwd: dir, label: "git remote get-url" });
        }
        if (action === "show") {
          return await gitAction(["remote", "show", name], { cwd: dir, label: "git remote show" });
        }
        return await gitAction(["remote", "prune", name], { cwd: dir, mutating: true, label: "git remote prune" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_fetch",
    {
      title: "Р—Р°Р±СЂР°С‚СЊ РёР·РјРµРЅРµРЅРёСЏ (fetch)",
      description:
        "РЎРєР°С‡РёРІР°РµС‚ РѕР±СЉРµРєС‚С‹ Рё РѕР±РЅРѕРІР»СЏРµС‚ remote-РІРµС‚РєРё, РЅРµ РјРµРЅСЏСЏ СЂР°Р±РѕС‡СѓСЋ РєРѕРїРёСЋ.\n\n" +
        "  remote вЂ” РёРјСЏ remote (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ origin); all=true вЂ” РІСЃРµ remotes\n" +
        "  refspecs вЂ” РєРѕРЅРєСЂРµС‚РЅС‹Рµ РІРµС‚РєРё/С‚РµРіРё\n" +
        "  prune вЂ” СѓРґР°Р»РёС‚СЊ РёСЃС‡РµР·РЅСѓРІС€РёРµ remote-РІРµС‚РєРё; tags вЂ” Р·Р°Р±СЂР°С‚СЊ С‚РµРіРё\n" +
        "  depth вЂ” shallow-РіР»СѓР±РёРЅР°; dry_run вЂ” РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ",
      inputSchema: {
        cwd: cwdSchema(z),
        remote: z.string().optional(),
        refspecs: z.union([z.string(), z.array(z.string())]).optional(),
        all: z.boolean().default(false),
        prune: z.boolean().default(false),
        tags: z.boolean().default(false),
        depth: z.number().int().min(1).optional(),
        force: z.boolean().default(false),
        dry_run: z.boolean().default(false),
      },
    },
    async ({ cwd, remote, refspecs, all, prune, tags, depth, force, dry_run }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["fetch"];
        if (all) args.push("--all");
        if (prune) args.push("--prune");
        if (tags) args.push("--tags");
        if (depth) args.push(`--depth=${depth}`);
        if (force) args.push("--force");
        if (dry_run) args.push("--dry-run");
        const specs = toList(refspecs);
        if (!all && remote) args.push(remote);
        if (specs.length) args.push(...specs);
        return await gitAction(args, { cwd: dir, timeout: 600_000, label: "git fetch" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_pull",
    {
      title: "Р—Р°Р±СЂР°С‚СЊ Рё РІР»РёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ (pull)",
      description:
        "git fetch + merge/rebase.\n\n" +
        "  remote вЂ” РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РЅР°СЃС‚СЂРѕРµРЅРЅС‹Р№ upstream (РѕР±С‹С‡РЅРѕ origin)\n" +
        "  branch вЂ” РєР°РєСѓСЋ РІРµС‚РєСѓ РІР»РёРІР°С‚СЊ\n" +
        "  rebase=true вЂ” РІРјРµСЃС‚Рѕ merge РґРµР»Р°С‚СЊ rebase\n" +
        "  ff_only=true вЂ” СЂР°Р·СЂРµС€РёС‚СЊ С‚РѕР»СЊРєРѕ fast-forward\n" +
        "  autostash, no_commit, tags, depth",
      inputSchema: {
        cwd: cwdSchema(z),
        remote: z.string().optional(),
        branch: z.string().optional(),
        rebase: z.boolean().default(false),
        ff_only: z.boolean().default(false),
        autostash: z.boolean().default(false),
        no_commit: z.boolean().default(false),
        tags: z.boolean().default(false),
        depth: z.number().int().min(1).optional(),
      },
    },
    async ({ cwd, remote, branch, rebase, ff_only, autostash, no_commit, tags, depth }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["pull"];
        if (rebase) args.push("--rebase");
        if (ff_only) args.push("--ff-only");
        if (autostash) args.push("--autostash");
        if (no_commit) args.push("--no-commit");
        if (tags) args.push("--tags");
        if (depth) args.push(`--depth=${depth}`);
        if (remote) args.push(remote);
        if (branch) args.push(branch);
        return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], timeout: 600_000, label: "git pull" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_push",
    {
      title: "РћС‚РїСЂР°РІРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ (push)",
      description:
        "  remote вЂ” РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ origin\n" +
        "  branch вЂ” РєР°РєСѓСЋ РІРµС‚РєСѓ РїСѓС€РёС‚СЊ (РёР»Рё refspecs РґР»СЏ СЃР»РѕР¶РЅС‹С… СЃР»СѓС‡Р°РµРІ)\n" +
        "  set_upstream=true вЂ” git push -u\n" +
        "  force вЂ” none|with_lease|force (force Рё with_lease С‚СЂРµР±СѓСЋС‚ confirm=true)\n" +
        "  delete=true вЂ” СѓРґР°Р»РёС‚СЊ remote-РІРµС‚РєСѓ (С‚СЂРµР±СѓРµС‚ confirm=true)\n" +
        "  tags, all, atomic, no_verify, dry_run",
      inputSchema: {
        cwd: cwdSchema(z),
        remote: z.string().default("origin"),
        branch: z.string().optional(),
        refspecs: z.union([z.string(), z.array(z.string())]).optional(),
        set_upstream: z.boolean().default(false),
        force: z.enum(["none", "with_lease", "force"]).default("none"),
        delete: z.boolean().default(false),
        tags: z.boolean().default(false),
        all: z.boolean().default(false),
        atomic: z.boolean().default(false),
        no_verify: z.boolean().default(false),
        dry_run: z.boolean().default(false),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, remote, branch, refspecs, set_upstream, force, delete: deleteRemote, tags, all, atomic, no_verify, dry_run, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["push"];
        if (set_upstream) args.push("--set-upstream");
        if (force === "with_lease") {
          requireConfirm(confirm, "git push --force-with-lease", " РџРµСЂРµР·Р°РїРёСЃСЊ РёСЃС‚РѕСЂРёРё РЅР° remote.");
          args.push("--force-with-lease");
        }
        if (force === "force") {
          requireConfirm(confirm, "git push --force", " РџРµСЂРµР·Р°РїРёСЃСЊ РёСЃС‚РѕСЂРёРё РЅР° remote вЂ” С‡СѓР¶РёРµ РєРѕРјРјРёС‚С‹ РјРѕРіСѓС‚ Р±С‹С‚СЊ РїРѕС‚РµСЂСЏРЅС‹.");
          args.push("--force");
        }
        if (deleteRemote) {
          requireConfirm(confirm, "git push --delete", " Р’РµС‚РєР° Р±СѓРґРµС‚ СѓРґР°Р»РµРЅР° РЅР° remote.");
          args.push("--delete");
        }
        if (tags) args.push("--tags");
        if (all) args.push("--all");
        if (atomic) args.push("--atomic");
        if (no_verify) args.push("--no-verify");
        if (dry_run) args.push("--dry-run");
        args.push(remote);
        if (branch) args.push(branch);
        args.push(...toList(refspecs));
        if (!branch && !refspecs && !all && !tags) {
          throw new ToolError("РЈРєР°Р¶Рё branch, Р»РёР±Рѕ refspecs, all=true РёР»Рё tags=true.");
        }
        return await gitAction(args, { cwd: dir, mutating: !dry_run, timeout: 600_000, label: "git push" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_clone",
    {
      title: "РљР»РѕРЅРёСЂРѕРІР°С‚СЊ СЂРµРїРѕР·РёС‚РѕСЂРёР№",
      description:
        "РљР»РѕРЅРёСЂСѓРµС‚ СЂРµРїРѕР·РёС‚РѕСЂРёР№ РІ РєР°С‚Р°Р»РѕРі РІРЅСѓС‚СЂРё СЂР°Р·СЂРµС€С‘РЅРЅРѕР№ Р·РѕРЅС‹.\n\n" +
        "  url вЂ” HTTPS/SSH/Р»РѕРєР°Р»СЊРЅС‹Р№ РїСѓС‚СЊ\n" +
        "  target вЂ” РєР°С‚Р°Р»РѕРі (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РёРјСЏ СЂРµРїРѕР·РёС‚РѕСЂРёСЏ СЂСЏРґРѕРј СЃ С‚РµРєСѓС‰РёРј)\n" +
        "  depth, branch, bare, recursive (РїРѕРґРјРѕРґСѓР»Рё), mirror, single_branch, no_checkout",
      inputSchema: {
        cwd: cwdSchema(z),
        url: z.string().describe("URL РёР»Рё РїСѓС‚СЊ Рє СЂРµРїРѕР·РёС‚РѕСЂРёСЋ"),
        target: z.string().optional().describe("РљСѓРґР° РєР»РѕРЅРёСЂРѕРІР°С‚СЊ"),
        depth: z.number().int().min(1).optional(),
        branch: z.string().optional(),
        bare: z.boolean().default(false),
        recursive: z.boolean().default(false),
        mirror: z.boolean().default(false),
        single_branch: z.boolean().default(false),
        no_checkout: z.boolean().default(false),
      },
    },
    async ({ cwd, url, target, depth, branch, bare, recursive, mirror, single_branch, no_checkout }) => {
      try {
        const base = resolveExistingDir(cwd);
        const args = ["clone"];
        if (depth) args.push(`--depth=${depth}`);
        if (branch) args.push("--branch", branch);
        if (bare) args.push("--bare");
        if (recursive) args.push("--recurse-submodules");
        if (mirror) args.push("--mirror");
        if (single_branch) args.push("--single-branch");
        if (no_checkout) args.push("--no-checkout");
        args.push(url);
        if (target) args.push(resolveTargetPath(target));
        return await gitAction(args, { cwd: base, mutating: true, timeout: 900_000, label: "git clone" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_init",
    {
      title: "РРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°С‚СЊ СЂРµРїРѕР·РёС‚РѕСЂРёР№",
      description: "git init РІ РєР°С‚Р°Р»РѕРіРµ. РњРѕР¶РЅРѕ Р·Р°РґР°С‚СЊ РёРјСЏ РѕСЃРЅРѕРІРЅРѕР№ РІРµС‚РєРё (main) Рё bare-СЂРµР¶РёРј.",
      inputSchema: {
        cwd: cwdSchema(z),
        directory: z.string().optional().describe("РљР°С‚Р°Р»РѕРі (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ cwd)"),
        bare: z.boolean().default(false),
        initial_branch: z.string().optional().describe("РќР°РїСЂРёРјРµСЂ main"),
        shared: z.boolean().default(false).describe("--shared: РїСЂР°РІР° РЅР° РіСЂСѓРїРїСѓ"),
      },
    },
    async ({ cwd, directory, bare, initial_branch, shared }) => {
      try {
        const base = resolveExistingDir(cwd);
        const target = resolveTargetPath(directory || ".");
        const args = ["init"];
        if (bare) args.push("--bare");
        if (shared) args.push("--shared");
        if (initial_branch) args.push("-b", initial_branch);
        args.push(target);
        return await gitAction(args, { cwd: base, mutating: true, label: "git init" });
      } catch (error) {
        return failure(error);
      }
    },
  );
}
