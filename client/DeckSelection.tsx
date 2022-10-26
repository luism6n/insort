import React, { Fragment, useEffect, useState } from "react";
import { Deck, DeckOptionsJSON } from "../types/types";
import { colors } from "./colors";
import { Select, Toast } from "./designSystem";
import { useToast } from "./useToast";
// @ts-ignore
import heartIcon from "../assets/heart_light.png";
import { ev } from "./analytics";

export function DeckSelection(props: {
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}) {
  // create loader and fetch deck options and shortIds
  const [deckOptions, setDeckOptions] = useState<DeckOptionsJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState("newer");

  console.log({ deckOptions });

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

      setDeckOptions(
        parsed.map((o: any) => ({
          ...o,
          createdAt: new Date(Date.parse(o.createdAt)),
        }))
      );

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

  function sortDecks(a: DeckOptionsJSON, b: DeckOptionsJSON) {
    if (order === "more likes") {
      return b.likes - a.likes;
    } else if (order === "newer") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else if (order === "smaller") {
      return a.size - b.size;
    } else if (order === "bigger") {
      return b.size - a.size;
    } else {
      return b.name.localeCompare(a.name);
    }
  }

  function getOptValueForOrdering(opt: DeckOptionsJSON, order: string) {
    if (
      order === "more likes" ||
      order === "newer" ||
      order === "alphabetical"
    ) {
      return opt.likes;
    } else {
      return opt.size;
    }
  }

  return (
    <Fragment>
      {/* select deck options sort order */}
      <p className="mb-2">
        Sort decks by{" "}
        <select
          value={order}
          onChange={(e) => {
            ev("sort deck by " + e.target.value);
            setOrder(e.target.value);
          }}
        >
          <option value="more likes">more likes</option>
          <option value="smaller">smaller</option>
          <option value="bigger">bigger</option>
          <option value="newer">newer</option>
          <option value="alphabetical">name</option>
        </select>
      </p>

      <div className="max-h-80 w-full max-w-sm overflow-y-scroll mb-4">
        <table className="w-full bg-white">
          <thead>
            <tr
              className="sticky top-0"
              style={{ backgroundColor: colors.yellow }}
            >
              <th></th>
              <th className="p-1 text-left">Name</th>
              <th className="p-1 pr-4">
                <div className="flex justify-center items-baseline h-full">
                  {order === "more likes" ||
                  order === "alphabetical" ||
                  order === "newer" ? (
                    <img className="h-4" src={heartIcon} alt="likes" />
                  ) : (
                    "size"
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {deckOptions.sort(sortDecks).map((opt) => (
              <tr key={opt.shortId}>
                <td className="p-1 pr-4 pl-4">
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
                <td className="p-1">{opt.name}</td>
                <td className="p-1 pr-4 text-center">
                  {getOptValueForOrdering(opt, order)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast}
    </Fragment>
  );
}
