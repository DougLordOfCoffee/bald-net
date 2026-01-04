// terminalCommands.js

export const processCommand = (cmd, currentTabs, activeTabId) => {
  const [method, ...args] = cmd.trim().split(/\s+/);
  const response = [];

  switch (method.toLowerCase()) {
    case "help":
      response.push({ text: "SYSTEM UTILITIES:", color: "#444" });
      response.push({ text: "  GOTO [URL] - Navigate active view", color: "#888" });
      response.push({ text: "  TABS       - List active processes", color: "#888" });
      response.push({ text: "  CLEAR      - Purge terminal buffer", color: "#888" });
      response.push({ text: "  TIME       - Sync with local clock", color: "#888" });
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

    default:
      response.push({ text: `COMMAND NOT RECOGNIZED: ${method}`, color: "#f00" });
  }

  return { action: "APPEND_OUTPUT", data: response };
};