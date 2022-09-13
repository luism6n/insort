import { Deck } from "../types/types.d";

export const decks: Deck[] = [
  {
    name: "Movies by gross",
    shortId: "moviesgross",
    unit: "USD",
    source: "https://en.wikipedia.org/wiki/List_of_highest-grossing_films",
    smallerMeans: "lower",
    biggerMeans: "higher",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 2,
    },
    cards: [
      { text: "Avatar (2009)", value: 2847397339 },
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
        text: "Spider-Man: No Way Home (2021)",
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
        text: "Top Gun: Maverick (2022)",
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
        text: "Harry Potter and the Deathly Hallows - Part 2 (2011)",
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
    name: "Albums by copies sold",
    shortId: "albumscopies",
    unit: "copies",
    source: "http://google.com",
    smallerMeans: "less",
    biggerMeans: "more",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 2,
    },
    cards: [
      {
        text: "Back in Black - AC/DC",
        value: 30100000,
      },
      {
        text: "Thriller - Michael Jackson",
        value: 50200000,
      },
      {
        text: "The Bodyguard - Whitney Houston / various artists",
        value: 28700000,
      },
      {
        text: "The Dark Side of the Moon - Pink Floyd",
        value: 24800000,
      },
    ],
  },
  {
    name: "Planets by distance from Sun",
    shortId: "planets-by-distance",
    unit: "UA",
    smallerMeans: "closer",
    biggerMeans: "farther",
    source: "http://google.com",
    creatorCredit: "github.com/luism6n",
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
    shortId: "countrypop",
    biggerMeans: "more",
    smallerMeans: "less",
    unit: "people",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 2,
    },
    source:
      "https://www.worldometers.info/world-population/population-by-country/",
    cards: [
      {
        text: "China",
        value: 1394000000,
      },
      {
        text: "India",
        value: 1326000000,
      },
      {
        text: "United States",
        value: 332000000,
      },
      {
        text: "Indonesia",
        value: 267000000,
      },
      {
        text: "Pakistan",
        value: 233000000,
      },
      {
        text: "Nigeria",
        value: 214000000,
      },
      {
        text: "Brazil",
        value: 211000000,
      },
      {
        text: "Bangladesh",
        value: 162000000,
      },
      {
        text: "Russia",
        value: 141000000,
      },
      {
        text: "Mexico",
        value: 128000000,
      },
      {
        text: "Japan",
        value: 125000000,
      },
      {
        text: "Philippines",
        value: 109000000,
      },
      {
        text: "Ethiopia",
        value: 108000000,
      },
      {
        text: "Egypt",
        value: 104000000,
      },
      {
        text: "Democratic Republic of the Congo",
        value: 101000000,
      },
      {
        text: "Vietnam",
        value: 98000000,
      },
      {
        text: "Iran",
        value: 84000000,
      },
      {
        text: "Turkey",
        value: 82000000,
      },
      {
        text: "Germany",
        value: 80000000,
      },
      {
        text: "Thailand",
        value: 68000000,
      },
    ],
  },
  {
    name: "Programming languages by year of invention",
    shortId: "plangbyyear",
    biggerMeans: "newer",
    smallerMeans: "older",
    unit: "",
    numFormatOptions: {
      useGrouping: false,
    },
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
    shortId: "ytmusicviews",
    biggerMeans: "highest",
    smallerMeans: "lowest",
    unit: "views",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 2,
    },
    source: "https://en.wikipedia.org/wiki/List_of_most-viewed_YouTube_videos",
    cards: [
      {
        text: "Luis Fonsi - Despacito",
        value: 7960000000,
      },
      {
        text: "Ed Sheeran - Shape of You",
        value: 5800000000,
      },
      {
        text: "Wiz Khalifa - See You Again",
        value: 5620000000,
      },
      {
        text: "Mark Ronson - Uptown Funk",
        value: 4680000000,
      },
      {
        text: "Psy - Gangnam Style",
        value: 4530000000,
      },
      {
        text: "El Chombo - Dame Tu Cosita",
        value: 4050000000,
      },
      {
        text: "Maroon 5 - Sugar",
        value: 3750000000,
      },
      {
        text: "Katy Perry - Roar",
        value: 3640000000,
      },
      {
        text: "OneRepublic - Counting Stars",
        value: 3640000000,
      },
      {
        text: "Justin Bieber - Sorry",
        value: 3580000000,
      },
      {
        text: "Crazy Frog - Axel F",
        value: 3490000000,
      },
      {
        text: "Ed Sheeran - Thinking Out Loud",
        value: 3490000000,
      },
      {
        text: "Katy Perry - Dark Horse",
        value: 3340000000,
      },
      {
        text: "Maroon 5 - Girls Like You",
        value: 3330000000,
      },
      {
        text: "Passenger - Let Her Go",
        value: 3290000000,
      },
    ],
  },
  {
    name: "Planets by radius size",
    shortId: "planetsize",
    biggerMeans: "bigger",
    smallerMeans: "smaller",
    unit: "km",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 1,
    },
    source: "https://solarsystem.nasa.gov/resources/686/solar-system-sizes/",
    cards: [
      {
        text: "Mercury",
        value: 2440,
      },
      {
        text: "Venus",
        value: 6052,
      },
      {
        text: "Earth",
        value: 6371,
      },
      {
        text: "Mars",
        value: 3390,
      },
      {
        text: "Jupiter",
        value: 69911,
      },
      {
        text: "Saturn",
        value: 58232,
      },
      {
        text: "Uranus",
        value: 25362,
      },
      {
        text: "Neptune",
        value: 24622,
      },
    ],
  },
  {
    name: "Actors by number of Oscar nominations",
    shortId: "actorsnominations",
    biggerMeans: "more",
    smallerMeans: "less",
    unit: "nominations",
    numFormatOptions: {
      notation: "compact",
      maximumFractionDigits: 1,
    },
    source:
      "https://en.wikipedia.org/wiki/List_of_actors_with_two_or_more_Academy_Awards_in_acting_categories",
    cards: [
      {
        text: "Meryl Streep",
        value: 21,
      },
      {
        text: "Katharine Hepburn",
        value: 12,
      },
      {
        text: "Jack Nicholson",
        value: 12,
      },
      {
        text: "Bette Davis",
        value: 10,
      },
      {
        text: "Spencer Tracy",
        value: 9,
      },
      {
        text: "Denzel Washington",
        value: 9,
      },
      {
        text: "Marlon Brando",
        value: 8,
      },
      {
        text: "Jack Lemmon",
        value: 8,
      },
      {
        text: "Ingrid Bergman",
        value: 7,
      },
      {
        text: "Cate Blanchett",
        value: 7,
      },
      {
        text: "Robert De Niro",
        value: 7,
      },
      {
        text: "Jane Fonda",
        value: 7,
      },
      {
        text: "Dustin Hoffman",
        value: 7,
      },
      {
        text: "Daniel Day-Lewis",
        value: 6,
      },
      {
        text: "Frances McDormand",
        value: 6,
      },
      {
        text: "Michael Caine",
        value: 6,
      },
      {
        text: "Tom Hanks",
        value: 6,
      },
      {
        text: "Anthony Hopkins",
        value: 6,
      },
      {
        text: "Jessica Lange",
        value: 6,
      },
      {
        text: "Maggie Smith",
        value: 6,
      },
    ],
  },
];
