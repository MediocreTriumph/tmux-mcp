# CML Console Access Examples

This document shows real-world examples of using the tmux MCP server with Cisco Modeling Labs (CML).

## Basic CML Console Access

### Scenario 1: Single Device Configuration

```
User: Create a tmux session called "router-config"

Claude: [Uses tmux_create_session with session_name="router-config"]

User: SSH to my CML console server at 192.168.1.100, username admin, password cisco

Claude: [Uses tmux_send_keys to send: ssh admin@192.168.1.100]
Claude: [Waits and captures pane to see password prompt]
Claude: [Uses tmux_send_keys to send: cisco]

User: Open the console for iosv-0

Claude: [Uses tmux_send_keys: open /iosv-0]
Claude: [Captures pane to show device console]

User: Configure interface GigabitEthernet0/1 with IP 10.0.0.1/24

Claude: [Sends commands in sequence:]
- enable
- configure terminal
- interface GigabitEthernet0/1
- ip address 10.0.0.1 255.255.255.0
- no shutdown
- end
Claude: [Captures output to verify]

User: Save the config

Claude: [Sends: write memory]
Claude: [Captures and shows confirmation]
```

## Advanced Use Cases

### Scenario 2: Troubleshooting Connectivity

```
User: I have a lab where R1 can't ping R2. Help me troubleshoot.

Claude: Create a session and SSH to console server
Claude: Open R1 console
Claude: [Sends: show ip interface brief]
Claude: [Analyzes output]
Claude: [Sends: show ip route]
Claude: [Checks routing table]
Claude: [Sends: ping 10.0.0.2]
Claude: [Checks result]

Claude: Now let me check R2
Claude: [Sends: exit to disconnect from R1]
Claude: [Sends: open /iosv-1]
Claude: [Repeats diagnostic commands]

Claude: Found the issue - R2's interface is administratively down.
Claude: [Configures: no shutdown]
Claude: [Verifies: ping works]
```

### Scenario 3: Parallel Device Monitoring

```
User: Monitor three routers simultaneously

Claude: [Creates session "monitoring"]
Claude: [Splits window vertically - creates pane 1]
Claude: [Splits pane 1 horizontally - creates pane 2]

Claude: [Selects pane 0, SSHs to console server, opens router1]
Claude: [Selects pane 1, SSHs to console server, opens router2]
Claude: [Selects pane 2, SSHs to console server, opens router3]

Claude: [In each pane, sends: terminal monitor]
Claude: [In each pane, sends: debug ip icmp]

User: Start pings from router1 to the others

Claude: [Selects pane 0]
Claude: [Sends ping commands]
Claude: [Captures all three panes to show debug output]
```

### Scenario 4: Automated Configuration Deployment

```
User: Configure OSPF on all routers in my lab

Claude: Let me get the lab topology from cml-toolkit first
Claude: [Uses cml-toolkit to get node list and interfaces]

Claude: Found 3 routers. Creating tmux session...
Claude: [For each router:]
  - Open console
  - Configure OSPF process 1
  - Add network statements for interfaces
  - Verify with 'show ip ospf neighbor'
  - Exit to next device

Claude: Configuration complete. Here's the OSPF neighbor status from each router:
[Shows captured output from all three]
```

### Scenario 5: Configuration Backup

```
User: Backup configs from all devices in my lab

Claude: [Creates session]
Claude: [Gets device list from cml-toolkit]

Claude: [For each device:]
  - Open console
  - Send: show running-config
  - Capture entire scrollback (lines=-1)
  - Save to file in /home/user/backups/device-name-config.txt
  
Claude: Backed up configs for 5 devices to /home/user/backups/
```

## Integration with cml-toolkit

The real power comes from combining both MCP servers:

```python
# Workflow that cml-toolkit + tmux enables:

1. cml-toolkit: Create lab with 3 routers
2. cml-toolkit: Start lab
3. cml-toolkit: Wait for nodes to boot
4. tmux: Create session
5. tmux: SSH to console server
6. tmux: For each router:
   - Open console
   - Apply configuration
   - Verify connectivity
   - Capture results
7. cml-toolkit: If tests pass, keep lab
8. cml-toolkit: If tests fail, stop lab
```

### Example Combined Workflow

```
User: Create a lab with 3 routers in a triangle topology, configure OSPF, and verify connectivity

Claude: [Uses cml-toolkit:]
- create_lab: "ospf-triangle"
- create_router: R1, R2, R3
- link_nodes: R1-R2, R2-R3, R3-R1
- start_lab
- wait_for_lab_nodes

Claude: Lab is running. Now configuring via console...

Claude: [Uses tmux:]
- create_session: "ospf-config"
- send_keys: ssh to console server
- For each router: configure OSPF
- capture_pane: verify configs
- send_keys: test pings between all routers

Claude: All routers can reach each other. Lab is ready!
```

## Console Server Commands Reference

### CML2 Console Server

```bash
# List available consoles
show sessions

# Open a device console (by node name)
open /node-name

# Open a device console (by node ID)  
open /iosv-0

# Disconnect from console (back to console server)
Ctrl+Q or exit

# List open connections
show connections
```

### Session Management

```bash
# Create named session for organized work
tmux_create_session: "project-x-lab"

# Multiple sessions for different tasks
- "configuration" - for applying configs
- "monitoring" - for watching logs
- "troubleshooting" - for diagnostics

# Clean up when done
tmux_kill_session for each session
```

## Best Practices

### 1. Always Capture Before Acting
```
- Send command
- Capture pane
- Analyze output
- Decide next action
```

### 2. Use Descriptive Session Names
```
Good: "bgp-lab-troubleshooting"
Bad: "test1"
```

### 3. Clean Up Sessions
```
- Kill sessions when done
- Don't leave SSH connections open
- Clear scrollback if needed
```

### 4. Handle Prompts Carefully
```
- Capture pane after each command
- Look for expected prompts
- Handle password prompts explicitly
- Deal with confirmation prompts (e.g., "reload? [yes/no]:")
```

### 5. Use Literal Mode for Special Cases
```
# When you need to send special characters
tmux_send_keys with literal=true

# Example: Ctrl+C
send_keys: "\x03", literal: true
```

## Error Handling

### Connection Issues
```
User: I can't connect to the console server

Claude: [Captures pane to see error]
Claude: [Checks if it's timeout, auth failure, or network issue]
Claude: [Suggests solutions based on error]
```

### Device Not Responding
```
User: Router is not responding to commands

Claude: [Sends: Ctrl+C to interrupt]
Claude: [Sends: Enter a few times]
Claude: [Captures to check state]
Claude: [May suggest: exit and reconnect]
```

### Session Lost
```
If tmux session is killed accidentally:
1. Create new session
2. SSH to console server again
3. Check "show connections" to see if old session still open
4. May need to kill old connection first
```

## Performance Tips

### Capture Only What You Need
```
# Good: Capture visible area
capture_pane: session_name="config", lines=30

# Avoid: Capture entire scrollback unless necessary
capture_pane: session_name="config", lines=-1
```

### Batch Commands When Possible
```
# Instead of:
send_keys: "enable"
send_keys: "show ip int brief"

# Consider:
send_keys: "enable\nshow ip int brief\n", literal=true
```

### Use Multiple Sessions for Heavy Work
```
# One session per device when working on many devices
# Allows parallel operations
# Easier to manage than many panes in one session
```

## Security Considerations

1. **Credentials**: SSH passwords are sent as plain text through tmux
   - Use SSH keys when possible
   - Avoid hardcoding passwords in automation
   - Consider using environment variables or secure storage

2. **Session Persistence**: tmux sessions persist until killed
   - Always clean up sessions
   - Don't leave sensitive information in scrollback
   - Kill sessions when switching tasks

3. **Console Server Access**: Direct device access is powerful
   - Use read-only accounts where possible
   - Log all configuration changes
   - Validate changes before applying

## Troubleshooting Guide

### Problem: Can't see device output
**Solution**: Capture pane after commands, increase wait time between commands

### Problem: Commands not executing
**Solution**: Check if prompt is as expected, may be in wrong mode (config vs exec)

### Problem: SSH session hangs
**Solution**: Send Ctrl+C, exit, and reconnect

### Problem: Too much output in capture
**Solution**: Clear screen first with "clear" command, or use smaller line count

### Problem: Pane selection not working
**Solution**: List panes first to verify index, use tmux_list_panes

## Future Enhancements

Potential additions to the workflow:
- Automated test suites for labs
- Configuration templates applied via console
- Real-time monitoring dashboards
- Change validation and rollback procedures
- Integration with network automation tools (Ansible, Nornir)
