import React, { useState, useEffect, useRef } from "react";

const GEMINI_API_KEY = "AIzaSyAoY9xLb6zgmRRDd3oyJxOIWmriJg0NTis"; // Substitua pela sua chave real

interface Message {
  role: "user" | "model";
  text: string;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado para o modo escuro
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-history");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatResponse = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Substitui **texto** por <strong>texto</strong>
      .replace(/\*(.*?)/g, "-$1") // Substitui *texto* por -texto
      .split("\n")
      .map((line) => (line.trim() ? `<p>${line}</p>` : "")) // Quebra as linhas e as envolve em <p> tags
      .join("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: "user", text: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const requestBody = {
      contents: updatedMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      let modelReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao obter resposta.";
      modelReply = formatResponse(modelReply);

      const modelMessage: Message = { role: "model", text: modelReply };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar o modo escuro
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`chat-container ${isDarkMode ? "dark" : "light"}`}>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "Você" : "Gemini"}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }} />
          </div>
        ))}
        {isLoading && <div className="loading-message">Carregando...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          placeholder="Digite sua mensagem..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
      {/* Botão para alternar entre os modos */}
      <button className="toggle-theme-btn" onClick={toggleDarkMode}>
        {isDarkMode ? "Modo Claro" : "Modo Escuro"}
      </button>
    </div>
  );
};

export default Chat;