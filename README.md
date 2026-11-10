# SmartMail AI — AI Email Assistant

A responsive AI-powered email writing assistant built with **HTML, CSS, Bootstrap 5, JavaScript, Python, Flask, and the Gemini API**.

## Design theme

- Cobalt Blue `#3157D5`
- Apricot Orange `#F19A62`
- Cool White `#F7F8FC`
- Soft Lavender-Blue `#F4F6FC`

## Features

- Professional email generation
- Internship application emails
- Polite follow-up emails
- Improve an existing email
- Professional, formal, and friendly tones
- Short and detailed versions
- Grammar, spelling, and sentence improvement
- Copy subject and email body
- Loading, validation, and API error states
- Responsive layout for desktop, tablet, and mobile
- No horizontal page scrollbar

## Project structure

```text
smartmail-ai/
├── app.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Requirements

- Python 3.10+
- A Gemini API key
- Internet connection for API requests and CDN-hosted Bootstrap/fonts

## Setup

### 1. Open the project folder

```bash
cd smartmail-ai
```

### 2. Create and activate a virtual environment

**Windows (PowerShell):**

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure your Gemini API key

Copy `.env.example` and rename the copy to `.env`.

**Windows:**

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the placeholder:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FLASK_DEBUG=false
PORT=5000
```

Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

**Never commit your `.env` file or expose your API key in frontend JavaScript.**

### 5. Run the application

```bash
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

## API endpoints

### `POST /api/generate`

Accepts JSON:

```json
{
  "task": "internship",
  "message": "I want to apply for a frontend internship...",
  "existing_email": "",
  "recipient": "Hiring Manager",
  "role": "Frontend Intern at Example Co.",
  "tone": "professional",
  "length": "detailed"
}
```

For `task: "improve"`, provide the email in `existing_email`.

Successful response:

```json
{
  "subject": "Application for Frontend Internship",
  "body": "Dear Hiring Manager,\n\n..."
}
```

Errors return a useful `error` message and an appropriate HTTP status code.

### `GET /api/health`

Returns basic server status and whether the API key is configured. It does not reveal the key.

## Prompt templates

The backend builds a prompt based on:
- Selected task
- Recipient and role/company
- Selected tone
- Requested length
- User's situation or existing draft

The prompt instructs the model to preserve meaning, improve grammar, avoid inventing user details, and return a subject and body separately.

## Before deployment

- Set `GEMINI_API_KEY` as a secret environment variable in your hosting provider.
- Never upload `.env`.
- Set `FLASK_DEBUG=false`.
- Use a production WSGI server such as Gunicorn where supported.
- Add rate limiting and request-size limits before making the app public.
- Review generated emails for accuracy before sending.

## Screenshots and demo video

After running the project, capture:
1. Desktop home / input screen
2. Generated email result
3. Internship email example
4. Improve existing email example
5. Mobile responsive screen

Record a short demo showing task selection, tone and length changes, generation, and copy buttons. Add media under a `docs/` folder and link it here.

## GitHub

```bash
git init
git add .
git commit -m "Build SmartMail AI email assistant"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace the remote URL with your own repository URL.

## Disclaimer

SmartMail AI generates suggestions. Always verify names, facts, dates, and claims before sending an email.
