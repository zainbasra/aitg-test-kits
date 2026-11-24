"""REST version of the notes service (FastAPI). Run: python api_server.py  -> 127.0.0.1:8101"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from notes_core import Store, NotFound, Invalid
from counting import Counter

app = FastAPI(title="AITG Notes API", version="1.0.0")
store = Store()

class NoteIn(BaseModel):
    title: str
    body: str

@app.post("/notes", status_code=201, summary="Add a note and return it with its id.")
def add_note(note: NoteIn):
    try:
        return store.add(note.title, note.body)
    except Invalid as e:
        raise HTTPException(422, str(e))

@app.get("/notes", summary="Find notes whose title or body contains the query (case-insensitive).")
def search_notes(query: str):
    return store.search(query)

import os
if os.environ.get("RENAME") == "1":   # contract drift: path parameter renamed note_id -> id
    @app.delete("/notes/{id}", summary="Delete a note by id.")
    def delete_note(id: int):
        try:
            return store.delete(id)
        except NotFound as e:
            raise HTTPException(404, str(e))
else:
    @app.delete("/notes/{note_id}", summary="Delete a note by id.")
    def delete_note(note_id: int):
        try:
            return store.delete(note_id)
        except NotFound as e:
            raise HTTPException(404, str(e))

if __name__ == "__main__":
    uvicorn.run(Counter(app), host="127.0.0.1", port=8101, log_level="warning")
