const handleCommand = (tabId, cmd) => {
  setTabs(tabs =>
    tabs.map(t => {
      if (t.id !== tabId) return t;

      let newOutput = [...(t.output || []), { text: `> ${cmd}`, color: "#0f0" }];

      // Simple example commands
      if (cmd === "hello") newOutput.push({ text: "Hello, developer!", color: "#ff0" });
      else if (cmd.startsWith("say ")) newOutput.push({ text: cmd.slice(4), color: "#0ff" });
      else newOutput.push({ text: `Unknown command: ${cmd}`, color: "#f00" });

      return { ...t, output: newOutput };
    })
  );
};
