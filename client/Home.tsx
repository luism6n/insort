import React from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";

export function Home() {
  return (
    <div className="h-full w-full max-w-xl flex flex-col gap-6 justify-center items-center">
      <p>
        {/* This has to be an anchor tag, not a Link,
          so that we actually hit the server */}
        <a className="hover:text-red-800" href={`/r/${nanoid()}`}>
          New Room
        </a>
      </p>
      <p>
        {/* This has to be an anchor tag, not a Link,
            so that we actually hit the server */}
        <Link className="hover:text-red-800" to="/build-deck">
          Build a Deck
        </Link>
      </p>
    </div>
  );
}
