import React, { Dispatch, SetStateAction, useState } from "react";
import { colors } from "./colors";
import { Button, Input, Title } from "./designSystem";
import { Overlay } from "./Overlay";

function SendFeedback(props: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  function sendFeedback() {
    fetch("/feedbacks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        email,
      }),
    });
    props.setOpen(false);
  }

  return (
    <Overlay bgColor={colors.red} open={props.open} setOpen={props.setOpen}>
      <div className="flex flex-col items-center p-2 gap-2 w-full">
        <Title>Send us your feedback</Title>
        <form
          className="flex flex-col items-center gap-2 w-full"
          onSubmit={sendFeedback}
        >
          <label className="sr-only" htmlFor="feedbackMessage">
            Feedback message
          </label>
          <textarea
            id="feedbackMessage"
            maxLength={1400}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2"
            style={{
              height: "150px",
            }}
          ></textarea>
          <Input label="Email (optional)" value={email} setValue={setEmail} />

          <Button type="submit">Send</Button>
        </form>
      </div>
    </Overlay>
  );
}

export default SendFeedback;
