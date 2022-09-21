import { Header } from "./Header";
import ReactDOM from "react-dom/client";
import React, { useLayoutEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles.css";
import { Home } from "./Home";
import { Room } from "./Room";
import { CardsDemo } from "./CardsDemo";
import { colors } from "./colors";
import BuildDeck from "./BuildDeck";

function makeBodyFit() {
  document.body.style.height = window.innerHeight + "px";
}

function App() {
  useLayoutEffect(() => {
    window.addEventListener("resize", makeBodyFit);
    makeBodyFit();
  }, []);

  return (
    <div
      style={{ backgroundColor: colors.blue, color: colors.purple }}
      className="flex flex-col items-center h-full w-screen overflow-hidden"
    >
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:roomId" element={<Room />} />
          <Route path="/cards-demo" element={<CardsDemo />} />
          <Route path="/build-deck" element={<BuildDeck />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App") as Element);
root.render(<App />);
