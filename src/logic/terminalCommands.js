// terminalCommands.js

export const processCommand = (cmd, currentTabs, activeTabId) => {
  const [method, ...args] = cmd.trim().split(/\s+/);
  const response = [];

  switch (method.toLowerCase()) {
    case "help":
      response.push({ text: "SYSTEM UTILITIES:", color: "#444" });
      response.push({ text: "  GOTO [URL]     - Navigate active view", color: "#888" });
      response.push({ text: "  TABS           - List active processes", color: "#888" });
      response.push({ text: "  CLEAR          - Purge terminal buffer", color: "#888" });
      response.push({ text: "  TIME           - Sync with local clock", color: "#888" });
      response.push({ text: "  DATE           - Display current date", color: "#888" });
      response.push({ text: "  WHOAMI         - Display system identity", color: "#888" });
      response.push({ text: "  PING [HOST]    - Test network connectivity", color: "#888" });
      response.push({ text: "  ECHO [TEXT]    - Display text", color: "#888" });
      response.push({ text: "  LS             - List directory contents", color: "#888" });
      break;

    case "clear":
      return { action: "CLEAR_OUTPUT" };

    case "goto":
      if (!args[0]) {
        response.push({ text: "ERR: URL REQUIRED", color: "#f00" });
      } else {
        const url = args[0].startsWith("http") ? args[0] : `https://${args[0]}`;
        window.baldnet?.navigate(url);
        response.push({ text: `NAVIGATING TO: ${url}`, color: "#0f0" });
      }
      break;

    case "tabs":
      currentTabs.forEach((t) => {
        const prefix = t.id === activeTabId ? "[ACTIVE] " : "         ";
        response.push({ text: `${prefix}${t.title} (${t.type})`, color: "#aaa" });
      });
      break;

    case "time":
      response.push({ text: `CURRENT SYSTEM TIME: ${new Date().toLocaleTimeString()}`, color: "#fff" });
      break;

    case "date":
      response.push({ text: `CURRENT SYSTEM DATE: ${new Date().toLocaleDateString()}`, color: "#fff" });
      break;

    case "whoami":
      response.push({ text: "SYSTEM IDENTITY: BALD-NET TERMINAL v1.0", color: "#0f0" });
      response.push({ text: "USER: ANONYMOUS", color: "#0f0" });
      break;

    case "ping":
      if (!args[0]) {
        response.push({ text: "ERR: HOST REQUIRED", color: "#f00" });
      } else {
        response.push({ text: `PINGING ${args[0]}...`, color: "#ff0" });
        response.push({ text: `REPLY FROM ${args[0]}: TIME<1ms TTL=64`, color: "#0f0" });
      }
      break;

    case "echo":
      const text = args.join(" ");
      response.push({ text: text || "(empty)", color: "#aaa" });
      break;

    case "ls":
      response.push({ text: "DRIVE C:", color: "#444" });
      response.push({ text: "├── SYSTEM32", color: "#888" });
      response.push({ text: "├── PROGRAM FILES", color: "#888" });
      response.push({ text: "├── USERS", color: "#888" });
      response.push({ text: "│   └── ANONYMOUS", color: "#888" });
      response.push({ text: "└── BALD-NET", color: "#0f0" });
      break;
  }

  return { action: "APPEND_OUTPUT", data: response };
};