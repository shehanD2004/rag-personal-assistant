from PyPDF2 import PdfReader
import io

def extract_text_from_pdf(file):
    """
    file: UploadFile from FastAPI - needs to be read as bytes
    """
    try:
        # Read the file content as bytes
        pdf_bytes = file.file.read()
        
        # Create a bytes stream for PdfReader
        pdf_stream = io.BytesIO(pdf_bytes)
        
        reader = PdfReader(pdf_stream)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Reset file pointer for potential reuse
        file.file.seek(0)
        
        if not text.strip():
            raise ValueError("No text could be extracted from PDF")
            
        return text
        
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")