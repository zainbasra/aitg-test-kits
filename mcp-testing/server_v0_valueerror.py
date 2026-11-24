"""AITG Notes: a small mock MCP server we built to practise MCP testing.
Tools: add_note, search_notes, delete_note, read_file (sandboxed). Resource: notes://{note_id}. Prompt: summarize_notes.
BUG switch: env AITG_BUG=1 introduces a realistic regression (search becomes case-sensitive, read_file stops checking paths).
"""
import os
from pathlib import Path
from mcp.server.mcpserver import MCPServer

BUG = os.environ.get("AITG_BUG") == "1"
SANDBOX = Path(__file__).parent / "sandbox"
mcp = MCPServer("aitg-notes", version="1.0.0")
NOTES: dict[int, dict] = {}
_next = [1]

@mcp.tool()
def add_note(title: str, body: str) -> dict:
    """Add a note and return it with its id."""
    if not title.strip():
        raise ValueError("title must not be empty")
    nid = _next[0]; _next[0] += 1
    NOTES[nid] = {"id": nid, "title": title, "body": body}
    return NOTES[nid]

@mcp.tool()
def search_notes(query: str) -> list[dict]:
    """Find notes whose title or body contains the query (case-insensitive)."""
    if BUG:
        return [n for n in NOTES.values() if query in n["title"] or query in n["body"]]
    q = query.lower()
    return [n for n in NOTES.values() if q in n["title"].lower() or q in n["body"].lower()]

@mcp.tool()
def delete_note(note_id: int) -> str:
    """Delete a note by id."""
    if note_id not in NOTES:
        raise ValueError(f"note {note_id} not found")
    del NOTES[note_id]
    return f"deleted {note_id}"

@mcp.tool()
def read_file(name: str) -> str:
    """Read a text file from the server's sandbox folder only."""
    p = (SANDBOX / name).resolve()
    if not BUG and SANDBOX.resolve() not in p.parents:
        raise ValueError("path outside sandbox")
    return p.read_text()

@mcp.resource("notes://{note_id}")
def note_resource(note_id: str) -> str:
    """A single note as text."""
    n = NOTES.get(int(note_id))
    if not n:
        raise ValueError("not found")
    return f"{n['title']}\n\n{n['body']}"

@mcp.prompt()
def summarize_notes(style: str = "short") -> str:
    """Ask the model to summarize all notes."""
    return f"Summarize these notes in a {style} style:\n" + "\n".join(f"- {n['title']}: {n['body']}" for n in NOTES.values())

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "http":
        mcp.run(transport="streamable-http")
    else:
        mcp.run()
