/**
 * Запуск внешних процессов (git / gh) без shell.
 *
 * Всегда используется spawn с массивом аргументов — никаких shell-строк,
 * поэтому произвольные имена файлов, ветки и сообщения коммитов безопасны.
 */
import { spawn } from "node:child_process";

/** Жёсткий лимит на объём захваченного вывода (защита от гигантских diff). */
const MAX_CAPTURE_BYTES = 8 * 1024 * 1024;

/** Сколько символов отдавать в ответ инструмента по умолчанию. */
export const MAX_OUTPUT_CHARS = Number(process.env.GIT_MCP_MAX_OUTPUT_CHARS || 60_000);

export class ToolError extends Error {
  constructor(message, { hint, command } = {}) {
    super(message);
    this.name = "ToolError";
    this.hint = hint;
    this.command = command;
  }
}

function quoteArg(arg) {
  if (arg === "") return '""';
  if (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(arg)) return arg;
  return `"${arg.replace(/(["\\])/g, "\\$1")}"`;
}

export function formatCommand(bin, args) {
  return [bin, ...args].map(quoteArg).join(" ");
}

/**
 * Запускает процесс и собирает stdout/stderr.
 * @returns {Promise<{code:number, signal:string|null, stdout:string, stderr:string, overflow:boolean, command:string, durationMs:number}>}
 */
export function runProcess(bin, args, { cwd, timeout = 120_000, input, env } = {}) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const command = formatCommand(bin, args);
    const child = spawn(bin, args, {
      cwd,
      windowsHide: true,
      env: {
        ...process.env,
        GIT_PAGER: "cat",
        GIT_TERMINAL_PROMPT: "0",
        GIT_MERGE_AUTOEDIT: "no",
        GH_PAGER: "cat",
        GH_PROMPT_DISABLED: "1",
        NO_COLOR: "1",
        ...env,
      },
    });

    let stdout = "";
    let stderr = "";
    let overflow = false;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      if (stdout.length + chunk.length > MAX_CAPTURE_BYTES) {
        overflow = true;
        child.kill();
        return;
      }
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length + chunk.length > MAX_CAPTURE_BYTES) return;
      stderr += chunk;
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new ToolError(`Таймаут ${Math.round(timeout / 1000)} с: ${command}`, { command }));
    }, timeout);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(
        new ToolError(`Не удалось запустить «${bin}»: ${error.message}`, {
          hint: bin === "gh" ? "Установи GitHub CLI и выполни gh auth login." : "Проверь, что git установлен и есть в PATH.",
          command,
        }),
      );
    });

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({
        code: code ?? (signal ? 124 : 1),
        signal: signal ?? null,
        stdout,
        stderr,
        overflow,
        command,
        durationMs: Date.now() - startedAt,
      });
    });

    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

/** git с безопасными глобальными настройками. */
export function git(args, options = {}) {
  return runProcess(
    "git",
    ["--no-pager", "-c", "color.ui=false", "-c", "core.quotepath=false", ...args],
    options,
  );
}

/** gh (GitHub CLI). */
export function gh(args, options = {}) {
  return runProcess("gh", args, options);
}

/** Обрезает вывод, сохраняя начало и добавляя пометку. */
export function truncate(textValue, maxChars = MAX_OUTPUT_CHARS) {
  if (textValue.length <= maxChars) return textValue;
  const head = Math.floor(maxChars * 0.7);
  const tail = maxChars - head;
  return (
    textValue.slice(0, head) +
    `\n\n… [вывод обрезан: ${textValue.length - maxChars} символов скрыто] …\n\n` +
    textValue.slice(-tail)
  );
}

export function isMutatingEnvDryRun() {
  return ["1", "true", "yes"].includes(String(process.env.GIT_MCP_DRY_RUN || "").toLowerCase());
}
