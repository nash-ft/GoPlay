const quotes = [
    "You miss 100% of the shots you don't take.",
    "Hard work beats talent when talent doesn't work hard.",
    "Never say never because limits are often just an illusion."
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

document.getElementById('quote').textContent = randomQuote;
