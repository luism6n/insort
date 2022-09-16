import React, { Fragment, useEffect, useState } from "react";
import { Select, Toast } from "./designSystem";
import { useToast } from "./useToast";
export function DeckSelection(props: {
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}) {
  // create loader and fetch deck options and shortIds
  const [deckOptions, setDeckOptions] = useState<string[]>([]);
  const [deckShortIds, setDeckShortIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { toast, setToast } = useToast();

  useEffect(() => {
    const fetchDecks = async () => {
      let res;
      try {
        res = await fetch("/decks");
      } catch (e) {
        console.log({ e });
        setError("Could not connect to server.");
        setToast({
          message: "Could not connect to server.",
          type: "warning",
        });
        return;
      }

      const parsed = await res.json();

      if (res.status !== 200) {
        console.error(parsed);
        setError(parsed.message);
        setToast({ message: parsed.message, type: "warning" });
        setLoading(false);
        return;
      }

      setDeckOptions(parsed.map((deck: any) => deck.name));
      setDeckShortIds(parsed.map((deck: any) => deck.shortId));
      if (parsed.length > 0) {
        props.setSelectedDeck(parsed[0].shortId);
      } else {
        setToast({
          message: "No decks found. Create a deck to get started.",
          type: "warning",
        });
      }

      setLoading(false);
    };
    fetchDecks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Select
        selected={props.selectedDeck}
        setSelected={props.setSelectedDeck}
        options={deckOptions}
        values={deckShortIds}
      />
      {toast}
    </div>
  );

  //   return (
  //     <Fragment>
  //       <div>
  //         <Select
  //           selected={props.selectedDeck}
  //           setSelected={props.setSelectedDeck}
  //           options={deckOptions}
  //           values={deckShortIds}
  //         />
  //         {toast}
  //       </div>
  //     </Fragment>
  //   );
}
