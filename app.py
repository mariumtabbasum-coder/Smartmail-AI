import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

def build_prompt(data):
    task = data.get("task", "professional").strip()
    tone = data.get("tone", "professional").strip()
    length = data.get("length", "detailed").strip()
    context = data.get("message", "").strip()
    recipient = data.get("recipient", "").strip()
    role = data.get("role", "").strip()
    existing = data.get("existing_email", "").strip()

    task_labels = {
        "professional": "Write a polished professional email",
        "internship": "Write an internship application email",
        "followup": "Write a polite follow-up email",
        "improve": "Improve the existing email while preserving its meaning"
    }
    task_instruction = task_labels.get(task, task_labels["professional"])

    if task == "improve" and existing:
        source = f"Existing email:\n{existing}"
    else:
        source = f"User's situation/message:\n{context}"

    return f"""
You are SmartMail AI, an expert email-writing assistant.
{task_instruction}.

Requirements:
- Tone: {tone}
- Length: {length}
- Recipient: {recipient or "Not specified"}
- Role/company (if relevant): {role or "Not specified"}
- Use natural, clear, human-sounding language.
- Correct grammar, spelling, punctuation, and awkward phrasing.
- Do not invent qualifications, experience, dates, promises, or facts.
- If details are missing, use sensible neutral wording or [placeholder].
- Return a useful subject line and complete email body.
- Output exactly in this format:
SUBJECT: ...
BODY:
...
Do not add commentary outside this format.

{source}
""".strip()

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/api/generate")
def generate_email():
    data = request.get_json(silent=True) or {}
    task = data.get("task", "professional")
    if task == "improve":
        source_text = data.get("existing_email", "").strip()
    else:
        source_text = data.get("message", "").strip()

    if not source_text:
        return jsonify({"error": "Please enter your situation or email content first."}), 400

    if not API_KEY:
        return jsonify({
            "error": "Gemini API key is missing. Add GEMINI_API_KEY to your .env file, then restart the Flask server."
        }), 503

    try:
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=build_prompt(data)
        )
        result = (response.text or "").strip()
        if not result:
            return jsonify({"error": "The AI returned an empty response. Please try again."}), 502

        subject = "Your email"
        body = result
        if "BODY:" in result:
            before, body = result.split("BODY:", 1)
            subject = before.replace("SUBJECT:", "").strip() or subject
            body = body.strip()
        else:
            lines = result.splitlines()
            if lines and lines[0].upper().startswith("SUBJECT:"):
                subject = lines.pop(0).split(":", 1)[1].strip() or subject
                body = "\n".join(lines).strip()

        return jsonify({"subject": subject, "body": body})
    except Exception as exc:
        app.logger.exception("Gemini generation failed")
        return jsonify({"error": "AI generation failed. Check your API key, internet connection, and Gemini model access, then try again."}), 502

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "api_key_configured": bool(API_KEY)})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
