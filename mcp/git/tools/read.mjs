/**
 * Read-only инструменты: состояние, история, диффы, конфиг, worktree, submodule.
 */
import { git, truncate, ToolError } from "../lib/exec.mjs";
import { resolveExistingDir, resolveTargetPath } from "../lib/paths.mjs";
import { failure, gitAction, requireConfirm, text, toList } from "../lib/toolkit.mjs";

const cwdSchema = (z) =>
  z.string().optional().describe("Каталог репозитория. По умолчанию — корень проекта. Относительные пути считаются от корня проекта.");

const pathsSchema = (z, description) =>
  z.union([z.string(), z.array(z.string())]).optional().describe(description);

/** Запускает несколько git-команд и объединяет вывод секциями. */
async function sections(cwd, commands) {
  const chunks = [];
  for (const [title, args] of commands) {
    const result = await git(args, { cwd });
    const body = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n");
    chunks.push(`## ${title}\n${body || "(пусто)"}`);
  }
  return truncate(chunks.join("\n\n"));
}

export function registerReadTools(server, z) {
  server.registerTool(
    "git_status",
    {
      title: "Состояние рабочей копии",
      description:
        "Показывает ветку, upstream, staged/unstaged/untracked файлы и конфликты.\n\n" +
        "Вызывай ПЕРВЫМ перед любыми изменениями, чтобы понять состояние репозитория.\n\n" +
        "  format=short — компактно (по умолчанию)\n" +
        "  format=porcelain — машиночитаемо (стабильный формат)\n" +
        "  format=long — подробный человекочитаемый вывод\n" +
        "  path — ограничить одним путём/каталогом",
      inputSchema: {
        cwd: cwdSchema(z),
        format: z.enum(["short", "porcelain", "long"]).default("short"),
        path: z.string().optional().describe("Путь или каталог для фильтра"),
      },
    },
    async ({ cwd, format, path: onlyPath }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args =
          format === "porcelain"
            ? ["status", "--porcelain=v1", "--branch"]
            : format === "long"
              ? ["status"]
              : ["status", "--short", "--branch"];
        if (onlyPath) args.push("--", onlyPath);
        return await gitAction(args, { cwd: dir, label: "git status", emptyMessage: "Рабочая копия чистая." });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_log",
    {
      title: "История коммитов",
      description:
        "Журнал коммитов с фильтрами по ветке, автору, датам, сообщению и путям.\n\n" +
        "  max_count — сколько коммитов (1..500, по умолчанию 20)\n" +
        "  ref — ветка/тег/хэш (по умолчанию текущая HEAD)\n" +
        "  path — только коммиты, затрагивающие путь\n" +
        "  author / since / until / grep — фильтры (since/until в формате 2024-01-31 или '2 weeks ago')\n" +
        "  stat / name_only / patch — добавить статистику / список файлов / сам diff\n" +
        "  all=true — по всем веткам, no_merges=true — без merge-коммитов",
      inputSchema: {
        cwd: cwdSchema(z),
        max_count: z.number().int().min(1).max(500).default(20),
        ref: z.string().optional().describe("Ветка, тег или хэш. Например main, v1.2.0, HEAD~3"),
        path: pathsSchema(z, "Путь или массив путей"),
        author: z.string().optional().describe("Фильтр по автору (подстрока имени/почты)"),
        since: z.string().optional().describe("С даты: 2024-01-31, '2 weeks ago'"),
        until: z.string().optional().describe("По дату"),
        grep: z.string().optional().describe("Поиск по тексту сообщения коммита"),
        format: z.enum(["compact", "oneline", "full"]).default("compact"),
        stat: z.boolean().default(false),
        name_only: z.boolean().default(false),
        patch: z.boolean().default(false).describe("Показать полный diff каждого коммита (может быть большим)"),
        no_merges: z.boolean().default(false),
        all: z.boolean().default(false).describe("Показать историю всех веток"),
        reverse: z.boolean().default(false),
      },
    },
    async ({ cwd, max_count, ref, path: onlyPath, author, since, until, grep, format, stat, name_only, patch, no_merges, all, reverse }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args = ["log", `--max-count=${max_count}`, "--date=short"];
        if (format === "compact") args.push("--format=%h %ad %an%d %s");
        else if (format === "oneline") args.push("--format=%h %s");
        else args.push("--format=fuller");
        if (stat) args.push("--stat");
        if (name_only) args.push("--name-only");
        if (patch) args.push("--patch");
        if (no_merges) args.push("--no-merges");
        if (all) args.push("--all");
        if (reverse) args.push("--reverse");
        if (author) args.push(`--author=${author}`);
        if (since) args.push(`--since=${since}`);
        if (until) args.push(`--until=${until}`);
        if (grep) args.push(`--grep=${grep}`);
        if (ref) args.push(ref);
        const list = toList(onlyPath);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, label: "git log", emptyMessage: "Коммитов по фильтру не найдено." });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_diff",
    {
      title: "Diff изменений",
      description:
        "Показывает разницу: рабочая копия vs индекс/HEAD/произвольные ref.\n\n" +
        "  staged=true — изменения в индексе (git diff --cached)\n" +
        "  ref — сравнить рабочую копию с веткой/коммитом (git diff <ref>)\n" +
        "  from + to — сравнить два ref между собой\n" +
        "  path — ограничить путями\n" +
        "  stat / name_only / name_status / context / ignore_whitespace",
      inputSchema: {
        cwd: cwdSchema(z),
        staged: z.boolean().default(false),
        ref: z.string().optional().describe("С чем сравнить: HEAD, main, origin/dev, хэш"),
        from: z.string().optional().describe("Начальный ref (вместе с to)"),
        to: z.string().optional().describe("Конечный ref (вместе с from)"),
        path: pathsSchema(z, "Путь или массив путей"),
        stat: z.boolean().default(false),
        name_only: z.boolean().default(false),
        name_status: z.boolean().default(false),
        context: z.number().int().min(0).max(50).default(3).describe("Строк контекста (-U)"),
        ignore_whitespace: z.boolean().default(false),
      },
    },
    async ({ cwd, staged, ref, from, to, path: onlyPath, stat, name_only, name_status, context, ignore_whitespace }) => {
      try {
        const dir = resolveExistingDir(cwd);
        if (from && !to) throw new ToolError("Укажи оба ref: from и to.");
        const args = ["diff", `--unified=${context}`];
        if (staged) args.push("--cached");
        if (stat) args.push("--stat");
        if (name_only) args.push("--name-only");
        if (name_status) args.push("--name-status");
        if (ignore_whitespace) args.push("--ignore-all-space");
        if (from && to) args.push(from, to);
        else if (ref) args.push(ref);
        const list = toList(onlyPath);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, label: "git diff", emptyMessage: "Изменений нет." });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_show",
    {
      title: "Показать коммит/объект",
      description:
        "Содержимое коммита, тега, дерева или блоба: сообщение, автор, diff.\n\n" +
        "  ref — HEAD, хэш, ветка, тег, HEAD~2:path/to/file\n" +
        "  patch=false — только сообщение/метаданные без diff\n" +
        "  stat / name_only / path — статистика, список файлов, один файл",
      inputSchema: {
        cwd: cwdSchema(z),
        ref: z.string().default("HEAD"),
        path: pathsSchema(z, "Ограничить одним файлом/каталогом"),
        patch: z.boolean().default(true),
        stat: z.boolean().default(false),
        name_only: z.boolean().default(false),
        context: z.number().int().min(0).max(50).default(3),
      },
    },
    async ({ cwd, ref, path: onlyPath, patch, stat, name_only, context }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args = ["show", `--unified=${context}`, ref];
        if (!patch) args.push("--no-patch");
        if (stat) args.push("--stat");
        if (name_only) args.push("--name-only");
        const list = toList(onlyPath);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, { cwd: dir, label: "git show" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_blame",
    {
      title: "Авторство строк (blame)",
      description: "Кто и когда менял каждую строку файла. Можно ограничить диапазон строк и указать ref.",
      inputSchema: {
        cwd: cwdSchema(z),
        file: z.string().describe("Путь к файлу"),
        ref: z.string().optional().describe("Ветка/коммит, по умолчанию HEAD"),
        line_start: z.number().int().min(1).optional(),
        line_end: z.number().int().min(1).optional(),
        ignore_whitespace: z.boolean().default(false),
        show_email: z.boolean().default(false).describe("Показывать e-mail автора"),
      },
    },
    async ({ cwd, file, ref, line_start, line_end, ignore_whitespace, show_email }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args = ["blame", "--date=short"];
        if (ignore_whitespace) args.push("-w");
        if (show_email) args.push("-e");
        if (line_start && line_end) args.push(`-L${line_start},${line_end}`);
        if (ref) args.push(ref);
        args.push("--", file);
        return await gitAction(args, { cwd: dir, label: "git blame" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_grep",
    {
      title: "Поиск по файлам репозитория",
      description:
        "git grep по рабочей копии или по ref: быстрый поиск с номерами строк.\n\n" +
        "  pattern — регулярное выражение Git (по умолчанию BRE)\n" +
        "  extended=true — ERE, fixed_strings=true — литеральная строка\n" +
        "  ref — искать в исторической версии (например v1.0)\n" +
        "  path — ограничить путями. Нет совпадений — это не ошибка.",
      inputSchema: {
        cwd: cwdSchema(z),
        pattern: z.string().describe("Что искать"),
        ref: z.string().optional().describe("Ветка/тег/коммит"),
        path: pathsSchema(z, "Путь или массив путей"),
        ignore_case: z.boolean().default(false),
        fixed_strings: z.boolean().default(false),
        extended: z.boolean().default(false),
        word_regexp: z.boolean().default(false),
        max_count: z.number().int().min(1).max(1000).optional().describe("Максимум совпадений на файл"),
        files_with_matches: z.boolean().default(false).describe("Только имена файлов (-l)"),
        count: z.boolean().default(false).describe("Только число совпадений по файлам (-c)"),
      },
    },
    async ({ cwd, pattern, ref, path: onlyPath, ignore_case, fixed_strings, extended, word_regexp, max_count, files_with_matches, count }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args = ["grep", "--color=never"];
        if (!files_with_matches && !count) args.push("-n");
        if (ignore_case) args.push("-i");
        if (fixed_strings) args.push("-F");
        if (extended) args.push("-E");
        if (word_regexp) args.push("-w");
        if (max_count) args.push(`-m${max_count}`);
        if (files_with_matches) args.push("-l");
        if (count) args.push("-c");
        args.push("-e", pattern);
        if (ref) args.push(ref);
        const list = toList(onlyPath);
        if (list.length) args.push("--", ...list);
        return await gitAction(args, {
          cwd: dir,
          okCodes: [0, 1],
          emptyMessage: "Совпадений не найдено.",
        });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_refs",
    {
      title: "Ветки, теги, remotes, reflog",
      description:
        "Справочная информация о ссылках репозитория.\n\n" +
        "  scope=branches — локальные и удалённые ветки с upstream\n" +
        "  scope=tags — теги с датой и сообщением\n" +
        "  scope=remotes — remotes и URL\n" +
        "  scope=reflog — история перемещений HEAD (limit)\n" +
        "  scope=refs — сырые refs, scope=all — всё сразу",
      inputSchema: {
        cwd: cwdSchema(z),
        scope: z.enum(["branches", "tags", "remotes", "reflog", "refs", "all"]).default("all"),
        limit: z.number().int().min(1).max(500).default(30).describe("Для reflog"),
      },
    },
    async ({ cwd, scope, limit }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const branches = ["branch", "-a", "-vv"];
        const tags = ["for-each-ref", "--sort=-creatordate", "--format=%(refname:short)  %(objectname:short)  %(creatordate:short)  %(contents:subject)", "refs/tags"];
        const remotes = ["remote", "-v"];
        const reflog = ["reflog", "--date=short", `-n${limit}`];
        const refs = ["for-each-ref", "--format=%(refname)  %(objectname:short)", "refs/heads", "refs/tags", "refs/remotes"];

        const map = {
          branches: [["Ветки", branches]],
          tags: [["Теги", tags]],
          remotes: [["Remotes", remotes]],
          reflog: [["Reflog", reflog]],
          refs: [["Refs", refs]],
          all: [
            ["Ветки", branches],
            ["Теги", tags],
            ["Remotes", remotes],
            ["Reflog", reflog],
          ],
        };
        return text(await sections(dir, map[scope]));
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_describe",
    {
      title: "Описание текущей версии",
      description: "Человекочитаемое имя ближайшего тега (git describe). Удобно для версий и релизов.",
      inputSchema: {
        cwd: cwdSchema(z),
        ref: z.string().default("HEAD"),
        tags: z.boolean().default(false).describe("Учитывать и легковесные теги (--tags)"),
        always: z.boolean().default(false).describe("Всегда возвращать что-то (--always)"),
        long: z.boolean().default(false),
        dirty: z.boolean().default(false).describe("Добавить суффикс -dirty при изменениях"),
        abbrev: z.number().int().min(4).max(40).optional(),
      },
    },
    async ({ cwd, ref, tags, always, long, dirty, abbrev }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const args = ["describe"];
        if (tags) args.push("--tags");
        if (always) args.push("--always");
        if (long) args.push("--long");
        if (dirty) args.push("--dirty");
        if (abbrev) args.push(`--abbrev=${abbrev}`);
        args.push(ref);
        return await gitAction(args, { cwd: dir, label: "git describe" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_config",
    {
      title: "Чтение и правка git config",
      description:
        "Работа с настройками git.\n\n" +
        "  action=list — все значения (с источником)\n" +
        "  action=get — конкретный ключ\n" +
        "  action=set — записать значение (scope: local по умолчанию)\n" +
        "  action=unset — удалить ключ (требует confirm=true)\n\n" +
        "Изменение global/system затрагивает другие репозитории — требует confirm=true.",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "get", "set", "unset"]).default("list"),
        key: z.string().optional().describe("Ключ, например user.name, core.autocrlf"),
        value: z.string().optional().describe("Значение для action=set"),
        scope: z.enum(["auto", "local", "global", "system", "worktree"]).default("auto"),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, key, value, scope, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const scopeFlag = scope === "auto" ? [] : [`--${scope}`];

        if (action === "list") {
          return await gitAction(["config", ...scopeFlag, "--list", "--show-origin"], { cwd: dir, label: "git config" });
        }
        if (!key) throw new ToolError("Укажи key для actions get/set/unset.");
        if (action === "get") {
          return await gitAction(["config", ...scopeFlag, "--get", key], {
            cwd: dir,
            okCodes: [0, 1],
            emptyMessage: `Ключ «${key}» не задан.`,
          });
        }
        if (action === "set") {
          if (value === undefined) throw new ToolError("Укажи value для action=set.");
          if (scope === "global" || scope === "system") {
            requireConfirm(confirm, `git config --${scope} ${key}`);
          }
          return await gitAction(["config", ...scopeFlag, "--replace-all", key, value], {
            cwd: dir,
            mutating: true,
            label: "git config",
            emptyMessage: `Записано: ${key}=${value}`,
          });
        }
        requireConfirm(confirm, `git config --unset ${key}`);
        return await gitAction(["config", ...scopeFlag, "--unset", key], {
          cwd: dir,
          mutating: true,
          label: "git config",
          emptyMessage: `Ключ «${key}» удалён.`,
        });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_worktree",
    {
      title: "Дополнительные рабочие копии (worktree)",
      description:
        "Управление worktree: несколько веток одновременно в разных каталогах.\n\n" +
        "  action=list — список\n" +
        "  action=add — path, branch (существующая) или new_branch + start_point, detach, force\n" +
        "  action=remove — path, force (требует confirm=true)\n" +
        "  action=prune — убрать записи об удалённых каталогах (dry_run для предпросмотра)\n" +
        "  action=move — from + to; action=lock/unlock — path + reason",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "add", "remove", "prune", "move", "lock", "unlock"]).default("list"),
        path: z.string().optional().describe("Каталог worktree"),
        branch: z.string().optional().describe("Существующая ветка для add"),
        new_branch: z.string().optional().describe("Создать новую ветку с этим именем"),
        start_point: z.string().optional().describe("Откуда создать ветку"),
        from: z.string().optional().describe("Для action=move"),
        to: z.string().optional().describe("Для action=move"),
        reason: z.string().optional().describe("Для lock/unlock"),
        detach: z.boolean().default(false),
        force: z.boolean().default(false),
        no_checkout: z.boolean().default(false),
        dry_run: z.boolean().default(false),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, path: worktreePath, branch, new_branch, start_point, from, to, reason, detach, force, no_checkout, dry_run, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "list") return await gitAction(["worktree", "list"], { cwd: dir, label: "git worktree list" });

        if (action === "add") {
          if (!worktreePath) throw new ToolError("Укажи path — каталог нового worktree.");
          const absolute = resolveTargetPath(worktreePath);
          const args = ["worktree", "add"];
          if (force) args.push("--force");
          if (detach) args.push("--detach");
          if (no_checkout) args.push("--no-checkout");
          if (new_branch) args.push("-b", new_branch);
          args.push(absolute);
          if (branch) args.push(branch);
          else if (start_point) args.push(start_point);
          return await gitAction(args, { cwd: dir, mutating: true, label: "git worktree add" });
        }
        if (action === "remove") {
          requireConfirm(confirm, "git worktree remove");
          if (!worktreePath) throw new ToolError("Укажи path.");
          const args = ["worktree", "remove", resolveTargetPath(worktreePath)];
          if (force) args.push("--force");
          return await gitAction(args, { cwd: dir, mutating: true, label: "git worktree remove" });
        }
        if (action === "move") {
          if (!from || !to) throw new ToolError("Укажи from и to.");
          return await gitAction(["worktree", "move", resolveTargetPath(from), resolveTargetPath(to)], {
            cwd: dir,
            mutating: true,
            label: "git worktree move",
          });
        }
        if (action === "prune") {
          const args = ["worktree", "prune", "-v"];
          if (dry_run) args.push("--dry-run");
          return await gitAction(args, { cwd: dir, mutating: !dry_run, label: "git worktree prune" });
        }
        if (action === "lock" || action === "unlock") {
          if (!worktreePath) throw new ToolError("Укажи path.");
          const args = ["worktree", action === "lock" ? "lock" : "unlock"];
          if (action === "lock" && reason) args.push("--reason", reason);
          args.push(resolveTargetPath(worktreePath));
          return await gitAction(args, { cwd: dir, mutating: true, label: `git worktree ${action}` });
        }
        throw new ToolError(`Неизвестное действие: ${action}`);
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "git_submodule",
    {
      title: "Подмодули",
      description:
        "status — состояние подмодулей; update — инициализировать и обновить;\n" +
        "init — прописать URL в .git/config; add — добавить подмодуль (url + path); sync — синхронизировать URL.",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["status", "update", "init", "add", "sync"]).default("status"),
        url: z.string().optional().describe("URL для action=add"),
        path: z.string().optional().describe("Путь подмодуля"),
        recursive: z.boolean().default(true),
        init: z.boolean().default(true).describe("Для update: инициализировать (.--init)"),
        force: z.boolean().default(false),
      },
    },
    async ({ cwd, action, url, path: subPath, recursive, init, force }) => {
      try {
        const dir = resolveExistingDir(cwd, { mustBeRepo: true });
        if (action === "status") {
          const args = ["submodule", "status"];
          if (recursive) args.push("--recursive");
          return await gitAction(args, { cwd: dir, label: "git submodule status", emptyMessage: "Подмодулей нет." });
        }
        if (action === "update") {
          const args = ["submodule", "update"];
          if (init) args.push("--init");
          if (recursive) args.push("--recursive");
          if (force) args.push("--force");
          if (subPath) args.push("--", subPath);
          return await gitAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "git submodule update" });
        }
        if (action === "init") {
          const args = ["submodule", "init"];
          if (recursive) args.push("--recursive");
          return await gitAction(args, { cwd: dir, mutating: true, label: "git submodule init" });
        }
        if (action === "sync") {
          const args = ["submodule", "sync"];
          if (recursive) args.push("--recursive");
          return await gitAction(args, { cwd: dir, mutating: true, label: "git submodule sync" });
        }
        if (!url || !subPath) throw new ToolError("Для action=add нужны url и path.");
        const args = ["submodule", "add"];
        if (force) args.push("--force");
        args.push(url, resolveTargetPath(subPath));
        return await gitAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "git submodule add" });
      } catch (error) {
        return failure(error);
      }
    },
  );
}
