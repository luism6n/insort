import ReactDOM from "react-dom/client";
import React, { Fragment, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { nanoid } from "nanoid";

function Home() {
  return (
    <p>
      {/* This has to be and anchor tag, not a Link,
          so that we actually hit the server */}
      Get a <a href={`/r/${nanoid()}`}>room</a>
    </p>
  );
}

function Room() {
  let { roomId } = useParams();
  const [numPlayers, setNumPlayers] = useState(0);
  let socket = io();

  useEffect(() => {
    socket.emit("join", { roomId });

    socket.on("gameState", (data) => {
      setNumPlayers(data.numPlayers);
    });
  }, []);

  return (
    <p>
      You're in room {`${roomId}`}{" "}
      {numPlayers > 1 ? "with " + numPlayers + " others" : "alone"}
    </p>
  );
}

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("App"));
root.render(<App />);
