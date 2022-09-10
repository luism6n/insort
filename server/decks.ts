import { Deck } from "../types/types.d";

export const decks: Deck[] = [
  {
    name: "Movies by gross",
    unit: "USD",
    source: "https://en.wikipedia.org/wiki/List_of_highest-grossing_films",
    smallerIs: "cheaper",
    biggerIs: "more expensive",
    cards: [
      { text: "[{Avatar (2009)", value: 2847397339 },
      {
        text: "Avengers: Endgame (2019)",
        value: 2797501328,
      },
      {
        text: "Titanic (1997)",
        value: 2187535296,
      },
      {
        text: "Star Wars: The Force Awakens (2015)",
        value: 2068223624,
      },
      {
        text: "Avengers: Infinity War (2018)",
        value: 2048359754,
      },
      {
        text: "Spider-Man: No Way Home film currently playing (2021)",
        value: 1910675428,
      },
      {
        text: "Jurassic World (2015)",
        value: 1671537444,
      },
      {
        text: "The Lion King (2019)",
        value: 1656943394,
      },
      {
        text: "The Avengers (2012)",
        value: 1518812988,
      },
      {
        text: "Furious 7 (2015)",
        value: 1516045911,
      },
      {
        text: "Frozen II (2019)",
        value: 1450026933,
      },
      {
        text: "Top Gun: Maverick film currently playing (2022)",
        value: 1442880344,
      },
      {
        text: "Avengers: Age of Ultron (2015)",
        value: 1402809540,
      },
      {
        text: "Black Panther (2018)",
        value: 1347280838,
      },
      {
        text: "Harry Potter and the Deathly Hallows – Part 2 (2011)",
        value: 1342025430,
      },
      {
        text: "Star Wars: The Last Jedi (2017)",
        value: 1332539889,
      },
      {
        text: "Jurassic World: Fallen Kingdom (2018)",
        value: 1309484461,
      },
      {
        text: "Frozen (2013)",
        value: 1290000000,
      },
      {
        text: "Beauty and the Beast (2017)",
        value: 1263521126,
      },
      {
        text: "Incredibles 2 (2018)",
        value: 1242805359,
      },
    ],
  },
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
    source: "https://www.worldometers.info/world-population/population-by-country/",
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
  {
    name: "YouTube music videos by views",
    biggerIs: "highest",
    smallerIs: "lowest",
    unit: "billion views",
    source: "https://en.wikipedia.org/wiki/List_of_most-viewed_YouTube_videos",
    cards: [
      {
        text: "Luis Fonsi - Despacito",
        value: 7.96,
      },
      {
        text: "Ed Sheeran - Shape of You",
        value: 5.80,
      },
      {
        text: "Wiz Khalifa - See You Again",
        value: 5.62,
      },
      {
        text: "Uptown Funk - Mark Ronson",
        value: 4.68,
      },
      {
        text: "Psy - Gangnam Style",
        value: 4.53,
      },
      {
        text: "El Chombo - Dame tu Cosita",
        value: 4.05,
      },
      {
        text: "Maroon 5 - Sugar",
        value: 3.75,
      },
      {
        text: "Katy Perry - Roar",
        value: 3.64,
      },      
      {
        text: "OneRepublic - Counting Stars",
        value: 3.64,
      },      
      {
        text: "Alan Walker - Faded",
        value: 3.33,
      },
      {
        text: "Justin Bieber - Sorry",
        value: 3.58,
      },
      {
        text: "Crazy Frog - Axel F",
        value: 3.49,
      },
      {
        text: "Ed Sheeran - Thinking Out Loud",
        value: 3.49,
      },
      {
        text: "Katy Perry - Dark Horse",
        value: 3.34,
      },
      {
        text: "Alan Walker - Faded",
        value: 3.33,
      },
    ],
  },
];