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
      response.push({ text: "  BROADCAST [MSG]- Display giant message overlay", color: "#888" });
      response.push({ text: "  MATRIX         - Enter the matrix", color: "#888" });
      response.push({ text: "  COFFEE         - Brew some coffee", color: "#888" });
      response.push({ text: "  RICKROLL       - Never gonna give you up", color: "#888" });
      response.push({ text: "  MAXIMIZE       - Maximize window", color: "#888" });
      response.push({ text: "  MINIMIZE       - Minimize window", color: "#888" });
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

    case "broadcast":
      const broadcastText = args.join(" ");
      if (!broadcastText) {
        response.push({ text: "USAGE: BROADCAST [message]", color: "#f00" });
      } else {
        // Create a full-screen overlay with the broadcast message
        const broadcastElement = document.createElement('div');
        broadcastElement.id = 'broadcast-overlay';
        broadcastElement.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            z-index: 9999;
            text-shadow: 0 0 20px #00ff41;
            animation: broadcast-pulse 0.5s infinite alternate;
          ">
            ${broadcastText}
          </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes broadcast-pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.05); opacity: 0.8; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(broadcastElement);
        
        // Remove after 3 seconds
        setTimeout(() => {
          if (broadcastElement.parentNode) {
            broadcastElement.parentNode.removeChild(broadcastElement);
          }
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }, 3000);
        
        response.push({ text: `BROADCASTING: "${broadcastText}"`, color: "#0f0" });
      }
      break;

    case "maximize":
      window.baldnet?.maximize();
      response.push({ text: "WINDOW MAXIMIZED", color: "#0f0" });
      break;

    case "minimize":
      window.baldnet?.minimize();
      response.push({ text: "WINDOW MINIMIZED", color: "#0f0" });
      break;

    case "matrix":
      response.push({ text: "ENTERING THE MATRIX...", color: "#0f0" });
      for (let i = 0; i < 10; i++) {
        const randomChars = Math.random().toString(36).substring(2, 15);
        response.push({ text: randomChars, color: "#0f0" });
      }
      response.push({ text: "WELCOME TO THE MATRIX", color: "#0f0" });
      break;

    case "coffee":
      response.push({ text: "BREWING COFFEE...", color: "#8B4513" });
      response.push({ text: "☕ COFFEE READY! ENERGIZING SYSTEMS...", color: "#8B4513" });
      break;

    case "rickroll":
      response.push({ text: "NEVER GONNA GIVE YOU UP", color: "#ff1493" });
      response.push({ text: "NEVER GONNA LET YOU DOWN", color: "#ff1493" });
      response.push({ text: "NEVER GONNA RUN AROUND AND DESERT YOU", color: "#ff1493" });
      break;

    default:
      response.push({ text: `COMMAND NOT RECOGNIZED: ${method}`, color: "#f00" });
  }

  return { action: "APPEND_OUTPUT", data: response };
};