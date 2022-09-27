import React, { Ref } from "react";
import { motion } from "framer-motion";

export function Card({
  content,
  value,
  averageGuess,
  numFormatOptions,
  unit,
  x,
  y,
  comesFrom = { x: 0, y: 0 },
  innerRef = null,
  zIndex = 0,
  clsNames = "",
}: {
  content: number | string;
  value?: number;
  unit: string;
  x?: number;
  y?: number;
  averageGuess?: number;
  comesFrom?: { x: number; y: number };
  innerRef?: Ref<HTMLDivElement> | null;
  numFormatOptions?: Intl.NumberFormatOptions;
  zIndex?: number;
  clsNames?: string;
}) {
  let style: any = { position: "relative" };

  if (x !== undefined || y !== undefined) {
    style = {
      position: "absolute",
    };
  }

  const format = new Intl.NumberFormat("en-US", numFormatOptions).format;

  return (
    <motion.div
      style={{ ...style, zIndex, height: 180, width: 140 }}
      animate={{ left: x, top: y }}
      transition={{ duration: 0.5 }}
      initial={{ left: comesFrom.x, top: comesFrom.y }}
      ref={innerRef}
      className={
        "card py-6 flex-shrink-0 text-center text-align-center flex flex-col justify-between px-2 " +
        clsNames
      }
    >
      <p>{content}</p>
      <p className={`font-bold  mt-auto`}>
        {averageGuess !== undefined ? (
          <span>
            {format(averageGuess)}
            <br />
          </span>
        ) : (
          ""
        )}
        <span className={averageGuess === undefined ? "" : "line-through"}>
          {value !== undefined ? format(value) : "??"}
        </span>{" "}
      </p>
      <span className="text-sm">{unit}</span>
    </motion.div>
  );
}
