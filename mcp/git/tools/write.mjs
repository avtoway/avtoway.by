/**
 * Инструменты, изменяющие репозиторий: индекс, коммиты, ветки, история, stash, теги.
 *
 * Разрушительные операции (reset --hard, clean, удаление веток/тегов, stash drop)
 * требуют confirm=true.
 */
import { ToolError } from "../lib/exec.mjs";
import { resolveExistingDir } from "../lib/paths.mjs";
import { failure, gitAction, requireConfirm, toList } from "../lib/toolkit.mjs";

const cwdSchema = (z) =>
  z.string().optional().describe("Каталог репозитория. По умолчанию — корень проекта.");

const pathsSchema = (z, description) => z.union([z.string(), z.array(z.string())]).describe(description);

export function registerWriteTools(server, z) {
  server.registerTool(
    "git_add",
    {
      title: "Добавить файлы в индекс",
      description:
        "git add для указанных путей или всего репозитория.\n\n" +
        "  paths — файлы/каталоги\n" +
        "  all=true — все изменения, включая удаления (git add --all)\n" +
        "  update=true — только уже отслеживаемые файлы (git add -u)\n" +
        "  intent_to_add=true — git add -N (только намерение)\n" +
        "  dry_run=true — показать, что было бы добавлено",
      inputSchema: {
        cwd: cwdSchema(z),
        paths: z.union([z.string(), z.array(z.string())]).optional().describe("Файлы/каталоги (можно несколько)"),
        all: z.boolean().default(false),
        update: z.boolean().default(false),
        intent_to_add: z.boolean().default(false),
        force: z.boolean().default(false).describe("Добавить игнорируемые файлы (-f)"),
        dry_run: z.boolean().default(false),
      },
    },
    async ({ cwd, paths, all, update, intent_to_add, force, dry_run }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const list = toList(paths);
        if (!list.length && !all && !update) {
          throw new ToolError("Укажи paths, либо all=true, либо update=true.");
        }
        const args = ["add"];
        if (all) args.push("--all");
        if (update) args.push("--update");
        if (intent_to_add) args.push("--intent-to-add");
        if (force) args.push("--force");
        if (dry_run) args.push("--dry-run");
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, mutating: !dry_run, label: "git add" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_commit",
    {
      title: "Создать коммит",
      description:
        "Фиксирует изменения в индексе.\n\n" +
        "  message — сообщение (обязательно, если не amend=true)\n" +
        "  all=true — сначала git add -A для отслеживаемых (git commit -a)\n" +
        "  amend=true — исправить последний коммит (без message сохранит старое сообщение)\n" +
        "  no_verify=true — пропустить pre-commit/commit-msg хуки\n" +
        "  allow_empty=true, signoff=true, author='Имя <mail>'",
      inputSchema: {
        cwd: cwdSchema(z),
        message: z.string().optional().describe("Сообщение коммита (может быть многострочным)"),
        all: z.boolean().default(false),
        amend: z.boolean().default(false),
        no_verify: z.boolean().default(false),
        allow_empty: z.boolean().default(false),
        signoff: z.boolean().default(false),
        author: z.string().optional().describe("Переопределить автора: 'Имя <email>'"),
        date: z.string().optional().describe("Переопределить дату автора (ISO или '2 days ago')"),
      },
    },
    async ({ cwd, message, all, amend, no_verify, allow_empty, signoff, author, date }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (!message && !amend) throw new ToolError("Укажи message (или amend=true, чтобы сохранить прежнее сообщение).");
        const args = ["commit"];
        if (message) args.push("-m", message);
        else args.push("--no-edit");
        if (all) args.push("--all");
        if (amend) args.push("--amend");
        if (no_verify) args.push("--no-verify");
        if (allow_empty) args.push("--allow-empty");
        if (signoff) args.push("--signoff");
        if (author) args.push("--author", author);
        if (date) args.push("--date", date);
        return await gitAction(args, { cwd: dir, mutating: true, label: "git commit" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_rm",
    {
      title: "Удалить файлы",
      description:
        "Удаляет файлы из рабочей копии и индекса (git rm).\n" +
        "  cached=true — только из индекса (оставить на диске)\n" +
        "  recursive=true — удалить каталог\n" +
        "  force=true — принудительно, даже при локальных изменениях",
      inputSchema: {
        cwd: cwdSchema(z),
        paths: pathsSchema(z, "Файлы/каталоги"),
        cached: z.boolean().default(false),
        force: z.boolean().default(false),
        recursive: z.boolean().default(false),
        dry_run: z.boolean().default(false),
      },
    },
    async ({ cwd, paths, cached, force, recursive, dry_run }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["rm"];
        if (cached) args.push("--cached");
        if (force) args.push("--force");
        if (recursive) args.push("-r");
        if (dry_run) args.push("--dry-run");
        args.push("--", ...toList(paths));
        return await gitAction(args, { cwd: dir, mutating: !dry_run, label: "git rm" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_mv",
    {
      title: "Переместить/переименовать файл",
      description: "git mv — перемещает файл и сразу обновляет индекс. Полезно, чтобы сохранить историю файла.",
      inputSchema: {
        cwd: cwdSchema(z),
        from: z.string().describe("Текущий путь"),
        to: z.string().describe("Новый путь"),
        force: z.boolean().default(false),
      },
    },
    async ({ cwd, from, to, force }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["mv"];
        if (force) args.push("--force");
        args.push("--", from, to);
        return await gitAction(args, { cwd: dir, mutating: true, label: "git mv" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_restore",
    {
      title: "Восстановить файлы",
      description:
        "Отменяет изменения в файлах (git restore) — НЕ трогает коммиты.\n\n" +
        "  paths — что восстановить\n" +
        "  staged=true — убрать из индекса (рабочая копия сохранится, если worktree=false)\n" +
        "  worktree=true — восстановить и рабочую копию (по умолчанию)\n" +
        "  source — восстановить из указанного коммита/ветки",
      inputSchema: {
        cwd: cwdSchema(z),
        paths: pathsSchema(z, "Файлы/каталоги"),
        staged: z.boolean().default(false),
        worktree: z.boolean().default(true),
        source: z.string().optional().describe("Откуда взять версию: HEAD, main, <хэш>"),
      },
    },
    async ({ cwd, paths, staged, worktree, source }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["restore"];
        if (source) args.push(`--source=${source}`);
        if (staged) args.push("--staged");
        if (worktree) args.push("--worktree");
        args.push("--", ...toList(paths));
        return await gitAction(args, { cwd: dir, mutating: true, label: "git restore" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_reset",
    {
      title: "Сбросить HEAD/индекс",
      description:
        "Перемещает HEAD и/или индекс.\n\n" +
        "  mode=soft — только HEAD\n" +
        "  mode=mixed — HEAD + индекс (рабочая копия не тронута), по умолчанию\n" +
        "  mode=hard — HEAD + индекс + рабочая копия (ТРЕБУЕТ confirm=true, изменения теряются)\n" +
        "  ref — куда сбросить (по умолчанию HEAD)\n" +
        "  paths — сбросить только указанные файлы в индексе",
      inputSchema: {
        cwd: cwdSchema(z),
        mode: z.enum(["soft", "mixed", "hard", "merge", "keep"]).default("mixed"),
        ref: z.string().default("HEAD"),
        paths: z.union([z.string(), z.array(z.string())]).optional(),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, mode, ref, paths, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (mode === "hard") requireConfirm(confirm, "git reset --hard", " Все несохранённые изменения будут потеряны.");
        const args = ["reset", `--${mode}`, ref];
        const list = toList(paths);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, mutating: true, label: "git reset" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_clean",
    {
      title: "Удалить неотслеживаемые файлы",
      description:
        "Убирает untracked-файлы (git clean).\n\n" +
        "  dry_run=true (по умолчанию) — только показать, что будет удалено\n" +
        "  dry_run=false требует confirm=true и реально удаляет\n" +
        "  dirs=true — вместе с каталогами, ignored=true — вместе с .gitignore-файлами",
      inputSchema: {
        cwd: cwdSchema(z),
        paths: z.union([z.string(), z.array(z.string())]).optional(),
        dry_run: z.boolean().default(true),
        dirs: z.boolean().default(false),
        ignored: z.boolean().default(false),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, paths, dry_run, dirs, ignored, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (!dry_run) requireConfirm(confirm, "git clean -f", " Неотслеживаемые файлы будут удалены без возможности восстановления.");
        const args = ["clean"];
        if (dry_run) args.push("--dry-run");
        else args.push("--force");
        if (dirs) args.push("-d");
        if (ignored) args.push("-x");
        const list = toList(paths);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, mutating: !dry_run, label: "git clean", emptyMessage: "Нечего удалять." });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_checkout",
    {
      title: "Переключить ветку / вернуть файлы",
      description:
        "Классический git checkout.\n\n" +
        "  target — ветка/коммит/тег\n" +
        "  create — создать ветку с именем target (можно start_point)\n" +
        "  orphan — создать сиротскую ветку\n" +
        "  paths — вернуть файлы из target (или из индекса, если target не указан)\n" +
        "  force=true — отбросить локальные изменения (осторожно)",
      inputSchema: {
        cwd: cwdSchema(z),
        target: z.string().optional().describe("Ветка, тег или хэш"),
        create: z.boolean().default(false).describe("Создать ветку target"),
        start_point: z.string().optional().describe("Откуда создать ветку"),
        orphan: z.boolean().default(false),
        paths: z.union([z.string(), z.array(z.string())]).optional(),
        force: z.boolean().default(false),
      },
    },
    async ({ cwd, target, create, start_point, orphan, paths, force }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const list = toList(paths);
        const args = ["checkout"];
        if (create) {
          if (!target) throw new ToolError("Для create=true укажи target — имя новой ветки.");
          args.push("-b", target);
          if (start_point) args.push(start_point);
        } else if (orphan) {
          if (!target) throw new ToolError("Для orphan=true укажи target — имя ветки.");
          args.push("--orphan", target);
        } else if (target) {
          args.push(target);
        }
        if (force) args.push("--force");
        if (list.length) args.push("--", ...list);
        if (!target && !list.length) throw new ToolError("Укажи target и/или paths.");
        return await gitAction(args, { cwd: dir, mutating: true, label: "git checkout" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_branch",
    {
      title: "Управление ветками",
      description:
        "  action=list — локальные и удалённые ветки\n" +
        "  action=create — name (+ start_point, force)\n" +
        "  action=delete — name (force=true для непроверенной ветки; требует confirm=true)\n" +
        "  action=rename — name (старое) + new_name\n" +
        "  action=set_upstream — name + upstream (например origin/main)\n" +
        "  action=unset_upstream — name",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "create", "delete", "rename", "set_upstream", "unset_upstream"]).default("list"),
        name: z.string().optional().describe("Имя ветки"),
        new_name: z.string().optional(),
        start_point: z.string().optional(),
        upstream: z.string().optional().describe("Например origin/main"),
        force: z.boolean().default(false),
        all: z.boolean().default(true).describe("Для list: показывать удалённые ветки"),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, name, new_name, start_point, upstream, force, all, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "list") {
          const args = ["branch", "-vv"];
          if (all) args.push("-a");
          return await gitAction(args, { cwd: dir, label: "git branch" });
        }
        if (action === "create") {
          if (!name) throw new ToolError("Укажи name — имя новой ветки.");
          const args = ["branch"];
          if (force) args.push("-f");
          args.push(name);
          if (start_point) args.push(start_point);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git branch" });
        }
        if (action === "delete") {
          if (!name) throw new ToolError("Укажи name — какую ветку удалять.");
          requireConfirm(confirm, `git branch -${force ? "D" : "d"} ${name}`);
          return await gitAction(["branch", force ? "-D" : "-d", name], { cwd: dir, mutating: true, label: "git branch" });
        }
        if (action === "rename") {
          if (!name || !new_name) throw new ToolError("Укажи name и new_name.");
          return await gitAction(["branch", "-m", name, new_name], { cwd: dir, mutating: true, label: "git branch" });
        }
        if (action === "set_upstream") {
          if (!name || !upstream) throw new ToolError("Укажи name и upstream.");
          return await gitAction(["branch", `--set-upstream-to=${upstream}`, name], {
            cwd: dir,
            mutating: true,
            label: "git branch",
          });
        }
        if (action === "unset_upstream") {
          const args = ["branch", "--unset-upstream"];
          if (name) args.push(name);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git branch" });
        }
        throw new ToolError(`Неизвестное действие: ${action}`);
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_switch",
    {
      title: "Переключение веток",
      description:
        "Современный git switch.\n\n" +
        "  branch — ветка (или коммит при detach=true)\n" +
        "  create=true — создать ветку (start_point — откуда)\n" +
        "  force=true — переключиться, отбросив локальные изменения\n" +
        "  track=true — настроить отслеживание удалённой ветки",
      inputSchema: {
        cwd: cwdSchema(z),
        branch: z.string().describe("Ветка"),
        create: z.boolean().default(false),
        start_point: z.string().optional(),
        detach: z.boolean().default(false),
        force: z.boolean().default(false),
        track: z.boolean().default(false),
        guess: z.boolean().default(false).describe("--guess: угадать remote-ветку по имени"),
      },
    },
    async ({ cwd, branch, create, start_point, detach, force, track, guess }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const args = ["switch"];
        if (create) args.push("-c", branch);
        else if (detach) args.push("--detach", branch);
        else args.push(branch);
        if (create && start_point) args.push(start_point);
        if (track) args.push("--track");
        if (guess) args.push("--guess");
        if (force) args.push("--force");
        return await gitAction(args, { cwd: dir, mutating: true, label: "git switch" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_merge",
    {
      title: "Слияние веток",
      description:
        "git merge + abort/continue.\n\n" +
        "  refs — что вливать (можно несколько)\n" +
        "  no_ff=false → --no-ff; ff_only → --ff-only; squash → --squash\n" +
        "  no_commit, message, strategy (-s), strategy_option (-X), autostash, signoff\n" +
        "  action=abort|continue|quit — при конфликтах\n\n" +
        "При конфликте git вернёт код 1, конфликтующие файлы будут в выводе.",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["merge", "abort", "continue", "quit"]).default("merge"),
        refs: z.union([z.string(), z.array(z.string())]).optional().describe("Ветки/коммиты для слияния"),
        no_ff: z.boolean().default(false),
        ff_only: z.boolean().default(false),
        squash: z.boolean().default(false),
        no_commit: z.boolean().default(false),
        message: z.string().optional(),
        strategy: z.string().optional().describe("recursive, ort, ours, subtree..."),
        strategy_option: z.string().optional().describe("Параметр для -X"),
        allow_unrelated: z.boolean().default(false),
        autostash: z.boolean().default(false),
        signoff: z.boolean().default(false),
      },
    },
    async ({ cwd, action, refs, no_ff, ff_only, squash, no_commit, message, strategy, strategy_option, allow_unrelated, autostash, signoff }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action !== "merge") {
          return await gitAction(["merge", `--${action}`], { cwd: dir, mutating: true, okCodes: [0, 1], label: "git merge" });
        }
        const list = toList(refs);
        if (!list.length) throw new ToolError("Укажи refs — что вливать.");
        const args = ["merge"];
        if (no_ff) args.push("--no-ff");
        if (ff_only) args.push("--ff-only");
        if (squash) args.push("--squash");
        if (no_commit) args.push("--no-commit");
        if (message) args.push("-m", message);
        if (strategy) args.push("-s", strategy);
        if (strategy_option) args.push("-X", strategy_option);
        if (allow_unrelated) args.push("--allow-unrelated-histories");
        if (autostash) args.push("--autostash");
        if (signoff) args.push("--signoff");
        args.push(...list);
        return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], label: "git merge" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_rebase",
    {
      title: "Перебазирование",
      description:
        "Неинтерактивный git rebase (интерактивный редактор недоступен).\n\n" +
        "  upstream — на что перебазировать (origin/dev, main~3)\n" +
        "  onto — перенести на другую базу (--onto)\n" +
        "  branch — какую ветку перебазировать (по умолчанию текущая)\n" +
        "  autosquash, autostash, no_verify, keep_empty\n" +
        "  action=continue|abort|skip — при конфликтах",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["start", "continue", "abort", "skip"]).default("start"),
        upstream: z.string().optional().describe("База: origin/dev, main, HEAD~3"),
        onto: z.string().optional(),
        branch: z.string().optional(),
        autosquash: z.boolean().default(false),
        autostash: z.boolean().default(false),
        no_verify: z.boolean().default(false),
        keep_empty: z.boolean().default(false),
        update_refs: z.boolean().default(false),
      },
    },
    async ({ cwd, action, upstream, onto, branch, autosquash, autostash, no_verify, keep_empty, update_refs }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action !== "start") {
          return await gitAction(["rebase", `--${action}`], { cwd: dir, mutating: true, okCodes: [0, 1], label: "git rebase" });
        }
        if (!upstream) throw new ToolError("Укажи upstream — базу для перебазирования.");
        const args = ["rebase"];
        if (onto) args.push("--onto", onto);
        if (autosquash) args.push("--autosquash");
        if (autostash) args.push("--autostash");
        if (no_verify) args.push("--no-verify");
        if (keep_empty) args.push("--keep-empty");
        if (update_refs) args.push("--update-refs");
        args.push(upstream);
        if (branch) args.push(branch);
        return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], label: "git rebase" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_cherry_pick",
    {
      title: "Cherry-pick коммитов",
      description:
        "Переносит отдельные коммиты в текущую ветку.\n\n" +
        "  commits — хэши (можно диапазон A..B)\n" +
        "  no_commit, signoff, mainline (для merge-коммитов, -m N)\n" +
        "  action=continue|abort|skip — при конфликтах",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["start", "continue", "abort", "skip"]).default("start"),
        commits: z.union([z.string(), z.array(z.string())]).optional(),
        no_commit: z.boolean().default(false),
        signoff: z.boolean().default(false),
        mainline: z.number().int().min(1).optional(),
      },
    },
    async ({ cwd, action, commits, no_commit, signoff, mainline }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action !== "start") {
          return await gitAction(["cherry-pick", `--${action}`], { cwd: dir, mutating: true, okCodes: [0, 1], label: "git cherry-pick" });
        }
        const list = toList(commits);
        if (!list.length) throw new ToolError("Укажи commits.");
        const args = ["cherry-pick"];
        if (no_commit) args.push("--no-commit");
        if (signoff) args.push("--signoff");
        if (mainline) args.push("-m", String(mainline));
        args.push(...list);
        return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], label: "git cherry-pick" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_revert",
    {
      title: "Отменить коммиты",
      description:
        "Создаёт новые коммиты, отменяющие эффект указанных (безопасная альтернатива reset для общих веток).\n\n" +
        "  commits — хэши; mainline — для merge-коммитов; no_commit, signoff\n" +
        "  action=continue|abort|skip — при конфликтах",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["start", "continue", "abort", "skip"]).default("start"),
        commits: z.union([z.string(), z.array(z.string())]).optional(),
        no_commit: z.boolean().default(false),
        signoff: z.boolean().default(false),
        mainline: z.number().int().min(1).optional(),
      },
    },
    async ({ cwd, action, commits, no_commit, signoff, mainline }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action !== "start") {
          return await gitAction(["revert", `--${action}`], { cwd: dir, mutating: true, okCodes: [0, 1], label: "git revert" });
        }
        const list = toList(commits);
        if (!list.length) throw new ToolError("Укажи commits.");
        const args = ["revert"];
        if (no_commit) args.push("--no-commit");
        if (signoff) args.push("--signoff");
        if (mainline) args.push("-m", String(mainline));
        args.push(...list);
        return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], label: "git revert" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_stash",
    {
      title: "Stash (отложить изменения)",
      description:
        "  action=push — спрятать изменения (message, include_untracked, keep_index, staged, paths)\n" +
        "  action=list — список\n" +
        "  action=show — показать diff (patch=true), index — номер stash\n" +
        "  action=pop / apply — достать (index, --index для сохранения индекса)\n" +
        "  action=drop / clear — удалить (требует confirm=true)\n" +
        "  action=branch — создать ветку из stash (branch)\n" +
        "  action=create — создать stash-объект и вернуть его хэш",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["push", "list", "show", "pop", "apply", "drop", "clear", "branch", "create"]).default("push"),
        index: z.number().int().min(0).default(0).describe("Номер stash: 0 = последний"),
        message: z.string().optional(),
        include_untracked: z.boolean().default(false),
        keep_index: z.boolean().default(false),
        staged: z.boolean().default(false).describe("--staged: только проиндексированное"),
        restore_index: z.boolean().default(false).describe("Для pop/apply: --index"),
        patch: z.boolean().default(false).describe("Для show: полный diff"),
        branch: z.string().optional().describe("Для action=branch — имя ветки"),
        paths: z.union([z.string(), z.array(z.string())]).optional(),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, index, message, include_untracked, keep_index, staged, restore_index, patch, branch, paths, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        const ref = `stash@{${index}}`;
        const list = toList(paths);

        if (action === "list") {
          return await gitAction(["stash", "list", "--date=relative"], { cwd: dir, label: "git stash list", emptyMessage: "Stash пуст." });
        }
        if (action === "push") {
          const args = ["stash", "push"];
          if (message) args.push("-m", message);
          if (include_untracked) args.push("--include-untracked");
          if (keep_index) args.push("--keep-index");
          if (staged) args.push("--staged");
          if (list.length) args.push("--", ...list);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git stash push" });
        }
        if (action === "show") {
          const args = ["stash", "show"];
          if (patch) args.push("--patch");
          else args.push("--stat");
          args.push(ref);
          return await gitAction(args, { cwd: dir, label: "git stash show" });
        }
        if (action === "pop" || action === "apply") {
          const args = ["stash", action];
          if (restore_index) args.push("--index");
          args.push(ref);
          return await gitAction(args, { cwd: dir, mutating: true, okCodes: [0, 1], label: `git stash ${action}` });
        }
        if (action === "drop") {
          requireConfirm(confirm, `git stash drop ${ref}`);
          return await gitAction(["stash", "drop", ref], { cwd: dir, mutating: true, label: "git stash drop" });
        }
        if (action === "clear") {
          requireConfirm(confirm, "git stash clear", " Будут удалены ВСЕ stash-записи.");
          return await gitAction(["stash", "clear"], { cwd: dir, mutating: true, label: "git stash clear" });
        }
        if (action === "branch") {
          if (!branch) throw new ToolError("Укажи branch — имя новой ветки.");
          return await gitAction(["stash", "branch", branch, ref], { cwd: dir, mutating: true, label: "git stash branch" });
        }
        return await gitAction(["stash", "create"], { cwd: dir, mutating: true, label: "git stash create" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_tag",
    {
      title: "Теги",
      description:
        "  action=list — все теги с сообщениями\n" +
        "  action=create — name (+ message для аннотированного, ref, force)\n" +
        "  action=delete — name (требует confirm=true)\n" +
        "  action=verify — проверить подпись тега\n" +
        "  action=show — показать содержимое тега",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "create", "delete", "verify", "show"]).default("list"),
        name: z.string().optional(),
        message: z.string().optional(),
        ref: z.string().optional().describe("На какой коммит поставить тег (по умолчанию HEAD)"),
        annotated: z.boolean().default(false),
        force: z.boolean().default(false),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, name, message, ref, annotated, force, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "list") {
          return await gitAction(["tag", "-n", "--sort=-creatordate"], { cwd: dir, label: "git tag", emptyMessage: "Тегов нет." });
        }
        if (action === "create") {
          if (!name) throw new ToolError("Укажи name.");
          const args = ["tag"];
          if (force) args.push("-f");
          if (annotated || message) {
            args.push("-a", name, "-m", message || name);
          } else {
            args.push(name);
          }
          if (ref) args.push(ref);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git tag" });
        }
        if (!name) throw new ToolError("Укажи name.");
        if (action === "delete") {
          requireConfirm(confirm, `git tag -d ${name}`);
          return await gitAction(["tag", "-d", name], { cwd: dir, mutating: true, label: "git tag" });
        }
        if (action === "verify") {
          return await gitAction(["tag", "-v", name], { cwd: dir, label: "git tag -v" });
        }
        return await gitAction(["show", "--no-patch", name], { cwd: dir, label: "git show" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_apply",
    {
      title: "Применить патч",
      description:
        "git apply для diff-текста или файла.\n\n" +
        "  patch — текст патча (можно вставить содержимое .diff/.patch)\n" +
        "  file — путь к файлу патча (если patch не задан)\n" +
        "  check=true — только проверить применимость, ничего не менять\n" +
        "  index=true — обновить и индекс; threeway=true — 3-way merge\n" +
        "  reverse=true — откатить патч; stat=true — только статистика",
      inputSchema: {
        cwd: cwdSchema(z),
        patch: z.string().optional().describe("Текст патча"),
        file: z.string().optional().describe("Файл патча"),
        check: z.boolean().default(false),
        index: z.boolean().default(false),
        threeway: z.boolean().default(false),
        reverse: z.boolean().default(false),
        stat: z.boolean().default(false),
        whitespace: z.enum(["nowarn", "warn", "fix", "error", "error-all"]).optional(),
      },
    },
    async ({ cwd, patch, file, check, index, threeway, reverse, stat, whitespace }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (!patch && !file) throw new ToolError("Укажи patch (текст) или file (путь к патчу).");
        const args = ["apply"];
        if (check) args.push("--check");
        if (index) args.push("--index");
        if (threeway) args.push("--3way");
        if (reverse) args.push("--reverse");
        if (stat) args.push("--stat");
        if (whitespace) args.push(`--whitespace=${whitespace}`);
        const input = patch || undefined;
        if (file) args.push(file);
        return await gitAction(args, {
          cwd: dir,
          mutating: !check && !stat,
          input,
          label: "git apply",
          emptyMessage: check ? "Патч применим." : "Патч применён.",
        });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_maintenance",
    {
      title: "Обслуживание репозитория",
      description:
        "  action=gc — сборка мусора (aggressive, prune)\n" +
        "  action=fsck — проверка целостности\n" +
        "  action=prune — удалить недостижимые объекты (dry_run для предпросмотра)\n" +
        "  action=count_objects — размер репозитория\n" +
        "  action=reflog_expire — почистить reflog (expire='90 days ago')\n" +
        "  action=repack — перепаковать объекты",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["gc", "fsck", "prune", "count_objects", "reflog_expire", "repack"]).default("gc"),
        aggressive: z.boolean().default(false),
        dry_run: z.boolean().default(false),
        prune: z.string().optional().describe("Срок для gc --prune, по умолчанию 2.weeks.ago"),
        expire: z.string().optional().describe("Срок для reflog expire, по умолчанию 90.days.ago"),
      },
    },
    async ({ cwd, action, aggressive, dry_run, prune, expire }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "gc") {
          const args = ["gc"];
          if (aggressive) args.push("--aggressive");
          if (prune) args.push(`--prune=${prune}`);
          return await gitAction(args, { cwd: dir, timeout: 600_000, label: "git gc" });
        }
        if (action === "fsck") {
          return await gitAction(["fsck", "--full", "--no-progress"], { cwd: dir, timeout: 600_000, label: "git fsck" });
        }
        if (action === "prune") {
          const args = ["prune", "-v"];
          if (dry_run) args.push("--dry-run");
          return await gitAction(args, { cwd: dir, mutating: !dry_run, timeout: 300_000, label: "git prune" });
        }
        if (action === "count_objects") {
          return await gitAction(["count-objects", "-vH"], { cwd: dir, label: "git count-objects" });
        }
        if (action === "reflog_expire") {
          return await gitAction(["reflog", "expire", `--expire=${expire || "90.days.ago"}`, "--all", "--verbose"], {
            cwd: dir,
            mutating: true,
            label: "git reflog expire",
          });
        }
        return await gitAction(["repack", "-a", "-d"], { cwd: dir, mutating: true, timeout: 600_000, label: "git repack" });
      } catch (error) {
        return failure(error);
      }
    },
  );
}
