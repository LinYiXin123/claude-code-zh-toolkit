(() => {
  const builtinMap = new Map([
    ["New session", "新会话"],
    ["Pinned", "已固定"],
    ["General coding session", "通用编程会话"],
    ["Claude API", "Claude 接口"],
    ["aspnet-core", "ASP.NET Core（.NET Web）"],
    ["auto-mode", "自动模式"],
    ["batch", "批量处理"],
    ["browser", "浏览器控制"],
    ["build-chatgpt-app", "构建 ChatGPT 应用"],
    ["chatgpt-app-submission", "ChatGPT 应用提交流程"],
    ["chatgpt-apps", "ChatGPT 应用"],
    ["claude-api", "Claude API"],
    ["claude-hud", "Claude HUD"],
    ["cli-creator", "CLI 创建器"],
    ["cloudflare-deploy", "Cloudflare 部署"],
    ["codex-app-parity", "Codex 应用一致性"],
    ["color", "颜色设置"],
    ["compact", "压缩上下文"],
    ["consolidate-memory", "整理记忆"],
    ["context", "上下文"],
    ["debug", "调试"],
    ["develop-web-game", "Web 游戏开发"],
    ["doc", "文档处理"],
    ["documents", "文档"],
    ["fewer-permission-prompts", "减少权限提示"],
    ["figma", "Figma 设计支持"],
    ["figma-code-connect-components", "Figma 代码连接组件"],
    ["figma-create-design-system-rules", "Figma 设计系统规则"],
    ["figma-create-new-file", "Figma 新建文件"],
    ["figma-generate-design", "Figma 生成设计"],
    ["figma-generate-library", "Figma 设计系统库"],
    ["figma-implement-design", "Figma 设计转代码"],
    ["figma-use", "Figma 使用"],
    ["frontend-design", "前端设计"],
    ["frontend-skill", "前端界面开发"],
    ["gh-address-comments", "GitHub 评论处理"],
    ["gh-fix-ci", "GitHub 修复 CI"],
    ["github", "GitHub"],
    ["hatch-pet", "孵化宠物"],
    ["imagegen", "图片生成"],
    ["init", "初始化"],
    ["insights", "洞察"],
    ["jupyter-notebook", "Jupyter 笔记本"],
    ["linear", "Linear"],
    ["loop", "循环执行"],
    ["lunwen", "论文写作"],
    ["migrate-to-codex", "迁移到 Codex"],
    ["netlify-deploy", "Netlify 部署"],
    ["notion-knowledge-capture", "Notion 知识沉淀"],
    ["notion-meeting-intelligence", "Notion 会议助手"],
    ["notion-research-documentation", "Notion 研究文档"],
    ["notion-spec-to-implementation", "Notion 规格落地"],
    ["openai-docs", "OpenAI 文档"],
    ["pdf", "PDF 处理"],
    ["playwright", "Playwright 自动化"],
    ["playwright-interactive", "Playwright 交互调试"],
    ["plugin-creator", "插件创建器"],
    ["pwa-react-netlify-adb", "PWA React Netlify ADB"],
    ["render-deploy", "Render 部署"],
    ["review", "审查"],
    ["screenshot", "截图"],
    ["security-review", "安全审查"],
    ["security-best-practices", "安全最佳实践"],
    ["security-ownership-map", "安全所有权分析"],
    ["security-threat-model", "安全威胁建模"],
    ["sentry", "Sentry"],
    ["skill-creator", "技能创建器"],
    ["skill-installer", "技能安装器"],
    ["simplify", "简化"],
    ["sora", "Sora 视频"],
    ["speech", "语音生成"],
    ["team-onboarding", "团队入门"],
    ["telegram-bridge-send", "Telegram 发送"],
    ["transcribe", "音频转写"],
    ["twitter-auto-post-shizuku", "Twitter 自动发送"],
    ["update-config", "更新配置"],
    ["usage", "用量"],
    ["vercel-deploy", "Vercel 部署"],
    ["winui-app", "WinUI 应用"],
    ["model", "模型"],
    ["yeet", "Git 推送发布"],
    ["Free up context by summarizing the conversation so far", "通过总结当前对话来释放上下文"],
    ["Build, review, refactor, or architect ASP.NET Core web applications using current official guidance for .NET web development.", "构建和审查 ASP.NET Core Web 应用"],
    ["Build, scaffold, refactor, and troubleshoot ChatGPT Apps SDK applications that combine an MCP server and widget UI.", "构建、脚手架、重构和排查 ChatGPT 应用"],
    ["Deploy applications and infrastructure to Cloudflare using Workers, Pages, and related platform services.", "将应用和基础设施部署到 Cloudflare"],
    ["Use when implementing or changing user-visible behavior/UI in this repository and parity with the installed Codex desktop app must be validated before coding.", "修改界面或行为时与 Codex 桌面版保持一致"],
    ["Use when the task involves reading, creating, or editing `.docx` documents, especially when formatting or layout fidelity matters; prefer `python-docx` plus the bundled `scripts/render_docx.py` for visual checks.", "创建、阅读和编辑 DOCX 文档"],
    ["Use when the user asks to create, scaffold, or edit Jupyter notebooks (`.ipynb`) for experiments, explorations, or tutorials; prefer the bundled templates and run the helper script `new_notebook.py` to generate a clean starting notebook.", "创建和编辑 Jupyter 笔记本"],
    ["Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) via `playwright-cli` or the bundled wrapper script.", "使用浏览器自动化进行页面测试与调试"],
    ["Use when tasks involve reading, creating, or reviewing PDF files where rendering and layout matter; prefer visual checks by rendering pages (Poppler) and use Python tools such as `reportlab`, `pdfplumber`, and `pypdf` for generation and extraction.", "读取、创建和审查 PDF 文件"],
    ["Use when the user asks for text-to-speech narration or voiceover, accessibility reads, audio prompts, or batch speech generation via the OpenAI Audio API; run the bundled CLI (`scripts/text_to_speech.py`) with built-in voices and require `OPENAI_API_KEY` for live calls.", "生成文本转语音旁白或配音"],
    ["Use when the user asks to deploy, host, publish, or set up their application on Render's cloud platform.", "部署应用到 Render"],
    ["Deploy applications and websites to Vercel.", "部署应用到 Vercel"],
    ["Build a composable CLI for Codex from API docs, an OpenAPI spec, existing curl examples, an SDK, a web app, an admin tool, or a local script.", "为 Codex 构建可组合 CLI"],
    ["Create, repair, validate, preview, and package Codex-compatible animated pet spritesheets from character art, screenshots, generated images, or visual references.", "创建和修复 Codex 动画宠物素材"],
    ["Perform language and framework specific security best-practice reviews and suggest improvements.", "执行安全最佳实践审查并给出改进建议"],
    ["Repository-grounded threat modeling that enumerates trust boundaries, assets, attacker capabilities, abuse paths, and mitigations, and writes a concise Markdown threat model.", "基于仓库进行威胁建模"],
    ["Analyze git repositories to build a security ownership topology (people-to-file), compute bus factor and sensitive-code ownership, and export CSV/JSON for graph databases and visualization.", "分析代码仓库的安全所有权与风险分布"],
    ["Access camera, microphone, calendar, location, clipboard, notifications, and run Java on the Android host via bsh", "访问安卓设备的相机、麦克风、日历、位置和剪贴板"],
    ["Set this session's prompt-box glow color", "设置当前会话的提示框发光颜色"],
    ["Automatically choose the best working mode for the current task", "根据当前任务自动选择合适的工作模式"],
    ["Run multiple similar tasks in a batch", "批量执行多个相似任务"],
    ["Use Claude API from apps, scripts, or integrations", "在应用、脚本或集成中使用 Claude API"],
    ["Consolidate related memories into a cleaner long-term summary", "整理并合并相关记忆为更清晰的长期摘要"],
    ["Inspect or manage the current conversation context", "查看或管理当前会话上下文"],
    ["Use a systematic debugging workflow to locate and fix problems", "使用系统化调试流程定位并修复问题"]
    ,["Scan your transcripts for common read-only Bash and MCP tool calls, then add a prioritized allowlist to project claude/settings.json to reduce permission prompts.", "扫描你的历史记录，找出常见的只读 Bash 和 MCP 工具调用，并把它们按优先级加入项目 `claude/settings.json` 白名单，以减少权限提示。"]
    ,["Run a prompt or slash command on a recurring interval (e.g. /loop 5m /foo, defaults to 10m)", "按固定时间间隔重复运行提示词或斜杠命令（例如 `/loop 5m /foo`，默认 10 分钟）。"]
    ,["Complete a security review of the pending changes on the current branch", "对当前分支待提交的更改完成一次安全审查。"]
    ,["Use this skill to configure the Claude Code harness via settings.json.", "使用这个技能通过 `settings.json` 配置 Claude Code 运行环境。"]
    ,["Automated behaviors (“from now on when X”, “each time X”, “whenever X”, “before/after X”) require hooks configured in settings.json - the harness executes these, not Claude, so memory/preferences cannot fulfill them.", "自动化行为（如“从现在起当 X 时”“每次 X 时”“无论何时 X”“X 前后”）需要在 `settings.json` 中配置 hooks；这些行为由运行环境执行，不是 Claude 本身执行，所以记忆或偏好设置无法替代。"]
    ,["Also use for: permissions (“allow X”, “add permission”, “move permission to”), env vars (“set X=Y”), hook troubleshooting, or any changes to settings.json/settings.local.json files.", "它也可用于：权限设置（如“允许 X”“添加权限”“移动权限到……”）、环境变量（如“设置 X=Y”）、hook 排错，以及任何对 `settings.json` / `settings.local.json` 的修改。"]
    ,["Examples: “allow npm commands”, “add log permissions to global settings”, “move permission to user settings”, “set DEBUG=true”, “when claude stops show X”.", "例如：“允许 npm 命令”“把日志权限加到全局设置”“把权限移动到用户设置”“设置 DEBUG=true”“当 Claude 停止时显示 X”。"]
    ,["For simple settings like theme/model, suggest the /config command instead.", "对于主题、模型这类简单设置，建议优先使用 `/config` 命令。"]
  ]);

  const elementMarker = "data-skill-display-patched";
  const mapUrl = "./skill-display-map.json";
  const textMap = new Map();
  const cacheStorageKey = "skill-display-auto-zh-cache-v1";
  const pendingTranslations = new Set();
  const tooltipSelector = [
    "[role='tooltip']",
    "[data-radix-popper-content-wrapper]",
    "[data-radix-tooltip-content]",
    "[class*='tooltip']",
    "[class*='Tooltip']",
    "[class*='popover']",
    "[class*='Popover']"
  ].join(", ");

  function rebuildTextMap(extraMap) {
    textMap.clear();
    for (const [key, value] of builtinMap.entries()) {
      textMap.set(key, value);
    }

    const cachedMap = loadCachedMap();
    for (const [key, value] of Object.entries(cachedMap)) {
      if (key && value) {
        textMap.set(key, String(value));
      }
    }

    if (extraMap && typeof extraMap === "object") {
      for (const [key, value] of Object.entries(extraMap)) {
        if (key && value) {
          textMap.set(key, String(value));
        }
      }
    }
  }

  rebuildTextMap();

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function loadCachedMap() {
    try {
      const raw = localStorage.getItem(cacheStorageKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveCachedMap(mapObject) {
    try {
      localStorage.setItem(cacheStorageKey, JSON.stringify(mapObject));
    } catch (_) {
    }
  }

  function rememberAutoTranslation(source, target) {
    const normalizedSource = normalizeText(source);
    const normalizedTarget = normalizeText(target);
    if (!normalizedSource || !normalizedTarget || normalizedSource === normalizedTarget) {
      return false;
    }

    const cachedMap = loadCachedMap();
    if (cachedMap[normalizedSource] === normalizedTarget) {
      return false;
    }

    cachedMap[normalizedSource] = normalizedTarget;
    saveCachedMap(cachedMap);
    textMap.set(normalizedSource, normalizedTarget);
    return true;
  }

  function shouldTranslateText(text) {
    const normalized = normalizeText(text);
    if (!normalized || normalized.length < 2 || normalized.length > 600) {
      return false;
    }
    if (/[\u3400-\u9fff]/.test(normalized)) {
      return false;
    }
    if (!/[A-Za-z]/.test(normalized)) {
      return false;
    }
    if (/^[\d\s`~!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(normalized)) {
      return false;
    }
    return true;
  }

  function sanitizeTranslation(text) {
    return normalizeText(
      String(text || "")
        .replace(/^["'\s]+|["'\s]+$/g, "")
        .replace(/^中文[:：]\s*/i, "")
    );
  }

  function collapseMixedBilingualText(text) {
    const raw = String(text || "");
    return normalizeText(
      raw
        .replace(/([A-Za-z][A-Za-z0-9 .:/_-]{1,80})\s*\[([^\]]{1,80})\]/g, "$2")
        .replace(/\bNew session\b/gi, "新会话")
        .replace(/\bPinned\b/gi, "已固定")
    );
  }

  async function translateAndStore(text) {
    const normalized = normalizeText(text);
    if (!shouldTranslateText(normalized) || pendingTranslations.has(normalized) || textMap.has(normalized)) {
      return;
    }

    pendingTranslations.add(normalized);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(normalized)}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const translated = sanitizeTranslation(
        Array.isArray(payload?.[0]) ? payload[0].map((item) => Array.isArray(item) ? item[0] : "").join("") : ""
      );

      if (!translated || translated === normalized) {
        return;
      }

      if (rememberAutoTranslation(normalized, translated)) {
        patchTree(document);
      }
    } catch (_) {
    } finally {
      pendingTranslations.delete(normalized);
    }
  }

  function getReplacement(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return null;
    }

    const exact = textMap.get(normalized);
    if (exact) {
      return exact;
    }

    let replaced = normalized;
    let changed = false;
    for (const [source, target] of textMap.entries()) {
      if (
        source &&
        source !== target &&
        shouldUsePartialReplacement(source) &&
        replaced.includes(source)
      ) {
        replaced = replaced.split(source).join(target);
        changed = true;
      }
    }

    return changed ? replaced : null;
  }

  function shouldUsePartialReplacement(source) {
    const normalized = normalizeText(source);
    if (!normalized) {
      return false;
    }

    if (normalized.length >= 12) {
      return true;
    }

    if (/\s/.test(normalized)) {
      return true;
    }

    return /[^\w-]/.test(normalized);
  }

  function isTooltipLike(element) {
    return !!(element && element.matches && element.matches(tooltipSelector));
  }

  function isShortReadableText(text) {
    return !!text && text.length <= 320;
  }

  function shouldSkipElement(element) {
    return !element ||
      element.closest("input, textarea, [contenteditable='true'], [contenteditable=''], [role='textbox']");
  }

  function replaceExactTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const parent = node.parentElement;
    if (!parent || shouldSkipElement(parent)) {
      return;
    }

    const raw = node.nodeValue;
    const normalized = normalizeText(raw);
    if (!normalized) {
      return;
    }

    const replacement = getReplacement(normalized);
    if (!replacement || normalized === replacement) {
      translateAndStore(normalized);
      return;
    }

    const updated = raw.includes(normalized)
      ? raw.replace(normalized, collapseMixedBilingualText(replacement))
      : replacement;
    node.nodeValue = updated;
    parent.setAttribute(elementMarker, "1");
  }

  function replaceAttribute(element, name) {
    const current = element.getAttribute(name);
    if (!current) {
      return;
    }

    const replacement = getReplacement(current);
    if (replacement && replacement !== current) {
      element.setAttribute(name, collapseMixedBilingualText(replacement));
      return;
    }

    translateAndStore(current);
  }

  function replaceWholeText(element) {
    if (!(element instanceof HTMLElement) || shouldSkipElement(element)) {
      return;
    }

    const current = element.textContent;
    const normalized = normalizeText(current);
    if (!isShortReadableText(normalized)) {
      return;
    }

    const replacement = getReplacement(current);
    if (!replacement || replacement === normalized) {
      translateAndStore(current);
      return;
    }

    element.textContent = collapseMixedBilingualText(replacement);
    element.setAttribute(elementMarker, "1");
  }

  function shouldPatchWholeElement(element) {
    if (!(element instanceof HTMLElement) || shouldSkipElement(element)) {
      return false;
    }

    if (isTooltipLike(element)) {
      return true;
    }

    const title = element.getAttribute("title");
    const ariaLabel = element.getAttribute("aria-label");
    if ((title && getReplacement(title)) || (ariaLabel && getReplacement(ariaLabel))) {
      return true;
    }

    const childElementCount = element.childElementCount;
    const normalized = normalizeText(element.textContent);
    if (!isShortReadableText(normalized)) {
      return false;
    }

    if (childElementCount <= 2 && (element.matches("[role='menuitem'], [role='option'], button, [data-slot]") || element.closest("[role='tooltip']"))) {
      return true;
    }

    return false;
  }

  function patchElement(element) {
    if (!(element instanceof HTMLElement) || shouldSkipElement(element)) {
      return;
    }

    replaceAttribute(element, "title");
    replaceAttribute(element, "aria-label");
    replaceAttribute(element, "placeholder");
    replaceAttribute(element, "data-tooltip");
    replaceAttribute(element, "data-tooltip-content");
    replaceAttribute(element, "data-original-title");

    if (
      element.childNodes.length === 1 &&
      element.firstChild &&
      element.firstChild.nodeType === Node.TEXT_NODE
    ) {
      replaceExactTextNode(element.firstChild);
    }

    if (shouldPatchWholeElement(element)) {
      replaceWholeText(element);
    }
  }

  function patchTree(root) {
    if (!root) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      replaceExactTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    let current = walker.currentNode;
    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        replaceExactTextNode(current);
      } else if (current.nodeType === Node.ELEMENT_NODE) {
        patchElement(current);
      }
      current = walker.nextNode();
    }
  }

  function queueAutoTranslateFromTree(root) {
    if (!root || !document?.createTreeWalker) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    let current = walker.currentNode;
    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        const value = normalizeText(current.nodeValue);
        if (shouldTranslateText(value)) {
          translateAndStore(value);
        }
      } else if (current.nodeType === Node.ELEMENT_NODE && current instanceof HTMLElement) {
        ["title", "aria-label", "placeholder", "data-tooltip", "data-tooltip-content", "data-original-title"].forEach((attr) => {
          const value = current.getAttribute(attr);
          if (shouldTranslateText(value)) {
            translateAndStore(value);
          }
        });

        const text = normalizeText(current.textContent);
        if (isTooltipLike(current) && shouldTranslateText(text)) {
          translateAndStore(text);
        }
      }

      current = walker.nextNode();
    }
  }

  function startObserver() {
    patchTree(document);
    queueAutoTranslateFromTree(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          replaceExactTextNode(mutation.target);
          continue;
        }

        if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
          patchElement(mutation.target);
        }

        mutation.addedNodes.forEach((node) => {
          patchTree(node);
          queueAutoTranslateFromTree(node);
        });
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "aria-label", "placeholder"]
    });

    setInterval(() => {
      patchTree(document);
      queueAutoTranslateFromTree(document);
    }, 1500);
  }

  async function loadDynamicMap() {
    try {
      const response = await fetch(`${mapUrl}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      rebuildTextMap(payload?.replacements);
      patchTree(document);
    } catch (_) {
    }
  }

  setInterval(() => {
    loadDynamicMap();
  }, 5000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      startObserver();
      loadDynamicMap();
    }, { once: true });
  } else {
    startObserver();
    loadDynamicMap();
  }
})();
