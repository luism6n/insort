import React from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";

export function Home() {
  return (
    <div className="h-full flex flex-col justify-center">
      <p>
        {/* This has to be an anchor tag, not a Link,
            so that we actually hit the server */}
        <a href={`/r/${nanoid()}`}>Get a room</a>
      </p>
      <p>
        {/* This has to be and anchor tag, not a Link,
              so that we actually hit the server */}
        <Link to="/cards-demo">Watch cards demo</Link>
      </p>
    </div>
  );
}
