#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class TmuxServer {
  constructor() {
    this.server = new Server(
      {
        name: "tmux-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "tmux_create_session",
          description:
            "Create a new tmux session. If no name is provided, tmux will generate one. Returns session name.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name for the tmux session (optional)",
              },
              start_directory: {
                type: "string",
                description: "Starting directory for the session (optional)",
              },
            },
          },
        },
        {
          name: "tmux_list_sessions",
          description:
            "List all active tmux sessions with their details (name, windows, created time, attached status).",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "tmux_send_keys",
          description:
            "Send keys/commands to a tmux session. Automatically appends Enter unless literal mode is specified.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session",
              },
              keys: {
                type: "string",
                description: "Keys or command to send to the session",
              },
              literal: {
                type: "boolean",
                description:
                  "If true, send keys literally without appending Enter (default: false)",
              },
            },
            required: ["session_name", "keys"],
          },
        },
        {
          name: "tmux_capture_pane",
          description:
            "Capture the visible content of a tmux pane. Returns the text currently displayed in the pane.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session",
              },
              pane_index: {
                type: "string",
                description: "Pane index (default: 0 for main pane)",
              },
              lines: {
                type: "number",
                description:
                  "Number of lines to capture from scrollback (default: captures visible area, use -1 for entire scrollback)",
              },
            },
            required: ["session_name"],
          },
        },
        {
          name: "tmux_kill_session",
          description:
            "Kill/terminate a tmux session and all its windows and panes.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session to kill",
              },
            },
            required: ["session_name"],
          },
        },
        {
          name: "tmux_split_window",
          description:
            "Split the current window in a tmux session horizontally or vertically to create a new pane.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session",
              },
              vertical: {
                type: "boolean",
                description:
                  "If true, split vertically (side by side). If false, split horizontally (top and bottom). Default: false",
              },
            },
            required: ["session_name"],
          },
        },
        {
          name: "tmux_select_pane",
          description:
            "Select a specific pane in a tmux session to make it active for commands.",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session",
              },
              pane_index: {
                type: "string",
                description: "Pane index to select (e.g., '0', '1', '2')",
              },
            },
            required: ["session_name", "pane_index"],
          },
        },
        {
          name: "tmux_list_panes",
          description:
            "List all panes in a tmux session with their details (index, size, active status).",
          inputSchema: {
            type: "object",
            properties: {
              session_name: {
                type: "string",
                description: "Name of the tmux session",
              },
            },
            required: ["session_name"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "tmux_create_session":
            return await this.createSession(args);
          case "tmux_list_sessions":
            return await this.listSessions();
          case "tmux_send_keys":
            return await this.sendKeys(args);
          case "tmux_capture_pane":
            return await this.capturePane(args);
          case "tmux_kill_session":
            return await this.killSession(args);
          case "tmux_split_window":
            return await this.splitWindow(args);
          case "tmux_select_pane":
            return await this.selectPane(args);
          case "tmux_list_panes":
            return await this.listPanes(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async createSession(args) {
    const { session_name, start_directory } = args;
    let cmd = "tmux new-session -d";

    if (session_name) {
      cmd += ` -s "${session_name}"`;
    }

    if (start_directory) {
      cmd += ` -c "${start_directory}"`;
    }

    try {
      await execAsync(cmd);

      // If no session name was provided, get the name of the last created session
      let actualSessionName = session_name;
      if (!session_name) {
        const { stdout } = await execAsync(
          "tmux list-sessions -F '#{session_name}' | tail -1"
        );
        actualSessionName = stdout.trim();
      }

      return {
        content: [
          {
            type: "text",
            text: `Created tmux session: ${actualSessionName}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async listSessions() {
    try {
      const { stdout } = await execAsync(
        "tmux list-sessions -F '#{session_name}|#{session_windows}|#{session_created}|#{session_attached}' 2>/dev/null || echo ''"
      );

      if (!stdout.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "No active tmux sessions",
            },
          ],
        };
      }

      const sessions = stdout
        .trim()
        .split("\n")
        .map((line) => {
          const [name, windows, created, attached] = line.split("|");
          const createdDate = new Date(parseInt(created) * 1000);
          return {
            name,
            windows: parseInt(windows),
            created: createdDate.toISOString(),
            attached: attached === "1",
          };
        });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sessions, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }
  }

  async sendKeys(args) {
    const { session_name, keys, literal = false } = args;

    try {
      let cmd = `tmux send-keys -t "${session_name}" "${keys.replace(
        /"/g,
        '\\"'
      )}"`;

      if (!literal) {
        cmd += " Enter";
      }

      await execAsync(cmd);

      return {
        content: [
          {
            type: "text",
            text: `Sent keys to session ${session_name}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to send keys: ${error.message}`);
    }
  }

  async capturePane(args) {
    const { session_name, pane_index = "0", lines } = args;

    try {
      let cmd = `tmux capture-pane -t "${session_name}:${pane_index}" -p`;

      if (lines !== undefined) {
        if (lines === -1) {
          cmd += " -S -"; // Capture entire scrollback
        } else {
          cmd += ` -S -${lines}`;
        }
      }

      const { stdout } = await execAsync(cmd);

      return {
        content: [
          {
            type: "text",
            text: stdout,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to capture pane: ${error.message}`);
    }
  }

  async killSession(args) {
    const { session_name } = args;

    try {
      await execAsync(`tmux kill-session -t "${session_name}"`);

      return {
        content: [
          {
            type: "text",
            text: `Killed tmux session: ${session_name}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to kill session: ${error.message}`);
    }
  }

  async splitWindow(args) {
    const { session_name, vertical = false } = args;

    try {
      let cmd = `tmux split-window -t "${session_name}"`;

      if (vertical) {
        cmd += " -h"; // horizontal split creates vertical panes (side by side)
      }

      await execAsync(cmd);

      return {
        content: [
          {
            type: "text",
            text: `Split window in session ${session_name} (${
              vertical ? "vertically" : "horizontally"
            })`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to split window: ${error.message}`);
    }
  }

  async selectPane(args) {
    const { session_name, pane_index } = args;

    try {
      await execAsync(
        `tmux select-pane -t "${session_name}:${pane_index}"`
      );

      return {
        content: [
          {
            type: "text",
            text: `Selected pane ${pane_index} in session ${session_name}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to select pane: ${error.message}`);
    }
  }

  async listPanes(args) {
    const { session_name } = args;

    try {
      const { stdout } = await execAsync(
        `tmux list-panes -t "${session_name}" -F '#{pane_index}|#{pane_width}x#{pane_height}|#{pane_active}|#{pane_current_command}'`
      );

      const panes = stdout
        .trim()
        .split("\n")
        .map((line) => {
          const [index, size, active, command] = line.split("|");
          return {
            index: parseInt(index),
            size,
            active: active === "1",
            command,
          };
        });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(panes, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list panes: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Tmux MCP server running on stdio");
  }
}

const server = new TmuxServer();
server.run().catch(console.error);
