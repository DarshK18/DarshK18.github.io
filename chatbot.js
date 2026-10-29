(() => {
  const widget = document.querySelector("#chat-widget");
  if (!widget) return;

  const panel = widget.querySelector("#chat-panel");
  const launcher = widget.querySelector("#chat-launcher");
  const closeButton = widget.querySelector("#chat-close");
  const messages = widget.querySelector("#chat-messages");
  const form = widget.querySelector("#chat-form");
  const input = widget.querySelector("#chat-input");
  const sendButton = widget.querySelector("#chat-send");
  const suggestions = widget.querySelector("#chat-suggestions");
  const apiBase = String(window.PORTFOLIO_CHAT_API_BASE || "").replace(/\/+$/, "");
  const history = [];
  let busy = false;

  const createVisitorId = () => window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    return (char === "x" ? random : (random & 0x3 | 0x8)).toString(16);
  });

  const getVisitorId = () => {
    const key = "darshan-portfolio-chat-visitor";
    try {
      let id = window.localStorage.getItem(key);
      if (!id) {
        id = createVisitorId();
        window.localStorage.setItem(key, id);
      }
      return id;
    } catch {
      return createVisitorId();
    }
  };

  const answerFromPortfolio = (question) => {
    const text = question.toLowerCase();
    if (/intern(ship)?|ybi|inkforge/.test(text)) {
      return {
        answer: "Darshan worked as an AI Engineer Intern at YBI Foundation from September 2025 to March 2026. His internship project, InkForge, is a LangGraph multi-agent pipeline for planning, researching, and drafting technical articles, with Tavily search and a Streamlit dashboard.",
        sources: ["YBI Foundation internship", "InkForge"],
      };
    }
    if (/project|built|build|created|portfolio work|selected work/.test(text)) {
      return {
        answer: "Darshan’s projects include RAGGuard, a RAG evaluation workbench; InkForge, a multi-agent research and writing pipeline; an Expense Tracker MCP Agent; a gesture-to-text accessibility system; a Birth Weight Predictor; a Weather AI Agent; Customer Personality Segmentation; and BenchWiki, an LLM benchmark explorer.",
        sources: ["Portfolio projects"],
      };
    }
    if (/skill|tool|technology|tech stack|language|framework/.test(text)) {
      return {
        answer: "Darshan works with Python, SQL, TypeScript, LangChain, LangGraph, Hugging Face, Ollama, FastMCP, Flask, Streamlit, PyTorch, TensorFlow, Scikit-learn, OpenCV, FAISS, ChromaDB, and Pydantic.",
        sources: ["Skills"],
      };
    }
    if (/education|degree|college|university|study/.test(text)) {
      return {
        answer: "Darshan completed a B.E. in Artificial Intelligence and Data Science at K.K. Wagh Institute of Engineering Education & Research, Nashik, from 2021 to 2025.",
        sources: ["Education"],
      };
    }
    if (/certificate|certification|course|learning/.test(text)) {
      return {
        answer: "His listed learning includes AWS Academy Cloud Foundations, the AWS ML Engineer Associate curriculum, AI Fluency, Claude AI, Data Analytics, Generative AI, Python, and a 2024 Data Science student workshop. The portfolio’s Courses & Certificates section has the documents.",
        sources: ["Courses & certificates"],
      };
    }
    if (/contact|email|linkedin|github|hire|location/.test(text)) {
      return {
        answer: "Darshan is based in Pune, India. You can reach him at darshankedare1815@gmail.com or through the GitHub and LinkedIn links in the portfolio header.",
        sources: ["Contact and links"],
      };
    }
    return {
      answer: "I can answer questions about Darshan’s projects, YBI Foundation internship, skills, education, courses, or contact links.",
      sources: ["Portfolio profile"],
    };
  };

  const showAnswer = (article, result) => {
    article.querySelector("p").textContent = result.answer;
    if (result.sources?.length) {
      const sourceLine = document.createElement("span");
      sourceLine.className = "chat-source-line";
      sourceLine.textContent = `SOURCE · ${result.sources.join(" · ")}`;
      article.append(sourceLine);
    }
    article.classList.remove("chat-pending");
    history.push({ role: "user", content: result.question || "" }, { role: "assistant", content: result.answer });
    if (history.length > 4) history.splice(0, history.length - 4);
  };

  const togglePanel = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else launcher.focus();
  };

  const appendMessage = (role, text, sources = []) => {
    const article = document.createElement("article");
    article.className = `chat-message chat-message-${role}`;
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.append(paragraph);
    if (sources.length) {
      const sourceLine = document.createElement("span");
      sourceLine.className = "chat-source-line";
      sourceLine.textContent = `SOURCE · ${sources.join(" · ")}`;
      article.append(sourceLine);
    }
    messages.append(article);
    messages.scrollTop = messages.scrollHeight;
    return article;
  };

  const sendQuestion = async (question) => {
    const cleaned = question.trim();
    if (!cleaned || busy) return;
    appendMessage("user", cleaned);
    const previousHistory = history.slice(-4).map(({ role, content }) => ({
      role,
      content: content.slice(0, 500),
    }));
    suggestions.hidden = true;
    input.value = "";
    busy = true;
    sendButton.disabled = true;
    input.disabled = true;
    const pending = appendMessage("assistant", "Thinking…");
    pending.classList.add("chat-pending");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    if (!apiBase) {
      window.clearTimeout(timeoutId);
      showAnswer(pending, { ...answerFromPortfolio(cleaned), question: cleaned });
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleaned, visitor_id: getVisitorId(), history: previousHistory }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof result.detail === "string" ? result.detail : "I couldn't answer just now. Please try again shortly.");
      }
      showAnswer(pending, { answer: result.answer || "I couldn't find that in Darshan’s profile.", sources: result.sources || [], question: cleaned });
    } catch (error) {
      showAnswer(pending, { ...answerFromPortfolio(cleaned), question: cleaned });
    } finally {
      window.clearTimeout(timeoutId);
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  };

  launcher.addEventListener("click", () => togglePanel(panel.hidden));
  closeButton.addEventListener("click", () => togglePanel(false));
  widget.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) togglePanel(false);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendQuestion(input.value);
  });
  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) sendQuestion(button.textContent);
  });
})();
