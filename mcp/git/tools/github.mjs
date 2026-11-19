/**
 * GitHub через CLI `gh`: repo, PR, issues, releases, Actions, произвольный API.
 * Требует установленный gh и авторизацию (gh auth login / GH_TOKEN).
 */
import { gh, ToolError, truncate } from "../lib/exec.mjs";
import { resolveExistingDir, resolveTargetPath } from "../lib/paths.mjs";
import { failure, ghAction, requireConfirm, text } from "../lib/toolkit.mjs";

const cwdSchema = (z) =>
  z.string().optional().describe("Каталог репозитория (нужен, чтобы gh определил owner/repo). По умолчанию — корень проекта.");

const repoField = (z) => z.string().optional().describe("Репозиторий owner/name, если нужно обратиться не к текущему");

const repoFlag = (repo) => (repo ? ["--repo", repo] : []);

const PR_FIELDS =
  "number,title,state,isDraft,author,baseRefName,headRefName,url,mergeable,mergeStateStatus,reviewDecision,createdAt,updatedAt,body,labels,additions,deletions,changedFiles";

const ISSUE_FIELDS =
  "number,title,state,author,url,createdAt,updatedAt,body,labels,assignees,comments,milestone";

export function registerGitHubTools(server, z) {
  server.registerTool(
    "gh_status",
    {
      title: "Статус GitHub CLI",
      description:
        "Проверяет авторизацию gh, активный аккаунт и определяет текущий репозиторий. " +
        "Вызывай перед gh_* инструментами, если они падают с ошибкой авторизации.",
      inputSchema: { cwd: cwdSchema(z) },
    },
    async ({ cwd }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const auth = await gh(["auth", "status"], { cwd: dir });
        const view = await gh(["repo", "view", "--json", "nameWithOwner,defaultBranchRef,visibility,url,isPrivate"], { cwd: dir });
        const parts = [];
        parts.push((auth.stdout.trim() || auth.stderr.trim() || "(нет вывода)").replace(/gho_[A-Za-z0-9_]+/g, "gho_***"));
        if (view.code === 0) parts.push(`\nРепозиторий:\n${view.stdout.trim()}`);
        else parts.push("\nТекущий каталог не определяется как GitHub-репозиторий.");
        return text(truncate(parts.join("\n")));
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_repo",
    {
      title: "Репозитории GitHub",
      description:
        "  action=view — информация о репозитории (repo или текущий)\n" +
        "  action=list — репозитории пользователя/организации (owner, limit)\n" +
        "  action=create — name, description, private, source (каталог для push), remote\n" +
        "  action=clone — repo, dir, depth\n" +
        "  action=fork — repo, clone=true\n" +
        "  action=edit — repo, description, homepage, visibility\n" +
        "  action=delete — repo (требует confirm=true и scope delete_repo)",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["view", "list", "create", "clone", "fork", "edit", "delete"]).default("view"),
        repo: z.string().optional().describe("owner/name"),
        name: z.string().optional().describe("Имя нового репозитория"),
        owner: z.string().optional().describe("Для list/create: пользователь или организация"),
        description: z.string().optional(),
        homepage: z.string().optional(),
        visibility: z.enum(["public", "private", "internal"]).optional(),
        private: z.boolean().default(false),
        source: z.string().optional().describe("Локальный каталог, который станет репозиторием"),
        remote: z.string().default("origin"),
        dir: z.string().optional().describe("Каталог для clone"),
        depth: z.number().int().min(1).optional(),
        clone: z.boolean().default(false).describe("Для fork: сразу клонировать"),
        limit: z.number().int().min(1).max(200).default(30),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, repo, name, owner, description, homepage, visibility, private: isPrivate, source, remote, dir, depth, clone, limit, confirm }) => {
      try {
        const base = resolveExistingDir(cwd);

        if (action === "view") {
          const args = ["repo", "view"];
          if (repo) args.push(repo);
          args.push("--json", "nameWithOwner,description,visibility,isPrivate,isFork,defaultBranchRef,url,sshUrl,pushedAt,stargazerCount,forkCount,primaryLanguage,parent");
          return await ghAction(args, { cwd: base, label: "gh repo view" });
        }
        if (action === "list") {
          const args = ["repo", "list"];
          if (owner) args.push(owner);
          args.push("--limit", String(limit), "--json", "nameWithOwner,description,visibility,isPrivate,updatedAt,pushedAt,primaryLanguage,url");
          return await ghAction(args, { cwd: base, label: "gh repo list" });
        }
        if (action === "create") {
          if (!name) throw new ToolError("Укажи name.");
          requireConfirm(confirm, `gh repo create ${name}`);
          const args = ["repo", "create", owner ? `${owner}/${name}` : name];
          if (isPrivate) args.push("--private");
          if (visibility) args.push(`--${visibility}`);
          if (description) args.push("--description", description);
          if (source) args.push("--source", resolveExistingDir(source), "--remote", remote, "--push");
          return await ghAction(args, { cwd: base, mutating: true, timeout: 300_000, label: "gh repo create" });
        }
        if (action === "clone") {
          if (!repo) throw new ToolError("Укажи repo.");
          const args = ["repo", "clone", repo];
          if (dir) args.push(resolveTargetPath(dir));
          if (depth) args.push("--", `--depth=${depth}`);
          return await ghAction(args, { cwd: base, mutating: true, timeout: 900_000, label: "gh repo clone" });
        }
        if (action === "fork") {
          if (!repo) throw new ToolError("Укажи repo.");
          requireConfirm(confirm, `gh repo fork ${repo}`);
          const args = ["repo", "fork", repo];
          if (clone) args.push("--clone");
          return await ghAction(args, { cwd: base, mutating: true, timeout: 600_000, label: "gh repo fork" });
        }
        if (action === "edit") {
          const args = ["repo", "edit"];
          if (repo) args.push(repo);
          if (description !== undefined) args.push("--description", description);
          if (homepage !== undefined) args.push("--homepage", homepage);
          if (visibility) args.push("--visibility", visibility);
          if (!description && !homepage && !visibility) throw new ToolError("Укажи хотя бы одно поле: description, homepage, visibility.");
          return await ghAction(args, { cwd: base, mutating: true, label: "gh repo edit" });
        }
        if (!repo) throw new ToolError("Укажи repo для удаления.");
        requireConfirm(confirm, `gh repo delete ${repo}`, " Репозиторий будет удалён навсегда.");
        return await ghAction(["repo", "delete", repo, "--yes"], { cwd: base, mutating: true, timeout: 300_000, label: "gh repo delete" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_pr",
    {
      title: "Pull requests",
      description:
        "  action=list — state (open/closed/merged/all), limit, base, head, author, label, search\n" +
        "  action=view — number (по умолчанию текущая ветка)\n" +
        "  action=create — title/body/base/head/draft/fill, reviewer, assignee, label\n" +
        "  action=merge — number, method (squash/merge/rebase), delete_branch, auto, subject, body\n" +
        "  action=close / reopen / ready — number (+comment)\n" +
        "  action=comment — number + body\n" +
        "  action=review — number + review (approve/request-changes/comment) + body\n" +
        "  action=diff — diff PR\n" +
        "  action=checkout — локально переключиться на PR (branch_name, force)\n" +
        "  action=checks — статусы CI\n" +
        "  action=edit — title, body, base",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "view", "create", "merge", "close", "reopen", "ready", "comment", "review", "diff", "checkout", "checks", "edit"]).default("list"),
        repo: repoField(z),
        number: z.number().int().min(1).optional().describe("Номер PR"),
        state: z.enum(["open", "closed", "merged", "all"]).default("open"),
        limit: z.number().int().min(1).max(200).default(20),
        title: z.string().optional(),
        body: z.string().optional(),
        base: z.string().optional(),
        head: z.string().optional(),
        draft: z.boolean().default(false),
        fill: z.boolean().default(false).describe("Заполнить title/body из коммитов (--fill)"),
        method: z.enum(["squash", "merge", "rebase"]).default("squash"),
        delete_branch: z.boolean().default(false),
        auto: z.boolean().default(false).describe("Включить auto-merge"),
        subject: z.string().optional(),
        author: z.string().optional(),
        label: z.string().optional(),
        search: z.string().optional().describe("Поисковый запрос gh"),
        reviewer: z.string().optional(),
        assignee: z.string().optional(),
        comment: z.string().optional(),
        review: z.enum(["approve", "request-changes", "comment"]).optional(),
        branch_name: z.string().optional().describe("Для checkout: локальное имя ветки"),
        force: z.boolean().default(false),
        json: z.string().optional().describe("Свои --json поля для list/view"),
      },
    },
    async (input) => {
      const { cwd, action, repo, number, state, limit, title, body, base, head, draft, fill, method, delete_branch, auto, subject, author, label, search, reviewer, assignee, comment, review, branch_name, force, json: jsonFields } = input;
      try {
        const dir = resolveExistingDir(cwd);

        if (action === "list") {
          const args = ["pr", "list", ...repoFlag(repo), "--state", state, "--limit", String(limit), "--json", jsonFields || PR_FIELDS];
          if (base) args.push("--base", base);
          if (head) args.push("--head", head);
          if (author) args.push("--author", author);
          if (label) args.push("--label", label);
          if (search) args.push("--search", search);
          return await ghAction(args, { cwd: dir, label: "gh pr list" });
        }
        if (action === "view") {
          const args = ["pr", "view"];
          if (number) args.push(String(number));
          args.push(...repoFlag(repo), "--json", jsonFields || PR_FIELDS);
          return await ghAction(args, { cwd: dir, label: "gh pr view" });
        }
        if (action === "create") {
          if (!title && !fill) throw new ToolError("Укажи title (или fill=true).");
          const args = ["pr", "create", ...repoFlag(repo)];
          if (title) args.push("--title", title);
          if (body !== undefined) args.push("--body", body);
          if (base) args.push("--base", base);
          if (head) args.push("--head", head);
          if (draft) args.push("--draft");
          if (fill) args.push("--fill");
          if (reviewer) args.push("--reviewer", reviewer);
          if (assignee) args.push("--assignee", assignee);
          if (label) args.push("--label", label);
          return await ghAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "gh pr create" });
        }
        if (action === "merge") {
          if (!number) throw new ToolError("Укажи number.");
          const args = ["pr", "merge", String(number), ...repoFlag(repo)];
          if (auto) args.push("--auto");
          args.push(`--${method}`);
          if (delete_branch) args.push("--delete-branch");
          if (subject) args.push("--subject", subject);
          if (body) args.push("--body", body);
          return await ghAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "gh pr merge" });
        }
        if (action === "close" || action === "reopen" || action === "ready") {
          if (!number) throw new ToolError("Укажи number.");
          const args = ["pr", action, String(number), ...repoFlag(repo)];
          if (action === "close" && comment) args.push("--comment", comment);
          return await ghAction(args, { cwd: dir, mutating: true, label: `gh pr ${action}` });
        }
        if (action === "comment") {
          if (!number || !body) throw new ToolError("Укажи number и body.");
          return await ghAction(["pr", "comment", String(number), ...repoFlag(repo), "--body", body], {
            cwd: dir,
            mutating: true,
            label: "gh pr comment",
          });
        }
        if (action === "review") {
          if (!number || !review) throw new ToolError("Укажи number и review.");
          const args = ["pr", "review", String(number), ...repoFlag(repo), `--${review}`];
          if (body) args.push("--body", body);
          return await ghAction(args, { cwd: dir, mutating: true, label: "gh pr review" });
        }
        if (action === "diff") {
          const args = ["pr", "diff"];
          if (number) args.push(String(number));
          args.push(...repoFlag(repo));
          return await ghAction(args, { cwd: dir, label: "gh pr diff" });
        }
        if (action === "checkout") {
          if (!number) throw new ToolError("Укажи number.");
          const args = ["pr", "checkout", String(number), ...repoFlag(repo)];
          if (branch_name) args.push("--branch", branch_name);
          if (force) args.push("--force");
          return await ghAction(args, { cwd: dir, mutating: true, label: "gh pr checkout" });
        }
        if (action === "checks") {
          const args = ["pr", "checks"];
          if (number) args.push(String(number));
          args.push(...repoFlag(repo));
          return await ghAction(args, { cwd: dir, okCodes: [0, 1, 8], label: "gh pr checks" });
        }
        if (action === "edit") {
          if (!number) throw new ToolError("Укажи number.");
          const args = ["pr", "edit", String(number), ...repoFlag(repo)];
          if (title) args.push("--title", title);
          if (body !== undefined) args.push("--body", body);
          if (base) args.push("--base", base);
          if (!title && body === undefined && !base) throw new ToolError("Укажи title, body или base.");
          return await ghAction(args, { cwd: dir, mutating: true, label: "gh pr edit" });
        }
        throw new ToolError(`Неизвестное действие: ${action}`);
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_issue",
    {
      title: "Issues",
      description:
        "  action=list — state, limit, label, assignee, author, search\n" +
        "  action=view — number\n" +
        "  action=create — title, body, label, assignee, milestone\n" +
        "  action=comment / close / reopen — number (+body/comment)\n" +
        "  action=edit — title, body, add_label, remove_label, add_assignee",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "view", "create", "comment", "close", "reopen", "edit"]).default("list"),
        repo: repoField(z),
        number: z.number().int().min(1).optional(),
        state: z.enum(["open", "closed", "all"]).default("open"),
        limit: z.number().int().min(1).max(200).default(20),
        title: z.string().optional(),
        body: z.string().optional(),
        label: z.string().optional(),
        add_label: z.string().optional(),
        remove_label: z.string().optional(),
        assignee: z.string().optional(),
        add_assignee: z.string().optional(),
        milestone: z.string().optional(),
        author: z.string().optional(),
        search: z.string().optional(),
        comment: z.string().optional().describe("Комментарий при закрытии"),
        json: z.string().optional().describe("Свои --json поля"),
      },
    },
    async (input) => {
      const { cwd, action, repo, number, state, limit, title, body, label, add_label, remove_label, assignee, add_assignee, milestone, author, search, comment, json: jsonFields } = input;
      try {
        const dir = resolveExistingDir(cwd);
        if (action === "list") {
          const args = ["issue", "list", ...repoFlag(repo), "--state", state, "--limit", String(limit), "--json", jsonFields || "number,title,state,author,url,createdAt,updatedAt,labels,assignees"];
          if (label) args.push("--label", label);
          if (assignee) args.push("--assignee", assignee);
          if (author) args.push("--author", author);
          if (search) args.push("--search", search);
          return await ghAction(args, { cwd: dir, label: "gh issue list" });
        }
        if (action === "view") {
          if (!number) throw new ToolError("Укажи number.");
          return await ghAction(["issue", "view", String(number), ...repoFlag(repo), "--json", jsonFields || ISSUE_FIELDS], {
            cwd: dir,
            label: "gh issue view",
          });
        }
        if (action === "create") {
          if (!title) throw new ToolError("Укажи title.");
          const args = ["issue", "create", ...repoFlag(repo), "--title", title];
          if (body !== undefined) args.push("--body", body);
          if (label) args.push("--label", label);
          if (assignee) args.push("--assignee", assignee);
          if (milestone) args.push("--milestone", milestone);
          return await ghAction(args, { cwd: dir, mutating: true, label: "gh issue create" });
        }
        if (!number) throw new ToolError("Укажи number.");
        if (action === "comment") {
          if (!body) throw new ToolError("Укажи body.");
          return await ghAction(["issue", "comment", String(number), ...repoFlag(repo), "--body", body], {
            cwd: dir,
            mutating: true,
            label: "gh issue comment",
          });
        }
        if (action === "close" || action === "reopen") {
          const args = ["issue", action, String(number), ...repoFlag(repo)];
          if (action === "close" && comment) args.push("--comment", comment);
          return await ghAction(args, { cwd: dir, mutating: true, label: `gh issue ${action}` });
        }
        const args = ["issue", "edit", String(number), ...repoFlag(repo)];
        if (title) args.push("--title", title);
        if (body !== undefined) args.push("--body", body);
        if (add_label) args.push("--add-label", add_label);
        if (remove_label) args.push("--remove-label", remove_label);
        if (add_assignee) args.push("--add-assignee", add_assignee);
        if (!title && body === undefined && !add_label && !remove_label && !add_assignee) {
          throw new ToolError("Укажи хотя бы одно изменение.");
        }
        return await ghAction(args, { cwd: dir, mutating: true, label: "gh issue edit" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_release",
    {
      title: "Релизы GitHub",
      description:
        "  action=list — последние релизы\n" +
        "  action=view — tag\n" +
        "  action=create — tag, title, notes, draft, prerelease, target, generate_notes, latest\n" +
        "  action=upload — tag + files[](пути к файлам)\n" +
        "  action=delete — tag (требует confirm=true)",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list", "view", "create", "upload", "delete"]).default("list"),
        repo: repoField(z),
        tag: z.string().optional().describe("Тег релиза"),
        title: z.string().optional(),
        notes: z.string().optional(),
        target: z.string().optional().describe("Коммит/ветка для нового тега"),
        draft: z.boolean().default(false),
        prerelease: z.boolean().default(false),
        generate_notes: z.boolean().default(false),
        latest: z.boolean().default(false),
        files: z.union([z.string(), z.array(z.string())]).optional(),
        clobber: z.boolean().default(false).describe("Перезаписать существующие ассеты"),
        cleanup_tag: z.boolean().default(false).describe("Для delete: удалить и сам git-тег"),
        limit: z.number().int().min(1).max(100).default(10),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, action, repo, tag, title, notes, target, draft, prerelease, generate_notes, latest, files, clobber, cleanup_tag, limit, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd);
        if (action === "list") {
          return await ghAction(
            ["release", "list", ...repoFlag(repo), "--limit", String(limit), "--json", "tagName,name,isDraft,isPrerelease,isLatest,publishedAt"],
            { cwd: dir, label: "gh release list" },
          );
        }
        if (action === "view") {
          if (!tag) throw new ToolError("Укажи tag.");
          return await ghAction(["release", "view", tag, ...repoFlag(repo), "--json", "tagName,name,body,isDraft,isPrerelease,publishedAt,url,assets"], {
            cwd: dir,
            label: "gh release view",
          });
        }
        if (action === "create") {
          if (!tag) throw new ToolError("Укажи tag.");
          const args = ["release", "create", tag, ...repoFlag(repo)];
          if (title) args.push("--title", title);
          if (notes !== undefined) args.push("--notes", notes);
          else if (!generate_notes) args.push("--notes", "");
          if (generate_notes) args.push("--generate-notes");
          if (target) args.push("--target", target);
          if (draft) args.push("--draft");
          if (prerelease) args.push("--prerelease");
          if (latest) args.push("--latest");
          return await ghAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "gh release create" });
        }
        if (!tag) throw new ToolError("Укажи tag.");
        if (action === "upload") {
          const list = Array.isArray(files) ? files : files ? [files] : [];
          if (!list.length) throw new ToolError("Укажи files — файлы для загрузки.");
          const args = ["release", "upload", tag, ...repoFlag(repo), ...list];
          if (clobber) args.push("--clobber");
          return await ghAction(args, { cwd: dir, mutating: true, timeout: 900_000, label: "gh release upload" });
        }
        requireConfirm(confirm, `gh release delete ${tag}`);
        const args = ["release", "delete", tag, ...repoFlag(repo), "--yes"];
        if (cleanup_tag) args.push("--cleanup-tag");
        return await ghAction(args, { cwd: dir, mutating: true, label: "gh release delete" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_actions",
    {
      title: "GitHub Actions",
      description:
        "  action=list_runs — последние запуски (limit, branch, workflow, status)\n" +
        "  action=view_run — подробности запуска (run_id)\n" +
        "  action=logs — логи запуска (run_id, failed_only)\n" +
        "  action=run — запустить workflow (workflow, ref, inputs)\n" +
        "  action=cancel / rerun — run_id (failed_only)\n" +
        "  action=list_workflows — доступные workflow",
      inputSchema: {
        cwd: cwdSchema(z),
        action: z.enum(["list_runs", "view_run", "logs", "run", "cancel", "rerun", "list_workflows"]).default("list_runs"),
        repo: repoField(z),
        run_id: z.string().optional().describe("ID запуска"),
        workflow: z.string().optional().describe("Имя, файл или ID workflow"),
        branch: z.string().optional(),
        status: z.enum(["queued", "in_progress", "completed", "success", "failure", "cancelled", "skipped"]).optional(),
        ref: z.string().optional().describe("Ветка/тег для запуска"),
        inputs: z.record(z.string(), z.string()).optional().describe("Параметры workflow (key: value)"),
        failed_only: z.boolean().default(false),
        limit: z.number().int().min(1).max(100).default(15),
      },
    },
    async ({ cwd, action, repo, run_id, workflow, branch, status, ref, inputs, failed_only, limit }) => {
      try {
        const dir = resolveExistingDir(cwd);

        if (action === "list_workflows") {
          return await ghAction(
            ["workflow", "list", ...repoFlag(repo), "--limit", String(limit), "--json", "name,path,state,id"],
            { cwd: dir, label: "gh workflow list" },
          );
        }
        if (action === "list_runs") {
          const args = ["run", "list", ...repoFlag(repo), "--limit", String(limit), "--json", "databaseId,name,displayTitle,status,conclusion,headBranch,event,createdAt,url"];
          if (branch) args.push("--branch", branch);
          if (workflow) args.push("--workflow", workflow);
          if (status) args.push("--status", status);
          return await ghAction(args, { cwd: dir, label: "gh run list" });
        }
        if (!run_id && action !== "run") throw new ToolError("Укажи run_id.");
        if (action === "view_run") {
          return await ghAction(["run", "view", run_id, ...repoFlag(repo)], { cwd: dir, label: "gh run view" });
        }
        if (action === "logs") {
          const args = ["run", "view", run_id, ...repoFlag(repo), "--log"];
          if (failed_only) args.push("--log-failed");
          return await ghAction(args, { cwd: dir, timeout: 300_000, label: "gh run view --log" });
        }
        if (action === "run") {
          if (!workflow) throw new ToolError("Укажи workflow — имя, файл или ID.");
          const args = ["workflow", "run", workflow, ...repoFlag(repo)];
          if (ref) args.push("--ref", ref);
          for (const [key, value] of Object.entries(inputs || {})) args.push("-f", `${key}=${value}`);
          return await ghAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "gh workflow run" });
        }
        if (action === "cancel") {
          return await ghAction(["run", "cancel", run_id, ...repoFlag(repo)], { cwd: dir, mutating: true, label: "gh run cancel" });
        }
        const args = ["run", "rerun", run_id, ...repoFlag(repo)];
        if (failed_only) args.push("--failed");
        return await ghAction(args, { cwd: dir, mutating: true, timeout: 300_000, label: "gh run rerun" });
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "gh_api",
    {
      title: "Произвольный GitHub API",
      description:
        "Прямой вызов GitHub REST/GraphQL через gh api.\n\n" +
        "  endpoint — например repos/{owner}/{repo}/pulls или /user\n" +
        "  method — auto (по умолчанию: GET, либо POST при наличии fields)\n" +
        "  fields — объект key: value (передаётся как -f, строки)\n" +
        "  json_body — тело запроса как JSON-строка (--input -)\n" +
        "  jq — фильтр вывода; paginate — собрать все страницы; headers — доп. заголовки\n\n" +
        "Осторожно: это полный доступ к API в рамках прав токена.",
      inputSchema: {
        cwd: cwdSchema(z),
        endpoint: z.string().describe("Путь API, например repos/{owner}/{repo}/issues"),
        method: z.enum(["auto", "GET", "POST", "PATCH", "PUT", "DELETE"]).default("auto"),
        fields: z.record(z.string(), z.string()).optional(),
        json_body: z.string().optional().describe("JSON-тело запроса"),
        jq: z.string().optional(),
        headers: z.record(z.string(), z.string()).optional(),
        paginate: z.boolean().default(false),
        confirm: z.boolean().default(false),
      },
    },
    async ({ cwd, endpoint, method, fields, json_body, jq, headers, paginate, confirm }) => {
      try {
        const dir = resolveExistingDir(cwd);
        const resolvedMethod = method === "auto" ? (fields || json_body ? "POST" : "GET") : method;
        if (["POST", "PATCH", "PUT", "DELETE"].includes(resolvedMethod)) {
          requireConfirm(confirm, `gh api ${resolvedMethod} ${endpoint}`, " Это изменит данные на GitHub.");
        }
        const args = ["api", endpoint, "--method", resolvedMethod];
        if (paginate) args.push("--paginate");
        for (const [key, value] of Object.entries(headers || {})) args.push("-H", `${key}: ${value}`);
        for (const [key, value] of Object.entries(fields || {})) args.push("-f", `${key}=${value}`);
        if (json_body) args.push("--input", "-");
        if (jq) args.push("--jq", jq);
        return await ghAction(args, {
          cwd: dir,
          input: json_body,
          mutating: resolvedMethod !== "GET",
          timeout: 300_000,
          label: "gh api",
        });
      } catch (error) {
        return failure(error);
      }
    },
  );
}
