"""Shared business logic: the SAME code behind the REST API and the MCP server."""
class NotFound(Exception): pass
class Invalid(Exception): pass

class Store:
    def __init__(self):
        self.notes, self.next_id = {}, 1
    def add(self, title: str, body: str) -> dict:
        if not title.strip():
            raise Invalid("title must not be empty")
        n = {"id": self.next_id, "title": title, "body": body}
        self.notes[self.next_id] = n; self.next_id += 1
        return n
    def search(self, query: str) -> list[dict]:
        q = query.lower()
        return [n for n in self.notes.values() if q in n["title"].lower() or q in n["body"].lower()]
    def delete(self, note_id: int) -> dict:
        if note_id not in self.notes:
            raise NotFound(f"note {note_id} not found")
        del self.notes[note_id]
        return {"deleted": note_id}
