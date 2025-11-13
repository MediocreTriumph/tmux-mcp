# Integration Guide: tmux-mcp-server + cml-toolkit

This guide shows how to use both MCP servers together for complete CML lab automation.

## Why Use Both?

**cml-toolkit**: Lab infrastructure management
- Create labs
- Add nodes and links
- Start/stop labs
- Manage topology structure

**tmux-mcp-server**: Device interaction
- Configure devices
- Troubleshoot issues
- Verify connectivity
- Monitor device state

Together, they provide complete lab lifecycle management.

## Configuration

Your `claude_desktop_config.json` should include both servers:

### Windows
```json
{
  "mcpServers": {
    "cml": {
      "command": "wsl",
      "args": ["node", "/home/yourusername/cml-toolkit/build/index.js"]
    },
    "tmux": {
      "command": "wsl",
      "args": ["bash", "-c", "cd ~/tmux-mcp-server && node src/index.js"]
    }
  }
}
```

### macOS/Linux
```json
{
  "mcpServers": {
    "cml": {
      "command": "node",
      "args": ["/path/to/cml-toolkit/build/index.js"]
    },
    "tmux": {
      "command": "node",
      "args": ["/path/to/tmux-mcp-server/src/index.js"]
    }
  }
}
```

## Complete Workflows

### Workflow 1: Build, Configure, and Test a Lab

```
User: Create a lab with 2 routers connected to each other, configure OSPF, and verify they become neighbors

Claude's Process:
1. [cml-toolkit] Initialize CML connection
2. [cml-toolkit] Create lab "ospf-test"
3. [cml-toolkit] Create router R1
4. [cml-toolkit] Create router R2
5. [cml-toolkit] Link R1 to R2
6. [cml-toolkit] Start lab
7. [cml-toolkit] Wait for nodes to boot
8. [tmux] Create session "ospf-config"
9. [tmux] SSH to console server
10. [tmux] Open R1 console
11. [tmux] Configure OSPF on R1
12. [tmux] Exit R1, open R2
13. [tmux] Configure OSPF on R2
14. [tmux] Check OSPF neighbors on both routers
15. [tmux] Verify with ping test
16. Report: "Lab ready, OSPF neighbors established"
```

### Workflow 2: Troubleshoot Existing Lab

```
User: My lab isn't working. R1 and R2 can't ping each other.

Claude's Process:
1. [cml-toolkit] Get lab details
2. [cml-toolkit] Get lab topology (nodes and links)
3. [tmux] Create session "troubleshooting"
4. [tmux] SSH to console server
5. [tmux] Open R1 console
6. [tmux] Check: show ip interface brief
7. [tmux] Check: show ip route
8. [tmux] Check: ping R2
9. [tmux] Open R2 console
10. [tmux] Check same commands
11. [tmux] Identify issue (e.g., interface down)
12. [tmux] Fix issue
13. [tmux] Verify ping works
14. Report: "Issue found and fixed - interface was admin down"
```

### Workflow 3: Complex Multi-Protocol Lab

```
User: Create a lab with 4 routers. Configure OSPF in area 0 between R1-R2-R3, and BGP between R3-R4. Verify full connectivity.

Claude's Process:
1. [cml-toolkit] Create lab "multi-protocol"
2. [cml-toolkit] Create routers R1, R2, R3, R4
3. [cml-toolkit] Create topology:
   - R1 -- R2
   - R2 -- R3
   - R3 -- R4
4. [cml-toolkit] Start lab and wait
5. [tmux] Create session "config"
6. [tmux] For each router:
   - Open console
   - Configure interfaces
   - Configure routing protocol(s)
   - Save configuration
7. [tmux] Create session "verify"
8. [tmux] Split window into 4 panes
9. [tmux] Open each router in a pane
10. [tmux] Run show commands in parallel
11. [tmux] Test pings from R1 to R4
12. Report: Full topology map with protocol status
```

### Workflow 4: Automated Lab Testing

```
User: Create a lab, configure it, and run automated tests

Claude's Process:
1. [cml-toolkit] Create lab from specification
2. [cml-toolkit] Build topology
3. [cml-toolkit] Start lab
4. [tmux] Apply baseline configuration
5. [tmux] Run test suite:
   - Ping tests
   - Routing table verification
   - Protocol neighbor checks
   - Traffic flow validation
6. [tmux] Capture all test results
7. [cml-toolkit] If tests fail, stop lab
8. [cml-toolkit] If tests pass, keep lab running
9. Report: Test results with pass/fail status
```

### Workflow 5: Configuration Backup and Restore

```
User: Backup all configs from my current lab, then restore them to a new lab

Claude's Process:
1. [cml-toolkit] Get current lab topology
2. [tmux] Create session "backup"
3. [tmux] For each device:
   - Open console
   - Capture running-config
   - Save to file
4. [cml-toolkit] Create new lab with same topology
5. [cml-toolkit] Start new lab
6. [tmux] Create session "restore"
7. [tmux] For each device:
   - Open console
   - Apply saved configuration
   - Verify with show run
8. Report: "Backed up and restored X devices"
```

## Best Practices

### 1. Always Wait for Nodes to Boot
```
[cml-toolkit] start_lab
[cml-toolkit] wait_for_lab_nodes (timeout: 300)
# Only then proceed to tmux configuration
```

### 2. Use Descriptive Session Names
```
Good workflow:
- Lab name: "bgp-mpls-lab"
- Tmux session: "bgp-mpls-config"
Clearly linked and meaningful
```

### 3. Capture Lab State at Key Points
```
After building topology:
[cml-toolkit] get_lab_topology

After configuration:
[tmux] capture configs

After testing:
[tmux] capture test results
```

### 4. Handle Errors Gracefully
```
If cml-toolkit fails to start lab:
- Don't proceed to tmux
- Report error to user

If tmux configuration fails:
- Capture error output
- May still stop lab via cml-toolkit
- Report what succeeded and what failed
```

### 5. Clean Up Resources
```
End of workflow:
[tmux] kill_session for all sessions
[cml-toolkit] stop_lab if temporary
or
[cml-toolkit] Keep lab running for user
```

## Advanced Integration Patterns

### Pattern 1: Progressive Configuration
```
Build topology → Test basic connectivity → Add routing → Test routing → Add services → Test services
Each step verified before proceeding
```

### Pattern 2: Parallel Device Configuration
```
[cml-toolkit] Start all nodes
[tmux] Create multiple sessions (one per device)
Configure all devices in parallel
Join sessions for verification
```

### Pattern 3: Iterative Testing
```
Loop:
  [tmux] Apply configuration change
  [tmux] Test change
  If test fails:
    [tmux] Rollback
  Else:
    [tmux] Save config
  Break when all tests pass
```

### Pattern 4: Lab Templates
```
Define lab template (e.g., "basic-ospf-lab")
[cml-toolkit] Build from template
[tmux] Apply config template
[tmux] Customize per user requirements
[tmux] Validate deployment
```

## Example: Complete Lab Lifecycle

Here's a full example showing both servers working together:

```
User: Build me a BGP lab with 2 ISPs and 2 customers. Configure everything and verify connectivity.

== Phase 1: Lab Creation (cml-toolkit) ==
[cml] initialize_client (base_url, username, password)
[cml] create_lab: "bgp-isp-customer"
[cml] create_router: "ISP1", x=0, y=0
[cml] create_router: "ISP2", x=400, y=0
[cml] create_router: "Customer1", x=0, y=200
[cml] create_router: "Customer2", x=400, y=200
[cml] link_nodes: ISP1 <-> ISP2
[cml] link_nodes: ISP1 <-> Customer1
[cml] link_nodes: ISP2 <-> Customer2
[cml] link_nodes: Customer1 <-> Customer2
[cml] start_lab: "bgp-isp-customer"
[cml] wait_for_lab_nodes: timeout=300

== Phase 2: Base Configuration (tmux) ==
[tmux] create_session: "bgp-base-config"
[tmux] send_keys: "ssh admin@console-server"
[tmux] send_keys: <password>

For each router (ISP1, ISP2, Customer1, Customer2):
  [tmux] send_keys: "open /<node-name>"
  [tmux] send_keys: [base config commands]
  [tmux] capture_pane: verify configuration
  [tmux] send_keys: "write memory"
  [tmux] send_keys: "exit"

== Phase 3: BGP Configuration (tmux) ==
For ISP1:
  [tmux] send_keys: "open /ISP1"
  [tmux] send_keys: [BGP AS 100 config]
  [tmux] send_keys: [BGP neighbors]
  [tmux] send_keys: "write memory"

For ISP2:
  [tmux] send_keys: [Similar BGP config, AS 200]

For Customer1:
  [tmux] send_keys: [BGP AS 65001, peer with ISP1]

For Customer2:
  [tmux] send_keys: [BGP AS 65002, peer with ISP2]

== Phase 4: Verification (tmux) ==
[tmux] split_window: vertical (create 4 panes)

Pane 0: ISP1
  [tmux] select_pane: 0
  [tmux] send_keys: "show ip bgp summary"
  
Pane 1: ISP2
  [tmux] select_pane: 1
  [tmux] send_keys: "show ip bgp summary"
  
Pane 2: Customer1
  [tmux] select_pane: 2
  [tmux] send_keys: "show ip bgp summary"
  
Pane 3: Customer2
  [tmux] select_pane: 3
  [tmux] send_keys: "show ip bgp summary"

[tmux] capture_pane for all panes
Analyze: All BGP sessions established

== Phase 5: Connectivity Testing (tmux) ==
[tmux] select_pane: 2 (Customer1)
[tmux] send_keys: "ping <Customer2-IP>"
[tmux] capture_pane: verify success

== Phase 6: Documentation (cml + tmux) ==
[cml] get_lab_topology: Generate topology map
[tmux] capture configs from all devices
Create documentation with:
  - Topology diagram
  - IP addressing scheme
  - BGP AS numbers
  - Configurations
  - Test results

== Completion ==
[tmux] kill_session: "bgp-base-config"
Report to user: "BGP lab complete. All neighbors established. Connectivity verified."
```

## Debugging Integration Issues

### Issue: cml-toolkit works but tmux doesn't
**Check:**
1. Both servers in config file?
2. Tmux installed in same environment as Node?
3. Can reach console server from that environment?

### Issue: Nodes boot but can't access consoles
**Check:**
1. Console server IP correct?
2. SSH credentials valid?
3. Node names match CML naming convention?

### Issue: Configuration applies but doesn't persist
**Check:**
1. Using "write memory" or "copy run start"?
2. Capturing output to verify save succeeded?
3. Node has sufficient storage?

### Issue: Tests fail intermittently
**Check:**
1. Sufficient wait time after configuration?
2. Routing protocols converged? (show commands)
3. Interfaces actually up? (show ip int brief)

## Performance Considerations

### For Large Labs (10+ devices)
- Use parallel tmux sessions (one per device)
- Don't capture full scrollback unless needed
- Kill sessions promptly when done

### For Complex Configurations
- Break into logical phases
- Verify each phase before proceeding
- Save checkpoints (write memory after each phase)

### For Long-Running Operations
- Use separate monitoring session
- Don't block on long commands
- Use capture_pane with appropriate line count

## Security Best Practices

1. **Credentials**: Never hardcode passwords
   - Use SSH keys when possible
   - Prompt user for credentials
   - Don't log credentials

2. **Session Management**: Clean up after use
   - Always kill tmux sessions when done
   - Don't leave console connections open
   - Clear sensitive data from scrollback

3. **Access Control**: Verify permissions
   - Check user has access to CML
   - Verify console server access
   - Use appropriate privilege levels

## Future Enhancements

Potential workflow improvements:
- YAML-based lab definitions (create full lab from file)
- Automated test suites with pass/fail criteria
- Configuration templates (apply standard configs)
- Change validation (verify before committing)
- Rollback capabilities (revert to last good config)
- Monitoring dashboards (real-time device status)
- Integration with other tools (Ansible, Nornir, etc.)

## Getting Started

1. Install and configure both servers
2. Start with simple workflow (create lab, configure one device)
3. Expand to more complex scenarios
4. Build custom workflows for your needs
5. Share your workflows with the community

The combination of cml-toolkit and tmux-mcp-server gives you complete control over CML labs from creation to configuration to testing - all through natural language conversation with Claude.
