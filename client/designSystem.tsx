import { nanoid } from "nanoid";
import React, { Fragment, ReactNode } from "react";
import { colors, colors as systemColors } from "./colors";

export function Title({ children }: { children: ReactNode }) {
  return <h3 className="m-1 text-xl mb-2 text-blue-400">{children}</h3>;
}
export function Button({
  unique,
  onClick,
  children,
  disabled,
  type = "button",
  trackEventCls = "",
}: {
  unique?: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  trackEventCls?: string;
}) {
  let extraClasses = "";
  let extraStyle = {};
  switch (unique) {
    case "back":
      extraStyle = { width: 20, height: 28 };
      extraClasses += " back-btn";
      break;
    case "send":
      extraStyle = { width: 20, height: 28 };
      extraClasses += " send-btn";
      break;
    case "left":
      extraStyle = { width: 60, height: 60 };
      extraClasses += " left-btn";
      break;
    case "right":
      extraStyle = { width: 60, height: 60 };
      extraClasses += " right-btn";
      break;
    case "place":
      extraStyle = { width: 132, height: 64 };
      extraClasses += " place-btn";
      break;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={
        "btn p-1 m-1 h-7" +
        (disabled ? " opacity-50" : "") +
        extraClasses +
        " " +
        trackEventCls
      }
      style={{
        height: 40,
        width: 184,
        ...extraStyle,
        color: colors.purple,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Select(props: {
  selected: number | string;
  setSelected: React.Dispatch<React.SetStateAction<number | string>>;
  options: string[];
  values?: string[];
}) {
  let values: (number | string)[];
  if (!props.values) {
    values = Array.from(props.options);
  } else {
    values = props.values;
  }

  return (
    <select
      className="w-full m-1"
      value={props.selected}
      onChange={(e) => props.setSelected(e.target.value)}
    >
      {props.options.map((opt, i) => {
        return (
          <option value={values[i]} key={values[i]}>
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
      className={`${colors} p-2 text-center absolute border-4`}
      role="alert"
      style={{
        top: "50vh",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        borderColor: systemColors.purple,
      }}
    >
      <span className="block sm:inline">{props.message}</span>
    </div>
  );
}

export function Input(props: {
  maxLength?: number;
  type?: "number" | "text" | "email" | "url";
  label?: string;
  placeholder?: string;
  value: string | number;
  setValue: React.Dispatch<React.SetStateAction<string | number>>;
  classes?: string;
  style?: { [key: string]: string };
  required?: boolean;
}) {
  let inputLabel = null;
  let inputId = null;
  if (props.label) {
    inputId = nanoid();
    inputLabel = <label htmlFor={inputId}>{props.label}</label>;
  }

  let type;
  if (!props.type) {
    type = "text";
  } else {
    type = props.type;
  }

  return (
    <Fragment>
      {inputLabel}
      <input
        required={props.required}
        style={props.style}
        maxLength={props.maxLength}
        id={inputId}
        placeholder={props.placeholder}
        className={
          "placeholder-gray-400 p-2 w-full " +
          (props.classes ? props.classes : "")
        }
        type={type}
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
      ></input>
    </Fragment>
  );
}
