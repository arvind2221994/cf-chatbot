import requests
import os
import glob
import json
import time
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()
CF_ACCOUNT_ID = os.getenv("CF_ACCOUNT_ID")
CF_API_TOKEN = os.getenv("CF_API_TOKEN")
INDEX_NAME = os.getenv("INDEX_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- CONSERVATIVE SETTINGS FOR 2026 FREE TIER ---
CHUNK_SIZE = 800    # Smaller chunks = more precision + safer metadata size
CHUNK_OVERLAP = 80
BATCH_SIZE = 40     # Safe middle ground
SLEEP_TIME = 25     # Increased to 25s to avoid the "Retry in 54s" penalty

def get_chunks(path):
    print(f"📖 Reading PDF: {path}")
    reader = PdfReader(path)
    text = " ".join([p.extract_text() for p in reader.pages if p.extract_text()])
    return [text[i:i+CHUNK_SIZE] for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP)]

def get_embeddings_batch(chunk_list):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={GEMINI_API_KEY}"
    payload = {
        "requests": [
            {
                "model": "models/gemini-embedding-001",
                "content": {"parts": [{"text": c}]},
                "outputDimensionality": 768 
            } for c in chunk_list
        ]
    }
    # Using a retry loop for robust ingestion
    for attempt in range(3):
        res = requests.post(url, json=payload)
        if res.status_code == 200:
            return [e['values'] for e in res.json()['embeddings']]
        elif res.status_code == 429:
            wait = 60 * (attempt + 1)
            print(f"⚠️ Rate limited. Sleeping {wait}s before retry...")
            time.sleep(wait)
        else:
            print(f"❌ Error: {res.status_code} - {res.text}")
            return None

def main():
    pdf_files = glob.glob("pdfs/*.pdf")
    for pdf_index, pdf_path in enumerate(pdf_files):
        filename = os.path.basename(pdf_path)
        chunks = get_chunks(pdf_path)
        total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
        
        for i in range(0, len(chunks), BATCH_SIZE):
            batch_num = (i // BATCH_SIZE) + 1
            current_chunks = chunks[i : i + BATCH_SIZE]
            
            embeddings = get_embeddings_batch(current_chunks)
            if not embeddings: continue
            
            vector_data = []
            for j, emb in enumerate(embeddings):
                vector_data.append({
                    "id": f"doc{pdf_index}_chunk{i + j}",
                    "values": [float(val) for val in emb],
                    "metadata": {"text": current_chunks[j], "source": filename}
                })
            
            cf_url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/{INDEX_NAME}/upsert"
            requests.post(cf_url, 
                          headers={"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/x-ndjson"},
                          data="\n".join([json.dumps(v) for v in vector_data]))
            
            print(f"✅ [{filename}] Batch {batch_num}/{total_batches} done.")
            if batch_num < total_batches:
                time.sleep(SLEEP_TIME)

if __name__ == "__main__":
    main()