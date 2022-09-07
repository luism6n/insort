import React, { ReactNode } from "react";

export function Title({ children }: { children: ReactNode }) {
  return <h3 className="m-1 mb-2 text-lg text-blue-400">{children}</h3>;
}
export function Button({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
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
      {props.options.map((deck, i) => {
        return (
          <option value={i} key={deck}>
            {deck}
          </option>
        );
      })}
    </select>
  );
}
export function Warning({ message }: { message: string }) {
  return (
    <div
      className="bg-red-100 text-red-700 p-2 text-center absolute"
      role="alert"
      style={{ bottom: 25, left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
