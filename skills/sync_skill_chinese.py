from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


CODEX_HOME = Path.home() / ".codex"
TOOL_DIR = Path(__file__).resolve().parent
OVERRIDES_PATH = TOOL_DIR / "skill_chinese_overrides.json"
STATE_PATH = TOOL_DIR / "skill_chinese_state.json"
DISPLAY_MAP_PATH = TOOL_DIR / "skill_display_map.json"
LOCK_PATH = TOOL_DIR / "skill_chinese_watch.lock"
LOG_DIR = TOOL_DIR / "logs"
LOG_PATH = LOG_DIR / "skill_chinese.log"
WATCH_FILES = {"SKILL.md", "openai.yaml", "plugin.json"}
CJK_RE = re.compile(r"[\u3400-\u9fff]")
DEFAULT_ION_DIST_CANDIDATES = [
    Path.home() / "AppData" / "Local" / "ClaudeZhCN" / "Claude" / "resources" / "ion-dist",
    Path(r"D:\ClaudeZhCN\Claude\resources\ion-dist"),
    Path(r"C:\ClaudeZhCN\Claude\resources\ion-dist"),
]


def resolve_ion_dist_dir() -> Path | None:
    env_path = os.environ.get("CLAUDE_ZH_ION_DIST", "").strip()
    if env_path:
        candidate = Path(env_path).expanduser()
        if candidate.exists():
            return candidate

    for candidate in DEFAULT_ION_DIST_CANDIDATES:
        if candidate.exists():
            return candidate

    return None


ION_DIST_DIR = resolve_ion_dist_dir()
ION_DIST_MAP_PATH = ION_DIST_DIR / "skill-display-map.json" if ION_DIST_DIR else None


def setup_logging(verbose: bool) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    handlers: list[logging.Handler] = [logging.FileHandler(LOG_PATH, encoding="utf-8")]
    if verbose:
        handlers.append(logging.StreamHandler(sys.stdout))
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=handlers,
    )


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logging.exception("读取 JSON 失败: %s", path)
        return default


def normalize_override_map(raw: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(raw, dict):
        return {}
    normalized: dict[str, dict[str, Any]] = {}
    for key, value in raw.items():
        if not isinstance(key, str) or not isinstance(value, dict):
            continue
        normalized[key.casefold()] = value
    return normalized


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    atomic_write(path, text)


def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8", newline="\n")
    tmp.replace(path)


def has_cjk(text: str) -> bool:
    return bool(text and CJK_RE.search(text))


def clean_text(text: str) -> str:
    return " ".join((text or "").replace("\r", " ").replace("\n", " ").split()).strip()


def humanize_identifier(text: str) -> str:
    text = clean_text(text)
    if not text:
        return text
    if re.fullmatch(r"[A-Za-z0-9._-]+", text):
        text = text.replace("_", " ").replace("-", " ")
        text = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", text)
    return text


def shrink_description(text: str, limit: int = 32) -> str:
    text = clean_text(text)
    if not text:
        return text

    for sep in ("。", "；", ";", ".", "，", ","):
        if sep in text:
            first = text.split(sep, 1)[0].strip()
            if first:
                text = first
                break

    if len(text) <= limit:
        return text

    for sep in (" 使用 ", " 用 ", " 通过 ", " and ", " with ", " for "):
        if sep in text:
            first = text.split(sep, 1)[0].strip()
            if 4 <= len(first) <= limit:
                return first

    clipped = text[:limit].rstrip(" ，。；,.;")
    return clipped + "..." if clipped != text else clipped


def translate_text(text: str, state: dict[str, Any]) -> str:
    text = clean_text(text)
    if not text:
        return text
    if has_cjk(text):
        return text

    translations = state.setdefault("translations", {})
    cached = translations.get(text)
    if cached:
        return cached

    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl=auto&tl=zh-CN&dt=t&q={urllib.parse.quote(text)}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        translated = "".join(part[0] for part in data[0] if part and part[0])
        translated = clean_text(translated) or text
        translations[text] = translated
        return translated
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        logging.exception("自动翻译失败，保留原文: %s", text)
        return text


def parse_frontmatter(skill_md: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    try:
        text = skill_md.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        logging.exception("读取 SKILL.md 失败: %s", skill_md)
        return result

    if not text.startswith("---"):
        return result

    parts = text.split("---", 2)
    if len(parts) < 3:
        return result

    for line in parts[1].splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip().strip('"').strip("'")
    return result


def read_openai_yaml(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        logging.exception("读取 openai.yaml 失败: %s", path)
        return {}

    meta: dict[str, str] = {}
    for key in ("display_name", "short_description"):
        match = re.search(rf'(?m)^\s*{key}:\s*"([^"]*)"', text)
        if match:
            meta[key] = match.group(1)
            continue
        match = re.search(rf"(?m)^\s*{key}:\s*'([^']*)'", text)
        if match:
            meta[key] = match.group(1)
    return meta


def yaml_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


def upsert_openai_yaml(text: str, display_name: str, short_description: str) -> str:
    display_line = f'  display_name: "{yaml_escape(display_name)}"'
    short_line = f'  short_description: "{yaml_escape(short_description)}"'

    if not text.strip():
        return f"interface:\n{display_line}\n{short_line}\n"

    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    interface_index = next((i for i, line in enumerate(lines) if line.strip() == "interface:"), None)

    if interface_index is None:
        prefix = ["interface:", display_line, short_line, ""]
        return "\n".join(prefix + lines).rstrip() + "\n"

    block_start = interface_index + 1
    block_end = block_start
    while block_end < len(lines):
        line = lines[block_end]
        if line.strip() and not line.startswith(" "):
            break
        block_end += 1

    block = lines[block_start:block_end]
    header: list[str] = []
    remainder: list[str] = []
    seen_content = False
    for line in block:
        is_comment_or_blank = not line.strip() or line.lstrip().startswith("#")
        if not seen_content and is_comment_or_blank:
            header.append(line)
            continue
        seen_content = True
        stripped = line.strip()
        if stripped.startswith("display_name:") or stripped.startswith("short_description:"):
            continue
        remainder.append(line)

    new_block = header + [display_line, short_line] + remainder
    new_lines = lines[:block_start] + new_block + lines[block_end:]
    return "\n".join(new_lines).rstrip() + "\n"


def discover_skill_dirs() -> list[Path]:
    roots = [CODEX_HOME / "skills", CODEX_HOME / "plugins"]
    found: set[Path] = set()
    for root in roots:
        if not root.exists():
            continue
        for skill_md in root.rglob("SKILL.md"):
            found.add(skill_md.parent)
    return sorted(found)


def discover_plugin_jsons() -> list[Path]:
    plugins_root = CODEX_HOME / "plugins"
    if not plugins_root.exists():
        return []
    found: list[Path] = []
    for plugin_json in plugins_root.rglob("plugin.json"):
        if plugin_json.parent.name == ".codex-plugin":
            found.append(plugin_json)
    return sorted(found)


def ensure_skill_txt(skill_dir: Path, display_name: str, short_description: str) -> bool:
    path = skill_dir / "技能作用.txt"
    content = f"技能名称：{display_name}\n技能作用：{short_description}\n"
    existing = path.read_text(encoding="utf-8", errors="ignore") if path.exists() else None
    if existing == content:
        return False
    atomic_write(path, content)
    return True


def build_skill_values(skill_dir: Path, overrides: dict[str, Any], state: dict[str, Any]) -> tuple[str, str, str]:
    skill_md = skill_dir / "SKILL.md"
    yaml_path = skill_dir / "agents" / "openai.yaml"
    frontmatter = parse_frontmatter(skill_md)
    current = read_openai_yaml(yaml_path)

    skill_key = frontmatter.get("name") or skill_dir.name
    skill_lookup = clean_text(skill_key).casefold()
    learned = state.setdefault("skills", {}).get(skill_lookup, {})
    override = overrides.get("skills", {}).get(skill_lookup, {})

    current_display = clean_text(current.get("display_name", ""))
    current_short = clean_text(current.get("short_description", ""))
    fm_name = clean_text(frontmatter.get("name", "")) or skill_dir.name
    fm_desc = clean_text(frontmatter.get("description", ""))

    if override.get("display_name"):
        display_name = override["display_name"]
    elif has_cjk(current_display):
        display_name = current_display
    elif has_cjk(learned.get("display_name", "")):
        display_name = learned["display_name"]
    else:
        display_name = translate_text(humanize_identifier(current_display or fm_name or skill_key), state)

    if override.get("short_description"):
        short_description = override["short_description"]
    elif has_cjk(current_short):
        short_description = current_short
    elif has_cjk(learned.get("short_description", "")):
        short_description = learned["short_description"]
    else:
        source = current_short or fm_desc or f"{display_name} 的说明"
        short_description = shrink_description(translate_text(source, state))

    state.setdefault("skills", {})[skill_lookup] = {
        "skill_key": skill_key,
        "display_name": display_name,
        "short_description": short_description,
        "path": str(skill_dir),
    }
    return skill_key, display_name, short_description


def sync_skill_dir(skill_dir: Path, overrides: dict[str, Any], state: dict[str, Any]) -> tuple[bool, bool]:
    _, display_name, short_description = build_skill_values(skill_dir, overrides, state)
    yaml_path = skill_dir / "agents" / "openai.yaml"
    original = yaml_path.read_text(encoding="utf-8", errors="ignore") if yaml_path.exists() else ""
    updated = upsert_openai_yaml(original, display_name, short_description)
    yaml_changed = updated != original
    if yaml_changed:
        atomic_write(yaml_path, updated)
    txt_changed = ensure_skill_txt(skill_dir, display_name, short_description)
    return yaml_changed, txt_changed


def sync_plugin_json(plugin_json: Path, overrides: dict[str, Any], state: dict[str, Any]) -> bool:
    try:
        data = json.loads(plugin_json.read_text(encoding="utf-8"))
    except Exception:
        logging.exception("读取 plugin.json 失败: %s", plugin_json)
        return False

    plugin_name = clean_text(str(data.get("name", ""))) or plugin_json.parent.parent.name
    plugin_lookup = plugin_name.casefold()
    interface = data.setdefault("interface", {})
    learned = state.setdefault("plugins", {}).get(plugin_lookup, {})
    override = overrides.get("plugins", {}).get(plugin_lookup, {})

    current_display = clean_text(str(interface.get("displayName", "")))
    current_short = clean_text(str(interface.get("shortDescription", "")))

    if override.get("displayName"):
        display_name = override["displayName"]
    elif has_cjk(current_display):
        display_name = current_display
    elif has_cjk(learned.get("displayName", "")):
        display_name = learned["displayName"]
    else:
        display_name = translate_text(humanize_identifier(current_display or plugin_name), state)

    if override.get("shortDescription"):
        short_description = override["shortDescription"]
    elif has_cjk(current_short):
        short_description = current_short
    elif has_cjk(learned.get("shortDescription", "")):
        short_description = learned["shortDescription"]
    else:
        source = current_short or clean_text(str(data.get("description", ""))) or display_name
        short_description = shrink_description(translate_text(source, state))

    changed = False
    if interface.get("displayName") != display_name:
        interface["displayName"] = display_name
        changed = True
    if interface.get("shortDescription") != short_description:
        interface["shortDescription"] = short_description
        changed = True

    state.setdefault("plugins", {})[plugin_lookup] = {
        "plugin_name": plugin_name,
        "displayName": display_name,
        "shortDescription": short_description,
        "path": str(plugin_json),
    }

    if changed:
        atomic_write(plugin_json, json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return changed


def build_display_map(state: dict[str, Any]) -> dict[str, Any]:
    replacements: dict[str, str] = {
        "Free up context by summarizing the conversation so far": "通过总结当前对话来释放上下文",
        "Reflective pass over your memory files — merge duplicates, fix stale facts, prune the index.": "梳理记忆文件：合并重复项、修正过时信息并清理索引。",
        "Enable debug logging for this session and help diagnose issues": "为当前会话启用调试日志并帮助排查问题",
        "Automatically choose the best working mode for the current task": "根据当前任务自动选择合适的工作模式",
        "Run multiple similar tasks in a batch": "批量执行多个相似任务",
        "Use Claude API from apps, scripts, or integrations": "在应用、脚本或集成中使用 Claude API",
        "Consolidate related memories into a cleaner long-term summary": "整理并合并相关记忆为更清晰的长期摘要",
        "Inspect or manage the current conversation context": "查看或管理当前会话上下文",
        "Set this session's prompt-box glow color": "设置当前会话的提示框发光颜色",
        "Enable debug logging for this session and help diagnose issues.": "为当前会话启用调试日志并帮助排查问题",
    }

    for plugin_data in state.get("plugins", {}).values():
        if not isinstance(plugin_data, dict):
            continue
        plugin_name = clean_text(str(plugin_data.get("plugin_name", "")))
        display_name = clean_text(str(plugin_data.get("displayName", "")))
        short_description = clean_text(str(plugin_data.get("shortDescription", "")))
        if plugin_name and display_name and plugin_name != display_name:
            replacements[plugin_name] = display_name
        if short_description and has_cjk(short_description):
            replacements[short_description] = short_description

    for skill_data in state.get("skills", {}).values():
        if not isinstance(skill_data, dict):
            continue
        skill_key = clean_text(str(skill_data.get("skill_key", "")))
        display_name = clean_text(str(skill_data.get("display_name", "")))
        short_description = clean_text(str(skill_data.get("short_description", "")))
        if skill_key and display_name and skill_key != display_name:
            replacements[skill_key] = display_name
        if short_description:
            replacements[short_description] = short_description

    ordered_replacements = dict(
        sorted(
            ((key, value) for key, value in replacements.items() if key and value),
            key=lambda item: len(item[0]),
            reverse=True,
        )
    )

    return {
        "generatedAt": int(time.time()),
        "replacements": ordered_replacements,
    }


def write_display_map(state: dict[str, Any]) -> bool:
    data = build_display_map(state)
    changed = False
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"

    current = DISPLAY_MAP_PATH.read_text(encoding="utf-8", errors="ignore") if DISPLAY_MAP_PATH.exists() else None
    if current != text:
        atomic_write(DISPLAY_MAP_PATH, text)
        changed = True

    if ION_DIST_DIR and ION_DIST_MAP_PATH and ION_DIST_DIR.exists():
        current_ion = ION_DIST_MAP_PATH.read_text(encoding="utf-8", errors="ignore") if ION_DIST_MAP_PATH.exists() else None
        if current_ion != text:
            atomic_write(ION_DIST_MAP_PATH, text)
            changed = True

    return changed


def sync_once() -> dict[str, int]:
    raw_overrides = load_json(OVERRIDES_PATH, {"skills": {}, "plugins": {}})
    overrides = {
        "skills": normalize_override_map(raw_overrides.get("skills", {})),
        "plugins": normalize_override_map(raw_overrides.get("plugins", {})),
    }
    state = load_json(STATE_PATH, {"skills": {}, "plugins": {}, "translations": {}})

    skill_dirs = discover_skill_dirs()
    plugin_jsons = discover_plugin_jsons()

    counts = {
        "skill_dirs": len(skill_dirs),
        "plugin_jsons": len(plugin_jsons),
        "yaml_changed": 0,
        "txt_changed": 0,
        "plugin_changed": 0,
        "display_map_changed": 0,
    }

    for skill_dir in skill_dirs:
        yaml_changed, txt_changed = sync_skill_dir(skill_dir, overrides, state)
        counts["yaml_changed"] += int(yaml_changed)
        counts["txt_changed"] += int(txt_changed)

    for plugin_json in plugin_jsons:
        counts["plugin_changed"] += int(sync_plugin_json(plugin_json, overrides, state))

    counts["display_map_changed"] += int(write_display_map(state))
    save_json(STATE_PATH, state)
    logging.info(
        "同步完成: 技能目录=%s, openai.yaml 更新=%s, 技能作用.txt 更新=%s, plugin.json 更新=%s, 显示映射更新=%s",
        counts["skill_dirs"],
        counts["yaml_changed"],
        counts["txt_changed"],
        counts["plugin_changed"],
        counts["display_map_changed"],
    )
    return counts


def build_snapshot() -> list[tuple[str, int, int]]:
    paths: list[Path] = []
    for root in (CODEX_HOME / "skills", CODEX_HOME / "plugins"):
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and path.name in WATCH_FILES:
                paths.append(path)

    for extra in (OVERRIDES_PATH, TOOL_DIR / "sync_skill_chinese.py"):
        if extra.exists():
            paths.append(extra)

    snapshot: list[tuple[str, int, int]] = []
    for path in sorted(set(paths)):
        try:
            stat = path.stat()
        except OSError:
            continue
        snapshot.append((str(path), stat.st_mtime_ns, stat.st_size))
    return snapshot


def acquire_lock() -> int | None:
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    while True:
        try:
            fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_RDWR)
            os.write(fd, str(os.getpid()).encode("utf-8"))
            return fd
        except FileExistsError:
            try:
                pid_text = LOCK_PATH.read_text(encoding="utf-8").strip()
                pid = int(pid_text)
                os.kill(pid, 0)
                return None
            except Exception:
                try:
                    LOCK_PATH.unlink()
                except OSError:
                    return None


def release_lock(fd: int | None) -> None:
    if fd is None:
        return
    try:
        os.close(fd)
    finally:
        try:
            LOCK_PATH.unlink()
        except OSError:
            pass


def watch_loop(interval: int) -> int:
    fd = acquire_lock()
    if fd is None:
        logging.info("监控已在运行，跳过重复启动。")
        return 0

    try:
        sync_once()
        snapshot = build_snapshot()
        logging.info("开始监控技能变更，轮询间隔 %s 秒。", interval)
        while True:
            time.sleep(interval)
            current = build_snapshot()
            if current == snapshot:
                continue
            time.sleep(2)
            sync_once()
            snapshot = build_snapshot()
    except KeyboardInterrupt:
        logging.info("监控已停止。")
        return 0
    finally:
        release_lock(fd)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="自动同步 Codex 技能中文名称和技能作用说明。")
    parser.add_argument("--watch", action="store_true", help="后台持续监控新增技能并自动同步。")
    parser.add_argument("--once", action="store_true", help="只执行一次同步。")
    parser.add_argument("--interval", type=int, default=30, help="监控模式的轮询秒数。")
    parser.add_argument("--verbose", action="store_true", help="同时输出到控制台。")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    setup_logging(args.verbose)

    if args.watch:
        return watch_loop(max(args.interval, 10))

    counts = sync_once()
    if args.verbose or args.once:
        print(
            "同步完成："
            f"技能目录 {counts['skill_dirs']} 个，"
            f"openai.yaml 更新 {counts['yaml_changed']} 个，"
            f"技能作用.txt 更新 {counts['txt_changed']} 个，"
            f"plugin.json 更新 {counts['plugin_changed']} 个，"
            f"显示映射更新 {counts['display_map_changed']} 个。"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
