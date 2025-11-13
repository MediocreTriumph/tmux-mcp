# Troubleshooting Guide

Complete reference for solving common issues with tmux-mcp-server.

## Installation Issues

### "npm: command not found"

**Problem**: Node.js/npm not installed

**Solution**:
```bash
# WSL2/Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# macOS
brew install node

# Verify
node --version
npm --version
```

### "tmux: command not found"

**Problem**: tmux not installed

**Solution**:
```bash
# WSL2/Ubuntu
sudo apt update
sudo apt install -y tmux

# macOS
brew install tmux

# Verify
tmux -V
```

### "Permission denied: src/index.js"

**Problem**: Script not executable

**Solution**:
```bash
chmod +x ~/tmux-mcp-server/src/index.js
```

### "Cannot find module @modelcontextprotocol/sdk"

**Problem**: Dependencies not installed

**Solution**:
```bash
cd ~/tmux-mcp-server
npm install
```

## Configuration Issues

### Server Not Appearing in Claude

**Problem**: Claude Desktop not loading the server

**Diagnostic Steps**:
1. Verify config file location
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Check JSON syntax
   ```bash
   # Use a JSON validator or:
   cat claude_desktop_config.json | python -m json.tool
   ```

3. Verify paths are absolute (not relative)
   ```json
   # Bad
   "args": ["./tmux-mcp-server/src/index.js"]
   
   # Good
   "args": ["/home/username/tmux-mcp-server/src/index.js"]
   ```

4. Check Claude Desktop logs
   - Windows: `%APPDATA%\Claude\logs`
   - macOS: `~/Library/Logs/Claude`
   
   Look for MCP server startup errors

5. Completely quit and restart Claude Desktop
   - Not just close window - actually quit application
   - Check Task Manager (Windows) or Activity Monitor (macOS)

### "wsl: command not found" (Windows)

**Problem**: WSL2 not enabled or not in PATH

**Solution**:
```powershell
# Check if WSL is installed
wsl --list --verbose

# If not installed
wsl --install

# Restart computer after installation
```

### Config File Doesn't Exist

**Problem**: First time setup

**Solution**:
```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path $env:APPDATA\Claude
New-Item -ItemType File -Path $env:APPDATA\Claude\claude_desktop_config.json

# macOS/Linux
mkdir -p ~/Library/Application\ Support/Claude
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Then edit the file with your configuration.

## Connection Issues

### Can't SSH to Console Server

**Problem**: Network connectivity or credentials

**Diagnostic Steps**:
```bash
# From WSL2 (or terminal), test SSH manually
ssh admin@your-console-server-ip

# If this fails, it's not a tmux issue
# Check:
# 1. Console server IP correct?
# 2. Network connectivity (ping)
# 3. SSH port open (telnet or nc)
# 4. Credentials correct
```

**Solutions**:
- Verify console server IP: `ping <ip>`
- Check SSH is running: `telnet <ip> 22` or `nc -zv <ip> 22`
- Test credentials: manual SSH login first
- Check firewall rules

### SSH Times Out

**Problem**: Network routing or firewall

**Solution**:
```bash
# Test from WSL2 with timeout
timeout 10 ssh admin@console-server-ip

# If times out:
# 1. Check network path
# 2. Verify no firewall blocking
# 3. Ensure correct network interface in WSL2

# Check WSL2 networking
wsl ip addr show
wsl ip route show
```

### SSH Host Key Verification Failed

**Problem**: Host key changed or not accepted

**Solution**:
```bash
# Remove old host key
ssh-keygen -R console-server-ip

# Or accept new key manually first
ssh admin@console-server-ip
# Type "yes" when prompted

# Or disable host key checking (not recommended for production)
ssh -o StrictHostKeyChecking=no admin@console-server-ip
```

## Session Issues

### "Session not found"

**Problem**: Session was killed or doesn't exist

**Solution**:
```bash
# List active sessions
tmux list-sessions

# Create session if it doesn't exist
tmux new-session -d -s session-name

# If session exists but Claude can't find it
# Verify exact session name (case-sensitive)
```

### Can't Send Keys to Session

**Problem**: Session exists but not responding

**Diagnostic Steps**:
```bash
# Attach to session manually to check state
tmux attach -t session-name

# Check if session is frozen (Ctrl+S)
# Unfreeze with Ctrl+Q

# Detach with Ctrl+B, then D
```

### Session Hangs During SSH

**Problem**: SSH prompt waiting for input

**Solution**:
- Send Ctrl+C: `send_keys: "\x03"` with `literal: true`
- Capture pane to see current state
- May need to kill and recreate session

### Multiple Sessions Interfering

**Problem**: Commands going to wrong session

**Solution**:
- Use descriptive, unique session names
- List sessions before sending commands
- Kill unused sessions: `kill_session`

## Capture Issues

### "Capture pane returns empty"

**Problem**: Timing or no output yet

**Solution**:
```bash
# Wait before capturing
send_keys: "command"
# Wait 2-3 seconds
capture_pane

# Or capture more lines
capture_pane: lines=50

# Or capture entire scrollback
capture_pane: lines=-1
```

### Too Much Output in Capture

**Problem**: Scrollback includes old commands

**Solution**:
```bash
# Clear screen before command
send_keys: "clear"
send_keys: "your-command"
capture_pane

# Or capture fewer lines
capture_pane: lines=20
```

### Output Truncated

**Problem**: Command output longer than capture

**Solution**:
```bash
# Increase line count
capture_pane: lines=100

# Or capture everything
capture_pane: lines=-1

# Or use pager-friendly commands
send_keys: "show run | no-more"
```

## Command Execution Issues

### Commands Not Executing

**Problem**: Wrong prompt or mode

**Diagnostic Steps**:
1. Capture pane to see current prompt
2. Verify you're in correct mode (exec vs config)
3. Check if waiting for input

**Solution**:
```bash
# If in config mode, exit
send_keys: "end"

# If at login prompt
send_keys: "admin"
send_keys: "password"

# If hanging, send Enter
send_keys: ""

# If really stuck, send Ctrl+C
send_keys: "\x03" with literal=true
```

### Special Characters Not Working

**Problem**: Shell escaping issues

**Solution**:
```bash
# Use literal mode for special characters
send_keys: "password!@#", literal=true

# Or escape in the string
send_keys: "password\\!\\@\\#"

# For Control characters
send_keys: "\x03", literal=true  # Ctrl+C
send_keys: "\x11", literal=true  # Ctrl+Q
```

### Commands Execute But No Output

**Problem**: Output not captured or went to wrong place

**Solution**:
```bash
# Ensure you captured after enough wait time
send_keys: "show run"
# Wait 3-5 seconds for long output
capture_pane

# Check if output went to different pane
list_panes: session_name
# Capture each pane separately
```

## WSL2-Specific Issues

### "Network unreachable" from WSL2

**Problem**: WSL2 networking not configured

**Solution**:
```bash
# Check WSL2 can reach network
wsl ping 8.8.8.8

# If fails, restart WSL
wsl --shutdown
wsl

# Check Windows firewall isn't blocking WSL2
```

### Can't Access Windows Files from WSL2

**Problem**: Path not correct

**Solution**:
```bash
# Windows paths accessible at /mnt
# C:\Users\YourName\file.txt becomes:
/mnt/c/Users/YourName/file.txt

# Or use wslpath
wslpath 'C:\Users\YourName\file.txt'
```

### WSL2 Using Too Much Memory

**Problem**: WSL2 memory leak

**Solution**:
```bash
# Create/edit %USERPROFILE%\.wslconfig
[wsl2]
memory=4GB
swap=0

# Restart WSL
wsl --shutdown
wsl
```

## Performance Issues

### Slow Command Execution

**Problem**: Network latency or busy console server

**Solution**:
- Increase wait times between commands
- Check network latency: `ping console-server`
- Verify console server not overloaded
- Use fewer simultaneous connections

### Capture Takes Long Time

**Problem**: Large scrollback

**Solution**:
```bash
# Capture less scrollback
capture_pane: lines=30  # Instead of -1

# Clear screen before commands
send_keys: "clear"

# Use more specific show commands
send_keys: "show ip int brief"  # Instead of "show run"
```

### Multiple Sessions Causing Issues

**Problem**: Too many concurrent sessions

**Solution**:
- Kill unused sessions
- Use fewer parallel operations
- Sequence operations instead of parallel
- Monitor system resources

## Debugging Techniques

### Manual Testing

Test the server manually to isolate issues:

```bash
# Start server manually
cd ~/tmux-mcp-server
node src/index.js

# In another terminal, send test request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node src/index.js
```

### Check Logs

```bash
# Claude Desktop logs
# Windows
type %APPDATA%\Claude\logs\mcp*.log

# macOS
cat ~/Library/Logs/Claude/mcp*.log

# Look for:
# - Server startup messages
# - Error messages
# - Connection issues
```

### Verify Each Component

Test each piece independently:

```bash
# 1. Test tmux works
tmux new-session -d -s test
tmux send-keys -t test "echo hello" Enter
tmux capture-pane -t test -p
tmux kill-session -t test

# 2. Test Node works
node --version
node -e "console.log('hello')"

# 3. Test server starts
cd ~/tmux-mcp-server
node src/index.js
# (Ctrl+C to stop)

# 4. Test SSH works
ssh admin@console-server
# (Type password, then exit)
```

### Enable Debug Mode

Add debugging to server:

```javascript
// In src/index.js, add at top:
const DEBUG = true;

// Add debug logging:
if (DEBUG) console.error('[DEBUG]', message);
```

## Common Error Messages

### "Failed to create session: tmux not found"
- tmux not installed or not in PATH
- Install tmux: `sudo apt install tmux`

### "Failed to send keys: no session found"
- Session doesn't exist or was killed
- Create session first with `create_session`

### "Failed to capture pane: invalid session"
- Session name incorrect (case-sensitive)
- List sessions to verify name

### "Connection refused"
- Console server not reachable
- Check IP and port: `nc -zv ip 22`

### "Permission denied (publickey)"
- SSH credentials wrong
- Test manually: `ssh admin@console-server`

### "Host key verification failed"
- Known_hosts issue
- Remove old key: `ssh-keygen -R console-server-ip`

## Getting More Help

If issues persist:

1. **Verify basic setup**
   - Node installed: `node --version`
   - Tmux installed: `tmux -V`
   - Server file executable: `ls -l src/index.js`

2. **Test manually**
   - Create tmux session manually
   - SSH to console server manually
   - Run server manually

3. **Check logs**
   - Claude Desktop logs
   - System logs for SSH issues
   - WSL2 logs if on Windows

4. **Simplify**
   - Test with single session
   - Test with simple commands
   - Test without SSH (just local commands)

5. **Environment info**
   - OS and version
   - Node version
   - Tmux version
   - WSL2 version (if Windows)
   - Claude Desktop version

## Prevention Tips

Avoid common issues:

1. **Always check session exists before using**
   ```
   list_sessions first
   then send_keys
   ```

2. **Wait after commands**
   ```
   send_keys: "command"
   # Wait 1-2 seconds
   capture_pane
   ```

3. **Use descriptive session names**
   ```
   Good: "r1-bgp-config"
   Bad: "test1"
   ```

4. **Clean up after use**
   ```
   kill_session when done
   Don't leave sessions running
   ```

5. **Test SSH manually first**
   ```
   Before using tmux+SSH,
   verify SSH works manually
   ```

6. **Keep sessions focused**
   ```
   One session per task
   Kill when task complete
   Don't reuse for different tasks
   ```

## Still Stuck?

If you've tried everything:

1. Restart everything
   - Kill all tmux sessions: `tmux kill-server`
   - Restart Claude Desktop
   - Restart WSL2 (Windows): `wsl --shutdown`

2. Verify your complete setup matches the quick start guide

3. Try the test script: `node test.js`

4. Check if it works with basic commands before trying CML

5. Make sure both cml-toolkit and tmux-mcp are configured if using both
