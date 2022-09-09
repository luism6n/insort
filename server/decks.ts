import { Deck } from "../types/types.d";

export const decks: Deck[] = [
  {
    name: "Albums of all time by copies sold",
    unit: "M of copies",
    source: "http://google.com",
    smallerIs: "less",
    biggerIs: "more",
    cards: [
      {
        text: "Back in Black - AC/DC",
        value: 30.1,
      },
      {
        text: "Thriller - Michael Jackson",
        value: 50.2,
      },
      {
        text: "The Bodyguard - Whitney Houston / various artists",
        value: 28.7,
      },
      {
        text: "The Dark Side of the Moon - Pink Floyd",
        value: 24.8,
      },
    ],
  },
  {
    name: "Planets by distance from Sun",
    unit: "UA",
    smallerIs: "closer",
    biggerIs: "farther",
    source: "http://google.com",
    cards: [
      { text: "Mercury", value: 0.39 },
      { text: "Venus", value: 0.72 },
      { text: "Earth", value: 1 },
      { text: "Mars", value: 1.52 },
      { text: "Jupiter", value: 5.2 },
      { text: "Saturn", value: 9.54 },
      { text: "Uranus", value: 19.2 },
      { text: "Neptune", value: 30.06 },
    ],
  },
  {
    name: "Countries by population",
    biggerIs: "more",
    smallerIs: "less",
    unit: "M of people",
    source: "http://google.com",
    cards: [
      {
        text: "China",
        value: 1394,
      },
      {
        text: "India",
        value: 1326,
      },
      {
        text: "United States",
        value: 332,
      },
      {
        text: "Indonesia",
        value: 267,
      },
      {
        text: "Pakistan",
        value: 233,
      },
      {
        text: "Nigeria",
        value: 214,
      },
      {
        text: "Brazil",
        value: 211,
      },
      {
        text: "Bangladesh",
        value: 162,
      },
      {
        text: "Russia",
        value: 141,
      },
      {
        text: "Mexico",
        value: 128,
      },
      {
        text: "Japan",
        value: 125,
      },
      {
        text: "Philippines",
        value: 109,
      },
      {
        text: "Ethiopia",
        value: 108,
      },
      {
        text: "Egypt",
        value: 104,
      },
      {
        text: "Democratic Republic of the Congo",
        value: 101,
      },
      {
        text: "Vietnam",
        value: 98,
      },
      {
        text: "Iran",
        value: 84,
      },
      {
        text: "Turkey",
        value: 82,
      },
      {
        text: "Germany",
        value: 80,
      },
      {
        text: "Thailand",
        value: 68,
      },
    ],
  },
  {
    name: "Programming languages by year of invention",
    biggerIs: "newer",
    smallerIs: "older",
    unit: "year",
    source: "https://en.wikipedia.org/wiki/History_of_programming_languages",
    cards: [
      {
        text: "C",
        value: 1972,
      },
      {
        text: "SQL",
        value: 1978,
      },
      {
        text: "C++",
        value: 1980,
      },
      {
        text: "Python",
        value: 1990,
      },
      {
        text: "Java, JavaScript",
        value: 1995,
      },
      {
        text: "C#",
        value: 2001,
      },
      {
        text: "Go",
        value: 2009,
      },
      {
        text: "TypeScript",
        value: 2012,
      },
    ],
  },
];
