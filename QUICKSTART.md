# Quick Start Guide

Get the tmux MCP server running in 5 minutes.

## For Windows Users

### 1. Install WSL2 (if not already installed)
```powershell
# PowerShell as Administrator
wsl --install
# Restart computer
```

### 2. Setup in WSL2
```bash
# Open Ubuntu from Start menu
sudo apt update
sudo apt install -y tmux nodejs npm

# Extract and setup server
cd ~
# (Copy tmux-mcp-server folder here)
cd tmux-mcp-server
npm install
chmod +x src/index.js
```

### 3. Configure Claude Desktop
Create/edit: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tmux": {
      "command": "wsl",
      "args": ["bash", "-c", "cd ~/tmux-mcp-server && node src/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

### 5. Test
Ask Claude: "Can you list the tmux tools?"

## For macOS/Linux Users

### 1. Install tmux
```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# RHEL/CentOS
sudo yum install tmux
```

### 2. Setup server
```bash
cd ~
# (Copy tmux-mcp-server folder here)
cd tmux-mcp-server
npm install
chmod +x src/index.js
```

### 3. Configure Claude Desktop

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tmux": {
      "command": "node",
      "args": ["/Users/yourusername/tmux-mcp-server/src/index.js"]
    }
  }
}
```

Replace `/Users/yourusername` with your actual path.

### 4. Restart Claude Desktop

### 5. Test
Ask Claude: "Can you list the tmux tools?"

## First CML Console Access

Once configured, try this:

```
You: Create a tmux session named "cml-test"
Claude: [Creates session]

You: SSH to my CML console at 192.168.1.100 (user: admin, pass: cisco)
Claude: [SSHs to console server]

You: Open console for iosv-0
Claude: [Opens device console]

You: Show the interface status
Claude: [Sends "show ip interface brief" and shows output]
```

## Common Issues

**"Command not found: node"**
- Install Node.js in WSL2/your system
- Verify with: `node --version`

**"tmux: command not found"**
- Install tmux: `sudo apt install tmux`
- Verify with: `tmux -V`

**"Server not appearing in Claude"**
- Check config file path is correct
- Verify JSON syntax is valid
- Restart Claude Desktop completely
- Check logs: `%APPDATA%\Claude\logs` (Windows) or `~/Library/Logs/Claude` (macOS)

**"Permission denied" when running server**
- Run: `chmod +x src/index.js`

## What You Can Do

With this server, Claude can:
- Create terminal sessions
- Send commands via SSH
- Access CML console server
- Open device consoles
- Configure network devices
- Capture command output
- Troubleshoot issues
- Monitor multiple devices
- Automate testing workflows

## Next Steps

- Read `CML_EXAMPLES.md` for real-world usage examples
- Read `WINDOWS_SETUP.md` for detailed Windows instructions
- Combine with cml-toolkit for complete lab automation
- Build custom workflows for your specific use cases

## Getting Help

1. Check you're using absolute paths in config
2. Verify all dependencies are installed
3. Test the server manually: `node src/index.js`
4. Check Claude Desktop logs
5. Ensure tmux is accessible: `tmux -V`

## Configuration Template

Save this template and customize it:

```json
{
  "mcpServers": {
    "tmux": {
      "command": "COMMAND_HERE",
      "args": ["PATH_TO_SERVER_HERE"]
    },
    "cml": {
      "command": "COMMAND_HERE", 
      "args": ["PATH_TO_CML_TOOLKIT_HERE"]
    }
  }
}
```

Replace:
- `COMMAND_HERE`: "wsl" (Windows), "node" (macOS/Linux)
- `PATH_TO_SERVER_HERE`: Full path to the server
- Add cml-toolkit if you have it

That's it! You now have terminal access for Claude to work with CML devices.
