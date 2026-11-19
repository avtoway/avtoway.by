/**
 * Общие помощники для инструментов: ответы MCP, проверки подтверждений,
 * запуск git/gh с человекочитаемым результатом.
 */
import { gh, git, isMutatingEnvDryRun, ToolError, truncate, formatCommand } from "./exec.mjs";

const log = (message) => process.stderr.write(`[git-mcp] ${message}\n`);

export function text(value) {
  return { content: [{ type: "text", text: String(value) }] };
}

export function json(value) {
  return text(JSON.stringify(value, null, 2));
}

export function failure(error) {
  if (error instanceof ToolError) {
    const lines = [`Ошибка: ${error.message}`];
    if (error.command) lines.push(`\nКоманда: ${error.command}`);
    if (error.hint) lines.push(`\nПодсказка: ${error.hint}`);
    log(`${error.message.split("\n")[0]}${error.command ? ` | ${error.command}` : ""}`);
    return { isError: true, content: [{ type: "text", text: lines.join("") }] };
  }
  log(`Необработанная ошибка: ${error?.stack || error}`);
  return {
    isError: true,
    content: [{ type: "text", text: `Внутренняя ошибка: ${error?.stack || error}` }],
  };
}

/** Для разрушительных операций требуем явное подтверждение. */
export function requireConfirm(confirm, action, extraHint = "") {
  if (confirm === true) return;
  throw new ToolError(`Операция «${action}» изменяет/удаляет данные и требует confirm=true.`, {
    hint:
      "Сначала покажи пользователю, что именно будет сделано (ветка, коммиты, файлы, remote), и получи согласие." +
      extraHint,
  });
}

function joinOutput(result) {
  const parts = [];
  if (result.stdout.trim()) parts.push(result.stdout.trim());
  if (result.stderr.trim()) parts.push(result.stderr.trim());
  if (result.overflow) parts.push("[вывод превысил лимит и был остановлен]");
  return parts.join("\n");
}

/**
 * Выполняет git-команду и возвращает MCP-ответ.
 * @param {string[]} args
 */
export async function gitAction(args, options = {}) {
  const {
    cwd,
    okCodes = [0],
    timeout = 120_000,
    input,
    mutating = false,
    label = "git",
    emptyMessage,
  } = options;

  if (mutating && isMutatingEnvDryRun()) {
    return text(`GIT_MCP_DRY_RUN=1 — команда НЕ выполнена (только предпросмотр):\n\n${formatCommand("git", args)}`);
  }

  const result = await git(args, { cwd, timeout, input });
  const output = joinOutput(result);

  // Код 0 — успех. Для команд вроде merge/cherry-pick код 1 может означать
  // конфликт (это не ошибка инструмента), но «fatal:» всегда реальная ошибка.
  const fatal = /(^|\n)fatal:/.test(result.stderr);

  if (!okCodes.includes(result.code) || fatal) {
    throw new ToolError(
      `git завершился с кодом ${result.code}${output ? `:\n\n${truncate(output, 12_000)}` : " (без вывода)"}`,
      { command: result.command },
    );
  }

  if (!output) return text(emptyMessage || `${label}: выполнено, вывода нет.`);
  return text(truncate(output));
}

/** Выполняет gh-команду и возвращает MCP-ответ. */
export async function ghAction(args, options = {}) {
  const { cwd, okCodes = [0], timeout = 120_000, input, mutating = false, label = "gh", emptyMessage } = options;

  if (mutating && isMutatingEnvDryRun()) {
    return text(`GIT_MCP_DRY_RUN=1 — команда НЕ выполнена (только предпросмотр):\n\n${formatCommand("gh", args)}`);
  }

  const result = await gh(args, { cwd, timeout, input });
  const output = joinOutput(result);

  if (!okCodes.includes(result.code)) {
    throw new ToolError(
      `gh завершился с кодом ${result.code}${output ? `:\n\n${truncate(output, 12_000)}` : " (без вывода)"}`,
      {
        command: result.command,
        hint:
          result.code === 4
            ? "Нужна авторизация: gh auth login (или проверь GH_TOKEN)."
            : undefined,
      },
    );
  }

  if (!output) return text(emptyMessage || `${label}: выполнено, вывода нет.`);
  return text(truncate(output));
}

/** Нормализует массив строк (пути, refspec, коммиты) из строки или массива. */
export function toList(value) {
  if (value === undefined || value === null) return [];
  const items = Array.isArray(value) ? value : [value];
  return items
    .flatMap((item) => String(item).split(/\r?\n/))
    .map((item) => item.trim())
    .filter(Boolean);
}

export { log };
