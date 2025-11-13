#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Testing tmux MCP server...\n');

// Start the server
const server = spawn('node', ['src/index.js'], {
  cwd: '/home/claude/tmux-mcp-server',
  stdio: ['pipe', 'pipe', 'inherit']
});

let response = '';

server.stdout.on('data', (data) => {
  response += data.toString();
});

// Wait for server to start
await setTimeout(1000);

// Test 1: List tools
console.log('Test 1: Listing tools...');
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
await setTimeout(500);

// Test 2: Create session
console.log('Test 2: Creating tmux session...');
const createSessionRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'tmux_create_session',
    arguments: {
      session_name: 'test-session'
    }
  }
};

server.stdin.write(JSON.stringify(createSessionRequest) + '\n');
await setTimeout(1000);

// Test 3: List sessions
console.log('Test 3: Listing sessions...');
const listSessionsRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'tmux_list_sessions',
    arguments: {}
  }
};

server.stdin.write(JSON.stringify(listSessionsRequest) + '\n');
await setTimeout(500);

// Test 4: Send command
console.log('Test 4: Sending command...');
const sendKeysRequest = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'tmux_send_keys',
    arguments: {
      session_name: 'test-session',
      keys: 'echo "Hello from tmux"'
    }
  }
};

server.stdin.write(JSON.stringify(sendKeysRequest) + '\n');
await setTimeout(500);

// Test 5: Capture output
console.log('Test 5: Capturing pane output...');
const capturePaneRequest = {
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: {
    name: 'tmux_capture_pane',
    arguments: {
      session_name: 'test-session'
    }
  }
};

server.stdin.write(JSON.stringify(capturePaneRequest) + '\n');
await setTimeout(500);

// Test 6: Kill session
console.log('Test 6: Killing session...');
const killSessionRequest = {
  jsonrpc: '2.0',
  id: 6,
  method: 'tools/call',
  params: {
    name: 'tmux_kill_session',
    arguments: {
      session_name: 'test-session'
    }
  }
};

server.stdin.write(JSON.stringify(killSessionRequest) + '\n');
await setTimeout(500);

// Clean up
server.kill();

console.log('\n=== Server Output ===');
console.log(response);
console.log('\n=== Tests Complete ===');
