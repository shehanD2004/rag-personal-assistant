from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.pdf_loader import extract_text_from_pdf
from utils.text_splitter import text_splitter
from services.vector_store import add_documents, query_vector_store
import traceback

app = FastAPI(title="RAG Personal Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple chat memory
chat_history = []

@app.post("/upload")
async def upload_pdf(file: UploadFile):
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        print(f"Processing PDF: {file.filename}")
        
        # Extract text from PDF
        text = extract_text_from_pdf(file)
        print(f"Extracted text length: {len(text)} characters")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
        
        # Split into chunks
        chunks = text_splitter(text)
        print(f"Created {len(chunks)} chunks")
        
        # Add to vector store
        add_documents(chunks)
        
        return {"status": "success", "chunks": len(chunks)}
        
    except Exception as e:
        error_detail = f"Upload failed: {str(e)}"
        print(error_detail)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/ask")
def ask_question(q: str):
    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        print(f"Processing question: {q}")
        
        results = query_vector_store(q)
        
        # Fixed: Properly access the results structure
        docs = results.get("documents", [])
        relevant_docs = docs[0] if docs else []
        
        # Join relevant documents to form answer
        answer = "\n".join(relevant_docs) if relevant_docs else "No relevant information found in the uploaded documents."
        
        # Update chat history
        chat_history.append({"question": q, "answer": answer})
        
        # Keep only last 10 conversations
        if len(chat_history) > 10:
            chat_history.pop(0)
        
        return {
            "answer": answer,
            "chat_history": chat_history
        }
        
    except Exception as e:
        error_detail = f"Query failed: {str(e)}"
        print(error_detail)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/health")
def health_check():
    return {"status": "healthy", "chat_history_length": len(chat_history)}

@app.get("/")
def read_root():
    return {"message": "RAG Personal Assistant API is running!"}