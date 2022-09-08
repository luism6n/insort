import React from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";

export function Home() {
  return (
    <div className="h-full w-full max-w-xl flex flex-col justify-center items-center">
      <p>
        {/* This has to be an anchor tag, not a Link,
            so that we actually hit the server */}
        <a className="hover:text-red-500" href={`/r/${nanoid()}`}>
          New Room
        </a>
      </p>
    </div>
  );
}
