const taskButtons = document.querySelectorAll(".task-card");
const message = document.getElementById("message");
const existingEmail = document.getElementById("existingEmail");
const messageLabel = document.getElementById("messageLabel");
const helperText = document.getElementById("helperText");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const spinner = document.getElementById("spinner");
const errorBox = document.getElementById("errorBox");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
let selectedTask = "professional";
let lastPayload = null;

function activeTextArea(){ return selectedTask === "improve" ? existingEmail : message; }
function updateCount(){ charCount.textContent = `${activeTextArea().value.length} characters`; }
[message, existingEmail].forEach(el => el.addEventListener("input", updateCount));

taskButtons.forEach(button => button.addEventListener("click", () => {
  taskButtons.forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  selectedTask = button.dataset.task;
  const improve = selectedTask === "improve";
  message.classList.toggle("d-none", improve);
  existingEmail.classList.toggle("d-none", !improve);
  document.getElementById("recipientGroup").classList.toggle("d-none", improve);
  document.getElementById("roleGroup").classList.toggle("d-none", improve);
  messageLabel.textContent = improve ? "PASTE YOUR EXISTING EMAIL" : "TELL US WHAT'S ON YOUR MIND";
  helperText.textContent = improve ? "We'll polish grammar and clarity while keeping your meaning." : "A few details help us write a more personal email.";
  updateCount();
  hideError();
}));

function hideError(){ errorBox.classList.add("d-none"); errorBox.textContent = ""; }
function setLoading(loading){
  generateBtn.disabled = loading;
  spinner.classList.toggle("d-none", !loading);
  generateBtn.querySelector(".btn-text").textContent = loading ? "Writing your email..." : "Generate my email";
  generateBtn.querySelector(".btn-arrow").classList.toggle("d-none", loading);
}
function showError(message){
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}
async function generate(payload){
  hideError();
  setLoading(true);
  try{
    const response = await fetch("/api/generate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    document.getElementById("subjectOutput").textContent = data.subject;
    document.getElementById("bodyOutput").textContent = data.body;
    emptyState.classList.add("d-none");
    resultContent.classList.remove("d-none");
    if(window.innerWidth < 992) document.querySelector(".output-panel").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(error){
    showError(error.message || "Unable to connect. Please check your connection and try again.");
  }finally{ setLoading(false); }
}
generateBtn.addEventListener("click", () => {
  const text = activeTextArea().value.trim();
  if(!text){ showError(selectedTask === "improve" ? "Please paste the email you want to improve." : "Please describe what your email should be about."); activeTextArea().focus(); return; }
  lastPayload = {
    task:selectedTask, message:message.value.trim(), existing_email:existingEmail.value.trim(),
    recipient:document.getElementById("recipient").value.trim(),
    role:document.getElementById("role").value.trim(),
    tone:document.getElementById("tone").value,
    length:document.getElementById("length").value
  };
  generate(lastPayload);
});
document.getElementById("regenerateBtn").addEventListener("click", () => { if(lastPayload) generate(lastPayload); });
async function copyText(text, button){
  if(!text) return;
  try{
    await navigator.clipboard.writeText(text);
    const original = button.innerHTML;
    button.innerHTML = "✓ <span>Copied</span>";
    setTimeout(() => button.innerHTML = original, 1500);
  }catch{
    showError("Clipboard access was blocked by your browser. Please select and copy the text manually.");
  }
}
document.getElementById("copySubject").addEventListener("click", e => copyText(document.getElementById("subjectOutput").textContent,e.currentTarget));
document.getElementById("copyBody").addEventListener("click", e => copyText(document.getElementById("bodyOutput").textContent,e.currentTarget));
