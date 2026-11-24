"""In-memory tests for the AITG Notes MCP server (MCP Python SDK 2.x + pytest)."""
import json, pathlib
import pytest

pytestmark = pytest.mark.anyio
SNAPSHOT = pathlib.Path(__file__).parent / "tools_snapshot.json"

# 1. Discovery: the tools an agent will see
async def test_lists_expected_tools(client):
    names = {t.name for t in (await client.list_tools()).tools}
    assert names == {"add_note", "search_notes", "delete_note", "read_file"}

async def test_every_tool_has_a_description(client):
    for t in (await client.list_tools()).tools:
        assert t.description and len(t.description) > 10, t.name

# 2. Contract: tool names, descriptions and input schemas match the approved snapshot
async def test_tool_schemas_match_snapshot(client):
    tools = {t.name: {"description": t.description, "input_schema": t.input_schema}
             for t in (await client.list_tools()).tools}
    if not SNAPSHOT.exists():
        SNAPSHOT.write_text(json.dumps(tools, indent=2, sort_keys=True))
        pytest.skip("snapshot created")
    assert tools == json.loads(SNAPSHOT.read_text())

# 3. Happy path
async def test_add_then_search(client):
    r = await client.call_tool("add_note", {"title": "Locators", "body": "Use getByRole first"})
    assert not r.is_error
    assert json.loads(r.content[0].text)["id"] == 1
    r = await client.call_tool("search_notes", {"query": "getbyrole"})
    assert not r.is_error
    assert "Locators" in r.content[0].text

async def test_delete(client):
    await client.call_tool("add_note", {"title": "a", "body": "b"})
    r = await client.call_tool("delete_note", {"note_id": 1})
    assert r.content[0].text == "deleted 1"

# 4. Errors the model must be able to read
async def test_empty_title_is_a_readable_error(client):
    r = await client.call_tool("add_note", {"title": "  ", "body": "x"})
    assert r.is_error and "title must not be empty" in r.content[0].text

async def test_delete_missing_note(client):
    r = await client.call_tool("delete_note", {"note_id": 99})
    assert r.is_error and "not found" in r.content[0].text

# 5. Schema validation
async def test_missing_argument_rejected(client):
    r = await client.call_tool("add_note", {"title": "x"})
    assert r.is_error and "body" in r.content[0].text

async def test_wrong_type_rejected(client):
    r = await client.call_tool("delete_note", {"note_id": "abc"})
    assert r.is_error and "integer" in r.content[0].text

async def test_unknown_tool(client):
    r = await client.call_tool("drop_database", {})
    assert r.is_error and "Unknown tool" in r.content[0].text

# 6. Safety of inputs
@pytest.mark.parametrize("name", ["../secret.env", "/etc/passwd", "sub/../../secret.env"])
async def test_read_file_blocks_paths_outside_sandbox(client, name):
    r = await client.call_tool("read_file", {"name": name})
    assert r.is_error
    assert "SECRET" not in r.content[0].text and "root:" not in r.content[0].text

async def test_read_file_inside_sandbox(client):
    r = await client.call_tool("read_file", {"name": "readme.txt"})
    assert r.content[0].text.strip() == "hello from the sandbox"

# 7. Resources and prompts
async def test_note_resource(client):
    await client.call_tool("add_note", {"title": "T", "body": "B"})
    res = await client.read_resource("notes://1")
    assert res.contents[0].text == "T\n\nB"

async def test_prompt_includes_notes(client):
    await client.call_tool("add_note", {"title": "T", "body": "B"})
    p = await client.get_prompt("summarize_notes", {"style": "bullet"})
    assert "bullet" in p.messages[0].content.text and "- T: B" in p.messages[0].content.text
