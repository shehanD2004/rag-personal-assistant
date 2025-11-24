import chromadb
from utils.embeddings import get_embeddings

chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

def add_documents(chunks):
    if not chunks:
        raise ValueError("No chunks provided to add_documents")
    
    texts = [chunk["text"] for chunk in chunks]
    ids = [chunk["id"] for chunk in chunks]

    print(f"Adding {len(chunks)} documents to vector store...")
    
    embeddings = get_embeddings(texts)

    collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids
    )
    
    print(f"Successfully added {len(chunks)} documents")

def query_vector_store(query_text, n_results=3):
    try:
        embedding = get_embeddings([query_text])[0]

        results = collection.query(
            query_embeddings=[embedding],
            n_results=n_results
        )
        
        return results  # Return full results object
        
    except Exception as e:
        print(f"Vector store query error: {e}")
        return {"documents": []}