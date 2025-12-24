# crossword-web-app
Crossword Web App - Vocabulary Learning Game
A simple, interactive crossword puzzle web application designed to help users learn English vocabulary through gameplay.
Built entirely with vanilla JavaScript — no third-party libraries or frameworks.

Live Demo

Features

Automatically generated crossword grid from a dictionary of 20 common English words.
Randomly selects 4–6 words for Across and Down directions per game.
Letter pool displaying all required letters — users can drag & drop or click to fill cells.
Clues divided into Across and Down sections, with interactive highlighting (select a word on the grid → clue highlights, and vice versa).
Check Answers button — correct words highlighted in green, incorrect in red.
Reset / New Game button to generate a fresh puzzle.
Fully responsive design — works on desktop, tablet, and mobile (with touch support for drag & drop).
Dictionary stored in external JSON — easy to replace or extend.

Project Requirements (Fully Implemented)
Objective
Build a simple web-based crossword game using approximately 20 common English words, randomly selecting 4–6 words for horizontal and vertical placement, each with a definition as the clue. The goal is to support vocabulary learning through interactive gameplay.
Key Features

Game Interface: Auto-generated grid, letter pool, drag & drop or click-to-fill, clear black cells, responsive layout.
Clues: Divided into Across/Down, definition-based, interactive highlighting.
Answer Checking: Button to validate, green for correct, red for incorrect.

Dictionary (20 words)
The app uses the following words (stored in data/dictionary.json):

origin – the point or place where something begins
vivid – producing powerful and clear images in the mind
tranquil – calm and peaceful
fragment – a small broken piece of something
ceremony – a formal public event
empathy – the ability to understand others' feelings
sustain – to keep something going or maintain it over time
heritage – cultural traditions passed from past generations
ambition – a strong desire to achieve something
prosperity – a state of wealth or success
magnificent – very beautiful or impressive
innovation – a new idea, method, or invention
phenomenon – an observable event or fact
collaborate – to work together on a project
consequence – a result or effect of an action
transmission – the act of sending or passing something
integration – the process of combining parts into a whole
appreciation – recognition of value or quality
vulnerability – the state of being open to harm
misunderstand – to fail to interpret something correctly

Technologies Used

Frontend: HTML, pure CSS, vanilla JavaScript (ES6 modules)
Backend: None — fully client-side
Data: External JSON file (data/dictionary.json)

Additional Requirements Met

Clean and simple UI design
Reset Game button included
Dictionary easily replaceable or extendable

How to Run Locally
1. Clone the repository:
Bash
git clone https://github.com/vkhoa1610/crossword-web-app.git
cd crossword-web-app

2. Open index.html directly in your browser, or serve it locally:
Bash
# Using Python
python3 -m http.server 8080
Then visit: http://localhost:8080
(npx -y sass scss/main.scss css/main.css)

No installation or build steps required!

Project Structure
textcrossword-web-app/
├── css/              # Compiled CSS
├── data/
│   └── dictionary.json   # Vocabulary data (easy to edit)
├── js/
│   ├── models/           # GameState, CellModel, WordModel
│   ├── services/         # DictionaryService, GameController, GridGenerator
│   └── ui/               # Renderers and handlers (Grid, Clue, LetterPool, DragDrop, etc.)
├── scss/                 # Source styles (optional)
├── index.html
└── README.md

Contributing
Feel free to fork and submit pull requests!
Ideas for improvement:

Add difficulty levels
Include sound effects
Support multiple languages
Add timer or score system

Enjoy learning English with this fun crossword game! 🚀