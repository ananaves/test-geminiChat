import React from "react";
import Chat from "./components/chat";
import "./styles/chat.css";

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Gemini Chat</h1>
      <Chat />
    </div>
  );
};

export default App;
