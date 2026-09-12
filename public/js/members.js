const quotes = [
    "Never say never because limits are often just an illusion.",
    "“Hard work beats talent when talent doesn't work hard.” – Kevin Durant",
    "“Excellence is not a singular act but a habit. You are what you do repeatedly.” – Shaquille O'Neal",
    "“I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'” – Muhammad Ali",
    "“The only place success comes before work is in the dictionary.” – Vince Lombardi",
    "“A winner is a person that gets up one more time than she is knocked down.” – Mia Hamm",
    "“Pain is temporary. Quitting lasts forever.” – Lance Armstrong",
    "“You can't put a limit on anything. The more you dream, the farther you get.” – Michael Phelps",
    "“Set your goals high, and don't stop until you get there.” – Bo Jackson",
    "“The best motivation always comes from within.” – Michael Johnson",
    "“Competitive sports are played mainly on a five-and-a-half-inch court — the space between your ears.” – Bobby Knight",
    "“You miss 100% of the shots you don't take.” – Wayne Gretzky"

];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

document.getElementById('quote').textContent = randomQuote;
