import React, { Fragment, useEffect, useState } from "react";
import { DeckOptionsJSON } from "../types/types";
import { colors } from "./colors";
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
    <Fragment>
      <div className="max-h-40 w-full max-w-sm overflow-y-scroll">
        <table className="w-full">
          <thead>
            <tr
              className="sticky top-0 pr-4"
              style={{
                borderColor: colors.purple,
                backgroundColor: colors.blue,
              }}
            >
              <th></th>
              <th className="text-left">Name</th>
              <th className="pr-4">Likes</th>
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
                  <td className="pr-4 text-center">{opt.likes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {toast}
    </Fragment>
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
