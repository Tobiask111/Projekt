    //This array holds all of the questions in the quiz. Every object contains a question, an array of answers where one of them is true and an explanation.

const questions = [

         {
        question: "Hvad er forskellen på import og eksport?",
        answers: [
            { text: "Import er salg af varer til udlandet, eksport er køb fra udlandet", correct: false},
            { text: "Import og eksport er det samme", correct: false},
            { text: "Import handler kun om tjenester", correct: false},
            { text: "Import er køb af varer fra udlandet, eksport er salg af varer til udlandet ", correct: true}
        ],
        explanation: "Import dækker over varer og tjenester, vi køber fra udlandet, mens eksport er det, vi sælger til udlandet. Det er grundlæggende for al udenrigshandel."
    },
    {
        question: "Hvem er Danmarks største handelspartner ifm. eksport i februar 2025?",
        answers: [
            { text: "Kina", correct: false},
            { text: "USA", correct: true},
            { text: "Tyskland", correct: false},
            { text: "Sverige", correct: false}
        ],
        explanation: "Ifølge Danmarks Statistik eksporterede Danmark for 27152.7 millioner kr. i varer og ydelser til USA i februar 2025."
    },
    {
        question: "Hvem er Danmarks største handelspartner ifm. import i februar 2025?",
        answers: [
            { text: "Sverige", correct: false},
            { text: "Norge", correct: false},
            { text: "Storbritanien", correct: false},
            { text: "Tyskland", correct: true}
        ],
         explanation: "Ifølge Danmarks Statistik importerede Danmark for 19439.5 millioner kr. i varer og ydelser fra Tyskland i februar 2025."
    },
    {
        question: "Hvilken af følgende varer er blandt Danmarks største eksportprodukter?",
        answers: [
            { text: "Tekstiler", correct: false},
            { text: "Tøj", correct: false},
            { text: "Medicinalvarer", correct: true},
            { text: "Landbrugsprodukter", correct: false}
        ],
        explanation: "Ifølge Danmarks Statistik er medicinalvarer blandt de største varegrupper i dansk eksport. Medicinalindustrien har en betydelig vægt i den samlede industri, og eksporten af medicinalvarer er steget kraftigt i de senere år."
    },
        {
         question: "Hvilket land eksporterede Danmark flest levende dyr til i 2021",
        answers: [
            { text: "Rusland", correct: false},
            { text: "USA", correct: false},
            { text: "Tyskland", correct: true},
            { text: "Polen", correct: false}
        ],
        explanation: "Ifølge Danmarks Statistik eksporterede Danmark for 3.376.846.000 kr levende dyr til Tyskland i 2021"
    }
];

//These lines are refering to the HTML elements that will be manipulated.

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

//This tracks the question the user is currently on and how many correct answers the user has gotten.

let currentQuestionIndex = 0;
let score = 0;

//Shows the quiz from the beginning, so the score and question index is reset. Sets the text for the next button.

function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Næste spørgsmål";
    showQuestion();
}

//Shows current question and clears the previous answer and explanation. And the current question is fetched 
//using currentQuestionIndex. It also shows the question number and text.

function showQuestion(){
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

//Makes a button for every answer option. If the answer is correct, the data gets stored using dataset.correct. 
//Also adds a click listener to the handle selection.

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if(answer.correct){
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

//This function hides the next button until an answer has been given. It clears the old answer buttons from 
//previous question, and hides the explanation text.

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
     const explanationElement = document.getElementById("explanation");
    explanationElement.innerHTML = "";
    explanationElement.style.display = "none";

}

//When an answer button is clicked, it checks if the answer is correct or incorrect. All the other buttons gets disabled when an 
//answer has been give, because you only have on try. Then the nextbutton gets shown and the explanation.
function selectAnswer(e){
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if(isCorrect){
        selectedBtn.classList.add("correct");
        score++;
    }else{
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";

    const explanationElement = document.getElementById("explanation");
explanationElement.innerHTML = questions[currentQuestionIndex].explanation;
explanationElement.style.display = "block";
}

//When the quiz is over the score gets shown. It display how many correct answers the user got out of the total questions. 
//You also get links referred to where the information is from. Then a try again button appers to restart the quiz.

function showScore() {
    resetState();
    questionElement.innerHTML = `   
        <p><strong>Du svarede rigtigt på ${score} ud af ${questions.length}!</strong></p>
        <p style="margin-top: 1em;">Følg disse links for at blive klogere på emnet:</p>
        <p>
            <a href="https://www.dst.dk/en/Statistik/emner/oekonomi/betalingsbalance-og-udenrigshandel/import-og-eksport-af-varer-og-tjenester" target="_blank">Import og eksport af varer og tjenester</a><br>
            <a href="https://www.dst.dk/da/Statistik/emner/oekonomi/betalingsbalance-og-udenrigshandel/detaljeret-import-og-eksport" target="_blank">Detaljeret import og eksport</a>
        </p>
    `;
    nextButton.innerHTML = "Prøv igen";
    nextButton.style.display = "block";
}

//This function moves to the next question. If there are no more question, then the score appears.

function handleNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showScore();
    }
}

//This adds a click to the nextbutton. When it is clicked it goes to the next question if there are more questions. 
//if there are no more questions, it restarts the quiz.

nextButton.addEventListener("click", () =>{
    if(currentQuestionIndex < questions.length){
        handleNextButton();
    }else{
        startQuiz();
    }
});

//This just makes the quiz automatically start when the page gets loaded.

startQuiz();