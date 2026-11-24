"""Same server, real transports: stdio subprocess and Streamable HTTP on 127.0.0.1."""
import os, sys, subprocess, time, socket, pathlib
import pytest
from mcp import Client, StdioServerParameters

pytestmark = pytest.mark.anyio
ROOT = pathlib.Path(__file__).parent.parent

async def _roundtrip(c):
    names = {t.name for t in (await c.list_tools()).tools}
    assert "add_note" in names
    r = await c.call_tool("add_note", {"title": "t", "body": "b"})
    assert not r.is_error

async def test_stdio():
    params = StdioServerParameters(command=sys.executable, args=[str(ROOT / "server.py")])
    async with Client(params) as c:
        await _roundtrip(c)

@pytest.fixture
def http_server():
    env = dict(os.environ, MCP_HOST="127.0.0.1")
    p = subprocess.Popen([sys.executable, str(ROOT / "server.py"), "http"], cwd=ROOT, env=env,
                         stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for _ in range(50):
        try:
            socket.create_connection(("127.0.0.1", 8000), timeout=0.2).close(); break
        except OSError:
            time.sleep(0.1)
    yield "http://127.0.0.1:8000/mcp"
    p.terminate(); p.wait(5)

async def test_streamable_http(http_server):
    async with Client(http_server) as c:
        await _roundtrip(c)
