import uuid

def text_splitter(text, chunk_size=500, chunk_overlap=50):
    """
    Split text into chunks with proper overlap and unique IDs for ChromaDB.
    """
    chunks = []
    
    # Simple sliding window approach with overlap
    start = 0
    chunk_id = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk_text = text[start:end]
        
        chunks.append({
            "id": f"chunk_{chunk_id}_{uuid.uuid4().hex[:8]}",  # Unique ID
            "text": chunk_text.strip()
        })
        
        start += chunk_size - chunk_overlap  # Move with overlap
        chunk_id += 1
        
        # Prevent infinite loop with very small texts
        if chunk_id > 1000:
            break
    
    # Filter out empty chunks
    chunks = [chunk for chunk in chunks if chunk["text"]]
    
    return chunks