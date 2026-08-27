const questions = [
    {
        id: 1,
        question: "Which sport is played at Wimbledon?",
        options: [
            "Tennis",
            "Golf",
            "Cricket",
            "Rugby"
        ],
        answer: "Tennis"
    },

    {
        id: 2,
        question: "How many Ballon d'Or awards has Cristiano Ronaldo won?",
        options: [
            "3",
            "5",
            "7",
            "8"
        ],
        answer: "5"
    },

    {
        id: 3,
        question: "Which country has won the most FIFA World Cups?",
        options: [
            "Germany",
            "Brazil",
            "Argentina",
            "France"
        ],
        answer: "Brazil"
    },

    {
        id: 4,
        question: "Which country won the first ever FIFA World Cup in 1930?",
        options: [
            "Brazil",
            "Uruguay",
            "Argentina",
            "France"
        ],
        answer: "Uruguay"
    },

    {
        id: 5,
        question: "Which team has won the most World Series titles in MLB history?",
        options: [
            "St. Louis Cardinals",
            "Boston Red Sox",
            "New York Yankees",
            "Los Angeles Dodgers"
        ],
        answer: "New York Yankees"
    },

    {
        id: 6,
        question: "How many rings are on the Olympic flag?",
        options: [
            "4",
            "7",
            "5",
            "6"
        ],
        answer: "5"
    },

    {
        id: 7,
        question: "Which sprinter holds the world records in both the 100m and 200m?",
        options: [
            "Usain Bolt",
            "Tyson Gay",
            "Justin Gatlin",
            "Yohan Blake"
        ],
        answer: "Usain Bolt"
    },

    {
        id: 8,
        question: "How many holes are played in a standard round of golf?",
        options: [
            "9",
            "18",
            "16",
            "20"
        ],
        answer: "18"
    },

    {
        id: 9,
        question: "Which quarterback holds the record for the most Super Bowl wins?",
        options: [
            "Tom Brady",
            "Joe Montana",
            "Terry Bradshaw",
            "Patrick Mahomes"
        ],
        answer: "Tom Brady"
    },

    {
        id: 10,
        question: "Who is the NBA's all-time leading scorer (regular season, as of 2024)?",
        options: [
            "Kareem Abdul-Jabbar",
            "Karl Malone",
            "Kobe Bryant",
            "Lebron James"
        ],
        answer: "Lebron James"
    },

    {
        id: 11,
        question: "Which team did Michael Jordan win all six of his NBA championships with?",
        options: [
            "Chicago Bulls",
            "Washington Wizards",
            "Los Angeles Lakers",
            "Detroit Pistons"
        ],
        answer: "Chicago Bulls"
    },

    {
        id: 12,
        question: "Which football/soccer player is also known as 'Donatello'?",
        options: [
            "Kylian Mbappe",
            "Desire Doue",
            "Erling Haaland",
            "Ryan Cherki"
        ],
        answer: "Kylian Mbappe"
    },

    {
        id: 13,
        question: "Who became the youngest male player to reach the World No. 1 in the ATP rankings in 2022?",
        options: [
            "Danil Medvedev",
            "Carlos Alcaraz",
            "Stefanos Tsitsipas",
            "Jannik Sinner"
        ],
        answer: "Carlos Alcaraz"
    },

    {
        id: 14,
        question: "Which sport uses a 'shuttlecock' instead of a ball?",
        options: [
            "Badminton",
            "Squash",
            "Table tennis",
            "Pickleball"
        ],
        answer: "Badminton"
    },

    {
        id: 15,
        question: "In Formula 1, what colour flag is waved to signal the end of a race?",
        options: [
            "Red",
            "Yellow",
            "Chequered (black and white)",
            "White"
        ],
        answer: "Chequered (black and white)"
    },

    {
        id: 16,
        question: "Which country has won the men's Rugby World Cup the most times, tied with New Zealand?",
        options: [
            "Australia",
            "England",
            "South Africa",
            "France"
        ],
        answer: "South Africa"
    },

    {
        id: 17,
        question: "How many players are on each side in a doubles tennis match?",
        options: [
            "2",
            "1",
            "3",
            "4"
        ],
        answer: "2"
    },

    {
        id: 18,
        question: "Which player is named \"The Greek Freak\"?",
        options: [
            "Nikola Jokic",
            "Giannis Antetokounmpo",
            "Luka Doncic",
            "Joel Embiid"
        ],
        answer: "Giannis Antetokounmpo"
    },

    {
        id: 19,
        question: "Which sport is known as \"The beautiful game\"?",
        options: [
            "Soccer",
            "Rugby",
            "Tennis",
            "Basketball"
        ],
        answer: "Soccer"
    },

    {
        id: 20,
        question: "Which legendary motogp racer, famously known as \"The Doctor\", secured nine World Championships in his career?",
        options: [
            "Marc Marquez",
            "Valentino Rossi",
            "Jorge Lorenzo",
            "Casey Stoner"
        ],
        answer: "Valentino Rossi"
    },

    {
        id: 21,
        question: "How many players from one team are on the court at a time in basketball?",
        options: [
            "6",
            "7",
            "5",
            "4"
        ],
        answer: "5"
    },

    {
        id: 22,
        question: "Who has won the most Ballon d'Or awards?",
        options: [
            "Cristiano Ronaldo",
            "Zinedine Zidane",
            "Lionel Messi",
            "Ronaldinho"
        ],
        answer: "Lionel Messi"
    },

    {
        id: 23,
        question: "How many Grand Slam tournaments are there in professional tennis each year?",
        options: [
            "4",
            "5",
            "3",
            "6"
        ],
        answer: "4"
    },

    {
        id: 24,
        question: "What sport uses the terms \"birdie,\" \"eagle,\" and \"bogey\"?",
        options: [
            "Tennis",
            "Golf",
            "Cricket",
            "Water Polo"
        ],
        answer: "Golf"
    },

    {
        id: 25,
        question: "Which trophy is awarded to the winner of thr NHL playoffs?",
        options: [
            "Stanley Cup",
            "Grey Cup",
            "Lombardi Trophy",
            "Commissioner's Trophy"
        ],
        answer: "Stanley Cup"
    },

    {
        id: 26,
        question: "Which country won the FIFA World Cup in 2018?",
        options: [
            "Germany",
            "France",
            "Argentina",
            "Spain"
        ],
        answer: "France"
    },

    {
        id: 27,
        question: "In tennis, what is the term for a score of 40-40? ",
        options: [
            "Advantage",
            "Deuce",
            "Love",
            "Break point"
        ],
        answer: "Deuce"
    },

    {
        id: 28,
        question: "Which sport features the Tour de France?",
        options: [
            "Cycling",
            "Rowing",
            "Athletics",
            "Formula 1"
        ],
        answer: "Cycling"
    }
];

module.exports = questions;