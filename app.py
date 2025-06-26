import streamlit as st
import requests
import os

# For PDF parsing
import pdfplumber

# Hugging Face API endpoints
BART_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
BIGBIRD_API_URL = "https://api-inference.huggingface.co/models/google/bigbird-pegasus-large-bigpatent"
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")  # Set this in your environment

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def analyze_document(text, prompt, settings):
    # Choose model based on text length
    model_url = BIGBIRD_API_URL if len(text) > 3500 else BART_API_URL

    analysis_prompt = f"""
You are an expert debate assistant. Analyze the following document and extract:
- The main arguments and claims, each with a short explanation.
- Supporting evidence for each argument, including statistics, but only if they are relevant and explained in context.
- For each highlight, provide a brief explanation of its importance.

Document:
{text}

Task: {prompt}
"""
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": analysis_prompt,
        "parameters": {
            "max_length": 1024,
            "min_length": 200,
            "do_sample": False
        }
    }
    response = requests.post(model_url, headers=headers, json=payload)
    response.raise_for_status()
    result = response.json()
    return result[0].get("summary_text", "")

def display_advanced_formatting(summary):
    # Try to split summary into logical sections (very basic, depends on model output)
    st.subheader("Key Information")
    # Split by lines and display as cards if possible
    for section in summary.split('\n'):
        section = section.strip()
        if not section:
            continue
        if section.startswith("- "):
            st.markdown(f"**{section[2:]}**")
        else:
            st.info(section)

# Streamlit UI
st.title("DebateCutter (Streamlit Edition)")

uploaded_file = st.file_uploader("Upload a document (txt or pdf)", type=["txt", "pdf"])
prompt = st.text_input("Analysis prompt", "Summarize the key arguments and evidence.")

bold_key_arguments = st.checkbox("Bold key arguments", value=True)
highlight_statistics = st.checkbox("Highlight statistics", value=True)
include_citations = st.checkbox("Include citations", value=True)

text = ""
if uploaded_file is not None:
    if uploaded_file.type == "application/pdf":
        try:
            text = extract_text_from_pdf(uploaded_file)
            if not text.strip():
                st.warning("No text could be extracted from this PDF. Please try another file.")
        except Exception as e:
            st.error(f"Failed to extract text from PDF: {e}")
    else:
        text = uploaded_file.read().decode("utf-8")

if text and st.button("Analyze"):
    with st.spinner("Analyzing document..."):
        settings = {
            "boldKeyArguments": bold_key_arguments,
            "highlightStatistics": highlight_statistics,
            "includeCitations": include_citations
        }
        try:
            summary = analyze_document(text, prompt, settings)
            display_advanced_formatting(summary)
        except Exception as e:
            st.error(f"Analysis failed: {e}")

st.markdown("---")
st.markdown("### Deployment Instructions")
st.markdown("""
1. **Set your Hugging Face API key** as an environment variable:
   ```
   export HUGGINGFACE_API_KEY=your_actual_key
   ```
2. **Install dependencies:**
   ```
   pip install streamlit requests pdfplumber pillow
   ```
3. **Run locally:**
   ```
   streamlit run app.py
   ```
4. **Deploy to [Streamlit Community Cloud](https://streamlit.io/cloud):**
   - Push your code (including `app.py` and a `requirements.txt` with `streamlit`, `requests`, `pdfplumber`, and `pillow`) to a public GitHub repo.
   - Go to [Streamlit Cloud](https://streamlit.io/cloud), sign in, and click 'New app'.
   - Select your repo and branch, and set the main file as `app.py`.
   - In the app settings, add your `HUGGINGFACE_API_KEY` as a secret.
   - Click 'Deploy'.
""") 
