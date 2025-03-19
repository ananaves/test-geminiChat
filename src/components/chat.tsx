import React, { useState } from "react";

const GEMINI_API_KEY = "AIzaSyAoY9xLb6zgmRRDd3oyJxOIWmriJg0NTis"; // Substitua pela sua chave real

interface Message {
  role: "user" | "model";
  text: string;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: "user", text: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput("");

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

      const modelReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao obter resposta.";

      const modelMessage: Message = { role: "model", text: modelReply };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "Você" : "Gemini"}:</strong> {msg.text}
          </div>
        ))}
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
    </div>
  );
};

export default Chat;
