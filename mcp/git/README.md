# Git MCP — работа с Git и GitHub для OpenCode

Локальный MCP-сервер (stdio) для полноценной работы с репозиторием: состояние, история,
диффы, коммиты, ветки, merge/rebase/cherry-pick, stash, теги, worktree, submodules,
remotes, fetch/pull/push/clone, обслуживание репозитория. Дополнительно — GitHub через
CLI `gh`: репозитории, PR, issues, релизы, Actions и произвольный API.

Все команды выполняются через `spawn` с массивом аргументов (без shell), поэтому имена
файлов, веток и сообщения коммитов безопасны. Разрушительные операции требуют `confirm=true`.

## Установка

```bash
cd mcp/git
npm install
```

Сервер уже прописан в `opencode.json` как MCP-сервер `git` (инструменты `git_*` и `gh_*`).
После изменения конфигурации перезапусти OpenCode.

Проверка:

```bash
npm run smoke
```

### Использование из другого проекта

По умолчанию корнем считается каталог этого проекта. Чтобы запустить сервер для другого
репозитория, передай `--root`:

```json
{
  "mcp": {
    "servers": {
      "git": {
        "type": "local",
        "command": ["node", "C:/AVTOWAY/avtoway.by/avtoway.by/mcp/git/server.mjs", "--root", "C:/minsktuning"],
        "cwd": "."
      }
    }
  }
}
```

Так `cwd` по умолчанию и все относительные пути будут считаться от `C:/minsktuning`.

## Настройки окружения

| Переменная | Назначение |
|---|---|
| `GIT_MCP_ALLOWED_ROOTS` | Дополнительные каталоги, где разрешено работать (разделитель `;` в Windows, `:` в Unix). По умолчанию доступен только корень проекта. |
| `mcp/git/allowed-roots.txt` | То же самое, но списком путей (по одному в строке, `#` — комментарий). Шаблон: `allowed-roots.example.txt`. Файл в `.gitignore`. |
| `GIT_MCP_DRY_RUN=1` | Изменяющие команды не выполняются, а только показываются (удобно для отладки). |
| `GIT_MCP_MAX_OUTPUT_CHARS` | Лимит символов в ответе инструмента (по умолчанию 60000). |

GitHub-инструменты используют авторизацию `gh auth login` (или `GH_TOKEN`).

## Инструменты

### Чтение и история

| Инструмент | Что делает |
|---|---|
| `git_status` | Ветка, upstream, staged/unstaged/untracked, конфликты (`short`/`porcelain`/`long`) |
| `git_log` | История с фильтрами по ref, автору, датам, сообщению, путям; `stat`/`name_only`/`patch` |
| `git_diff` | Diff рабочей копии, индекса (`staged`), между ref (`from`+`to`), по путям |
| `git_show` | Коммит/тег/объект: метаданные, diff, статистика, отдельный файл |
| `git_blame` | Авторство строк, диапазон строк, ref |
| `git_grep` | `git grep` по рабочей копии или ref: regex/фикс-строка, файлы/счётчики |
| `git_refs` | Ветки, теги, remotes, reflog, сырые refs |
| `git_describe` | Ближайший тег (версия), `--tags`, `--dirty`, `--long` |
| `git_config` | list/get/set/unset, scope local/global/system/worktree |

### Изменения и история

| Инструмент | Что делает |
|---|---|
| `git_add` | paths / `all` / `update` / `intent_to_add`, dry-run |
| `git_commit` | message, `all`, `amend`, `no_verify`, `allow_empty`, `signoff`, `author`, `date` |
| `git_rm` / `git_mv` | Удаление (в т.ч. `cached`) и перемещение файлов |
| `git_restore` | Откат файлов из индекса/HEAD/произвольного ref |
| `git_reset` | soft/mixed/hard (hard — только с `confirm=true`), сброс отдельных путей |
| `git_clean` | По умолчанию dry-run; реальное удаление — с `confirm=true` |
| `git_checkout` / `git_switch` | Переключение веток, создание, orphan, возврат файлов |
| `git_branch` | list/create/delete/rename/set_upstream/unset_upstream |
| `git_merge` | Слияние, `no_ff`/`ff_only`/`squash`, стратегии, abort/continue/quit |
| `git_rebase` | Неинтерактивный rebase, `--onto`, autosquash/autostash, continue/abort/skip |
| `git_cherry_pick` / `git_revert` | Перенос и отмена коммитов, mainline, continue/abort/skip |
| `git_stash` | push/list/show/pop/apply/drop/clear/branch/create |
| `git_tag` | list/create/delete/verify/show, аннотированные теги |
| `git_apply` | Применение патча из текста или файла, `check`/`index`/`3way`/`reverse` |
| `git_maintenance` | gc, fsck, prune, count_objects, reflog_expire, repack |

### Worktree и подмодули

| Инструмент | Что делает |
|---|---|
| `git_worktree` | list/add/remove/prune/move/lock/unlock |
| `git_submodule` | status/update/init/add/sync |

### Remotes и сетевые операции

| Инструмент | Что делает |
|---|---|
| `git_remote` | list/add/remove/rename/set_url/get_url/show/prune |
| `git_fetch` | fetch, `all`, `prune`, `tags`, `depth`, dry-run |
| `git_pull` | pull, `rebase`, `ff_only`, `autostash`, `no_commit` |
| `git_push` | push, `set_upstream`, force/with-lease (confirm), delete (confirm), dry-run |
| `git_clone` | clone с depth/branch/bare/submodules/mirror |
| `git_init` | init с именем основной ветки, bare, shared |

### GitHub (`gh`)

| Инструмент | Что делает |
|---|---|
| `gh_status` | Авторизация, аккаунт, текущий репозиторий |
| `gh_repo` | view/list/create/clone/fork/edit/delete |
| `gh_pr` | list/view/create/merge/close/reopen/ready/comment/review/diff/checkout/checks/edit |
| `gh_issue` | list/view/create/comment/close/reopen/edit |
| `gh_release` | list/view/create/upload/delete |
| `gh_actions` | list_runs/view_run/logs/run/cancel/rerun/list_workflows |
| `gh_api` | Произвольный REST-вызов с `--jq`, пагинацией и заголовками |

## Безопасность

- Работать можно только внутри корня проекта и каталогов из `GIT_MCP_ALLOWED_ROOTS`.
- Нет shell-интерполяции: аргументы передаются напрямую в процесс.
- Разрушительные действия требуют `confirm=true`:
  `reset --hard`, `clean` (реальное удаление), удаление ветки/тега,
  `stash drop/clear`, `push --force`, `push --force-with-lease`, `push --delete`,
  `remote remove`, `worktree remove`, удаление репозитория/релиза,
  изменяющие вызовы `gh_api`.
- При `GIT_MCP_DRY_RUN=1` изменяющие команды только отображаются.
- Вывод обрезается (по умолчанию 60k символов), чтобы не переполнять контекст.
