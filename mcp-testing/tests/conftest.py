import importlib, sys, pathlib
import pytest
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from mcp import Client

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    import os
    server = importlib.import_module(os.environ.get('AITG_SERVER','server'))
    importlib.reload(server)  # fresh notes store and picks up AITG_BUG
    async with Client(server.mcp) as c:
        yield c
