import React, { Fragment, useEffect, useState } from "react";
import { DeckOptionsJSON } from "../types/types";
import { Select, Toast } from "./designSystem";
import { useToast } from "./useToast";
export function DeckSelection(props: {
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}) {
  // create loader and fetch deck options and shortIds
  const [deckOptions, setDeckOptions] = useState<DeckOptionsJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { toast, setToast } = useToast();

  useEffect(() => {
    const fetchDecks = async () => {
      let res;
      try {
        res = await fetch("/decks");
      } catch (e) {
        console.error({ e });
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

      setDeckOptions(parsed);

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
    <div className="w-full">
      <div className="w-full max-h-40 overflow-y-scroll">
        <table className="w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-left">Name</th>
              <th>Likes</th>
            </tr>
          </thead>
          <tbody>
            {deckOptions
              .sort((a, b) => b.likes - a.likes)
              .map((opt) => (
                <tr key={opt.shortId}>
                  <td className="pr-2">
                    <input
                      type="radio"
                      name="deck"
                      value={opt.shortId}
                      checked={props.selectedDeck === opt.shortId}
                      onChange={(e) => {
                        props.setSelectedDeck(e.target.value);
                      }}
                    />
                  </td>
                  <td>{opt.name}</td>
                  <td className="text-center">{opt.likes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
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
