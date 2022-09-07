import React, { ReactNode } from "react";

export function Title({ children }: { children: ReactNode }) {
  return <h3 className="m-1 mb-2 text-lg text-blue-400">{children}</h3>;
}
export function Button({
  onClick,
  children,
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={"p-1 m-1 h-7 bg-gray-200" + (disabled ? " opacity-50" : "")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Select(props: {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  options: string[];
}) {
  return (
    <select
      className="m-1"
      value={props.selected}
      onChange={(e) => props.setSelected(Number.parseInt(e.target.value))}
    >
      {props.options.map((opt, i) => {
        return (
          <option value={i} key={opt}>
            {opt}
          </option>
        );
      })}
    </select>
  );
}
export function Toast(props: { message: string; type: string }) {
  let colors;
  switch (props.type) {
    case "warning":
      colors = "bg-red-100 text-red-700";
      break;
    case "notification":
      colors = "bg-blue-100 text-blue-700";
      break;
  }

  return (
    <div
      className={`${colors} p-2 text-center absolute`}
      role="alert"
      style={{ bottom: 25, left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <span className="block sm:inline">{props.message}</span>
    </div>
  );
}

export function TextInput(props: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <input
      className="border border-black"
      type="text"
      value={props.input}
      onChange={(e) => props.setInput(e.target.value)}
    ></input>
  );
}
