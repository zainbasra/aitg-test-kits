"""MCP version of the same notes service (official Python SDK 2.3.0, Streamable HTTP). Run: python mcp_server.py -> 127.0.0.1:8102/mcp"""
import uvicorn
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from notes_core import Store, NotFound, Invalid
from counting import Counter

mcp = MCPServer("aitg-notes", version="1.0.0")
store = Store()

@mcp.tool()
def add_note(title: str, body: str) -> dict:
    """Add a note and return it with its id."""
    try:
        return store.add(title, body)
    except Invalid as e:
        raise ToolError(str(e))

@mcp.tool()
def search_notes(query: str) -> list[dict]:
    """Find notes whose title or body contains the query (case-insensitive)."""
    return store.search(query)

import os
if os.environ.get("RENAME") == "1":   # contract drift: argument renamed note_id -> id
    @mcp.tool()
    def delete_note(id: int) -> dict:
        """Delete a note by id."""
        try:
            return store.delete(id)
        except NotFound as e:
            raise ToolError(str(e))
else:
    @mcp.tool()
    def delete_note(note_id: int) -> dict:
        """Delete a note by id."""
        try:
            return store.delete(note_id)
        except NotFound as e:
            raise ToolError(str(e))

if __name__ == "__main__":
    uvicorn.run(Counter(mcp.streamable_http_app()), host="127.0.0.1", port=8102, log_level="warning")
