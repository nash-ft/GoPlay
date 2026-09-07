const quotes = [
    "Never say never because limits are often just an illusion.",
    "“Hard work beats talent when talent doesn't work hard.” – Kevin Durant",
    "“Excellence is not a singular act but a habit. You are what you do repeatedly.” – Shaquille O'Neal",
    "“I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'” – Muhammad Ali",
    "“The only place success comes before work is in the dictionary.” – Vince Lombardi",
    "“A winner is a person that gets up one more time than she is knocked down.” – Mia Hamm",
    "“I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times, I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.” – Michael Jordan",
    "“Pain is temporary. Quitting lasts forever.” – Lance Armstrong",
    "“Champions aren't made in gyms. Champions are made from something they have deep inside of them; a desire, a dream, a vision.” – Muhammad Ali",
    "“You can't put a limit on anything. The more you dream, the farther you get.” – Michael Phelps",
    "“Set your goals high, and don't stop until you get there.” – Bo Jackson",
    "“The best motivation always comes from within.” – Michael Johnson",
    "“Competitive sports are played mainly on a five-and-a-half-inch court — the space between your ears.” – Bobby Knight",
    "“You miss 100% of the shots you don't take.” – Wayne Gretzky"

];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

document.getElementById('quote').textContent = randomQuote;
