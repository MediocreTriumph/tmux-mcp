# Tmux MCP Server

An MCP (Model Context Protocol) server that provides programmatic control over tmux terminal sessions. Enables Claude (or other MCP clients) to create, manage, and interact with tmux sessions for SSH access, command execution, and terminal automation.

## Features

- Create and manage tmux sessions
- Send commands to sessions
- Capture pane output
- Split windows and manage panes
- Full control over terminal sessions via MCP tools

## Installation

### Prerequisites

- Node.js (v16 or higher)
- tmux installed on your system
- For Windows: WSL2 with tmux installed

### Setup

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

3. Make the server executable:
```bash
chmod +x src/index.js
```

## Configuration

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tmux": {
      "command": "node",
      "args": ["/absolute/path/to/tmux-mcp-server/src/index.js"]
    }
  }
}
```

For WSL2 on Windows, you can use `wsl` to run the server:
```json
{
  "mcpServers": {
    "tmux": {
      "command": "wsl",
      "args": ["node", "/home/username/tmux-mcp-server/src/index.js"]
    }
  }
}
```

Restart Claude Desktop after updating the configuration.

## Available Tools

### tmux_create_session
Create a new tmux session.
- `session_name` (optional): Name for the session
- `start_directory` (optional): Starting directory

### tmux_list_sessions
List all active tmux sessions with details.

### tmux_send_keys
Send keys/commands to a session.
- `session_name` (required): Target session name
- `keys` (required): Keys or command to send
- `literal` (optional): If true, don't append Enter

### tmux_capture_pane
Capture the visible content of a pane.
- `session_name` (required): Target session name
- `pane_index` (optional): Pane index (default: "0")
- `lines` (optional): Number of lines from scrollback (-1 for all)

### tmux_kill_session
Terminate a tmux session.
- `session_name` (required): Session to kill

### tmux_split_window
Split a window to create a new pane.
- `session_name` (required): Target session name
- `vertical` (optional): If true, split vertically (side by side)

### tmux_select_pane
Select a specific pane in a session.
- `session_name` (required): Target session name
- `pane_index` (required): Pane index to select

### tmux_list_panes
List all panes in a session with details.
- `session_name` (required): Target session name

## Usage Examples

### SSH to a CML Console Server

```
Claude: Create a tmux session named "cml-console"
Claude: Send SSH command to connect to CML console server
Claude: Capture pane to see login prompt
Claude: Send credentials
Claude: Send "open router1" to access device console
Claude: Capture pane to see device output
Claude: Send configuration commands
```

### Monitor Multiple Devices

```
Claude: Create session "monitoring"
Claude: Split window vertically
Claude: Select pane 0, SSH to device1
Claude: Select pane 1, SSH to device2
Claude: Capture both panes to see simultaneous output
```

## Use Cases

- **CML Device Access**: SSH to CML console servers and access node consoles
- **Configuration Management**: Send commands to network devices and capture output
- **Troubleshooting**: Interactive debugging of network issues
- **Automation**: Script complex terminal workflows
- **Testing**: Automated testing of CLI applications
- **Monitoring**: Watch multiple terminal sessions simultaneously

## Troubleshooting

### Sessions not appearing
Ensure tmux is installed and accessible in your PATH:
```bash
which tmux
tmux -V
```

### WSL2 connectivity issues
Make sure you can run tmux from WSL2:
```bash
wsl tmux new-session -d -s test
wsl tmux list-sessions
wsl tmux kill-session -t test
```

### Command not executing
Check if the session exists:
```bash
tmux list-sessions
```

## License

MIT
