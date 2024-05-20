//Getting Elements from HTML
const question = document.getElementById("question");
const choices = Array.from (document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score"); 
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");

//VARIABLES USED IN STARTGAME FUNCTION
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];


let questions = [];

//Fetch API
fetch(
    "https://opentdb.com/api.php?amount=10&category=30&difficulty=easy&type=multiple"
)
    .then((res) => {
    return res.json();
})
.then(( loadedQuestions) => {
    questions = loadedQuestions.results.map( loadedQuestion => {
        const formattedQuestion = {
            question: loadedQuestion.question
        };

        const answerChoices = [...loadedQuestion.incorrect_answers];
        formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
        answerChoices.splice(
            formattedQuestion.answer -1, 
            0,
            loadedQuestion.correct_answer
        );
        
        answerChoices.forEach((choice, index) => {
            formattedQuestion["choice" + (index + 1)] = choice;
        });

        return formattedQuestion;
    });

   startGame();
})
.catch( err => {
    console.error(err);
});



//CONSTANTS FOR HUD 
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

//FUNCTION FOR START OF GAME
startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

//FUNCTION FOR NEW QUESTION OR END OF GAME 
getNewQuestion = () => {
    if(availableQuestions.length === 0 || questionCounter >=MAX_QUESTIONS){
        localStorage.setItem("mostRecentScore", score)
        //GO TO THE END PAGE
        return window.location.assign("/end.html");
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`

    //UPDATE THE PROGRESS BAR
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) *100}%`

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number']
        choice.innerText = currentQuestion['choice' + number]
    });

    availableQuestions.splice(questionIndex, 1)
    acceptingAnswers = true;
};

//HANDLING ANSWER CLICKS
choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswers) return;

//finding which choice was clicked
        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];
//check if clicked choice is correct
        const classToApply =
         selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
        
        if(classToApply === "correct") {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();

        }, 1000);
        
       
    });
});

//INCREMENTING SCORE
incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};




