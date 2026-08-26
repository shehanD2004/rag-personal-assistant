📘 RAG Personal Assistant (FastAPI + ChromaDB)

A lightweight **Retrieval-Augmented Generation (RAG)** system that lets users upload PDFs, index their content into embeddings, and ask natural-language questions. The system retrieves the most relevant chunks using **ChromaDB** and responds using the stored text data.

---

🚀 Features

* 📄 Upload any PDF file
* 🔍 Automatic text extraction
* ✂️ Text chunking with custom splitter
* 🧠 Embedding generation using **Sentence-Transformer (MiniLM-L6-v2)**
* 📦 Vector storage in **ChromaDB**
* 🤖 Ask questions and retrieve relevant document context
* 🖥️ Simple HTML/JS frontend UI
* ⚡ FastAPI backend with REST APIs

---

📂 Project Structure

```
rag-personal-assistant/
│
├── backend/
│   ├── main.py
│   ├── utils/
│   │   ├── pdf_loader.py
│   │   ├── text_splitter.py
│   ├── services/
│   │   ├── embeddings.py
│   │   ├── vector_store.py
│   ├── venv/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│
└── README.md
```

---

🔧 Technologies Used

**Backend**

* FastAPI
* Python 3.10+
* sentence-transformers
* ChromaDB
* PyPDF2

**Frontend**

* HTML
* CSS
* JavaScript (vanilla fetch API)

---

▶️ How to Run the Backend

1. Open terminal
2. Navigate to backend folder

```
cd backend
```

3. Install dependencies

```
pip install -r requirements.txt
```

4. Start FastAPI server

```
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

💻 How to Run the Frontend

1. Open `frontend/index.html` in any browser
2. Upload a PDF
3. Ask questions in the chat box

---

📌 API Endpoints

**POST /upload**

Uploads & indexes a PDF.

**GET /ask?q=your question**

Retrieves the best matching chunk.

---

🧠 How It Works (RAG Pipeline)

1. **Upload PDF**
2. **Extract text using PyPDF2**
3. **Split text into chunks (500 chars)**
4. **Embed chunks using MiniLM-L6-v2**
5. **Store embeddings in ChromaDB**
6. **Query vector DB with user question**
7. **Return top relevant answer**

---

🧪 Example Output

**User:** What is the aim of this module?
**Assistant:** *Extracted from the most relevant PDF chunk…*

---

Screenshots

<img width="1920" height="941" alt="RAG-SS" src="https://github.com/user-attachments/assets/6a23b4ed-b715-4bbb-9cec-8478e6b08e77" />

---

🤝 Contributing

Pull requests are welcome!
If you'd like to add OCR, multi-file support, or LLM integration, feel free to contribute.

---

📄 License

MIT License.

---
