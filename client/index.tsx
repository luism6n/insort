import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles.css";
import { Home } from "./Home";
import { Room } from "./Room";
import { CardsDemo } from "./CardsDemo";

function App() {
  return (
    <div className="flex flex-col justify-between items-center h-screen w-screen overflow-hidden">
      <header className="flex justify-center items-center h-20 w-full">
        <h1 className="text-4xl text-blue-400">Insort</h1>
      </header>
      <section className="max-w-5xl w-3/5 flex-1 flex flex-col justify-center align-center">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/r/:roomId" element={<Room />} />
            <Route path="/cards-demo" element={<CardsDemo />} />
          </Routes>
        </BrowserRouter>
      </section>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
