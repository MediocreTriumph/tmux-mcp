# Tmux MCP Server - Windows Setup Guide

This guide covers setting up the tmux MCP server on Windows using WSL2, enabling Claude to access CML console servers via SSH.

## Prerequisites

1. **Windows 10/11** with WSL2 enabled
2. **Node.js** installed in WSL2
3. **tmux** installed in WSL2
4. **Claude Desktop** installed on Windows

## Step 1: Enable WSL2

If you haven't already enabled WSL2:

```powershell
# Run in PowerShell as Administrator
wsl --install
```

This installs Ubuntu by default. Restart your computer when prompted.

## Step 2: Install Required Software in WSL2

Open WSL2 (search for "Ubuntu" in Start menu) and run:

```bash
# Update package lists
sudo apt update

# Install tmux
sudo apt install -y tmux

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
tmux -V
node --version
npm --version
```

## Step 3: Install the Tmux MCP Server

In WSL2:

```bash
# Navigate to your home directory
cd ~

# If you have the tarball, extract it:
tar xzf tmux-mcp-server.tar.gz
cd tmux-mcp-server

# Install dependencies
npm install

# Make the server executable
chmod +x src/index.js

# Test the server
node src/index.js
# (Press Ctrl+C to stop)
```

## Step 4: Get the WSL Path

You need the Windows path to the server. In WSL2, run:

```bash
cd ~/tmux-mcp-server
wslpath -w $(pwd)
```

This outputs something like: `\\wsl.localhost\Ubuntu\home\yourusername\tmux-mcp-server`

## Step 5: Configure Claude Desktop

1. Open File Explorer
2. Navigate to: `%APPDATA%\Claude`
3. Open or create `claude_desktop_config.json`
4. Add the tmux server configuration:

```json
{
  "mcpServers": {
    "tmux": {
      "command": "wsl",
      "args": [
        "bash",
        "-c",
        "cd ~/tmux-mcp-server && node src/index.js"
      ]
    }
  }
}
```

**Alternative configuration using full path:**

```json
{
  "mcpServers": {
    "tmux": {
      "command": "wsl",
      "args": [
        "node",
        "/home/yourusername/tmux-mcp-server/src/index.js"
      ]
    }
  }
}
```

Replace `yourusername` with your actual WSL username.

## Step 6: Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

## Step 7: Verify Installation

In Claude Desktop, ask Claude:

```
Can you list the available tmux tools?
```

You should see 8 tools listed:
- tmux_create_session
- tmux_list_sessions
- tmux_send_keys
- tmux_capture_pane
- tmux_kill_session
- tmux_split_window
- tmux_select_pane
- tmux_list_panes

## Using with CML Console Server

Once configured, you can ask Claude to:

```
Create a tmux session and SSH to my CML console server at 10.0.0.1
```

Claude will:
1. Create a tmux session
2. Send the SSH command
3. Handle the login (you may need to provide credentials)
4. Access device consoles via the console server

### Example workflow:

```
User: Create a tmux session named "cml-work"
Claude: [Creates session]

User: SSH to admin@10.0.0.1 (password: cisco123)
Claude: [Sends SSH command and credentials]

User: Open the console for router1
Claude: [Sends: open /iosv-0]

User: Show me the running config
Claude: [Sends: show run, captures output]

User: Configure a new interface
Claude: [Enters config mode, applies changes]
```

## Troubleshooting

### WSL2 not found
Ensure WSL2 is enabled and Ubuntu is installed:
```powershell
wsl --list --verbose
```

### Permission denied
Make sure the script is executable:
```bash
chmod +x ~/tmux-mcp-server/src/index.js
```

### Node not found in WSL
Verify Node.js installation:
```bash
which node
node --version
```

If not found, reinstall Node.js in WSL2.

### Server not starting
Check the logs in Claude Desktop:
- Windows: `%APPDATA%\Claude\logs`

### Can't find config file
The full path is:
```
C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
```

### SSH keys
If you use SSH keys for CML access, make sure they're in WSL2:

```bash
# In WSL2
mkdir -p ~/.ssh
# Copy your keys to ~/.ssh/
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

## Advanced Configuration

### Using SSH Config

Create `~/.ssh/config` in WSL2:

```
Host cml-console
    HostName 10.0.0.1
    User admin
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Then Claude can simply use:
```
ssh cml-console
```

### Multiple CML Servers

You can access multiple CML environments by creating separate sessions:

```
Claude: Create session "cml-prod" and SSH to cml-prod.company.com
Claude: Create session "cml-lab" and SSH to cml-lab.company.com
```

### Monitoring Multiple Devices

```
Claude: Create session "monitoring"
Claude: Split the window vertically
Claude: In pane 0, SSH to device1
Claude: In pane 1, SSH to device2
Claude: Show me both panes
```

## Security Notes

- SSH credentials are sent through the tmux session
- Consider using SSH keys instead of passwords
- Sessions persist until explicitly killed or system restart
- Always kill sessions when done: `tmux_kill_session`

## Next Steps

Now that you have terminal access, you can:
- Enhance the cml-toolkit to use console access for verification
- Build automation workflows that configure and test devices
- Create scripts that troubleshoot connectivity issues
- Develop monitoring solutions that watch device status

## Getting Help

If you encounter issues:
1. Check tmux is working: `wsl tmux new-session -d -s test && wsl tmux list-sessions && wsl tmux kill-session -t test`
2. Test the server directly: `wsl bash -c "cd ~/tmux-mcp-server && node src/index.js"`
3. Review Claude Desktop logs in `%APPDATA%\Claude\logs`
