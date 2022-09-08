import { Header } from "./Header";
import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles.css";
import { Home } from "./Home";
import { Room } from "./Room";
import { CardsDemo } from "./CardsDemo";
import { colors } from "./colors";

function App() {
  return (
    <div
      style={{ backgroundColor: colors.blue }}
      className="flex flex-col items-center h-screen w-screen overflow-hidden"
    >
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:roomId" element={<Room />} />
          <Route path="/cards-demo" element={<CardsDemo />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
