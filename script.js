let playerHP = 100;
let bossHP = 100;
let current = 0;
let backgroundMusicEnabled = true;
let backgroundMusicStarted = false;
let backgroundMusicAudio = null;
let correctSoundAudio = null;
let wrongSoundAudio = null;
let audioContext = null;
let gameStarted = false;
let currentScore = 0;

const questions = [
{
question:"Which keyword is used to create a function in Python?",
answers:["function","def","method","create"],
correct:1
},
{
question:"Which HTML tag is used for the biggest heading?",
answers:["<h1>","<head>","<h6>","<title>"],
correct:0
},
{
question:"DBMS stands for?",
answers:[
"Database Management System",
"Data Build Management System",
"Database Main System",
"Data Backup Management System"
],
correct:0
},
{
question:"Which symbol is used for comments in Python?",
answers:["//","#","<!-- -->","/* */"],
correct:1
},
{
question:"Which language is used to style web pages?",
answers:["Python","CSS","Java","C"],
correct:1
},
{
question:"Which operator is used for comparison?",
answers:["=","==","+","%"],
correct:1
},
{
question:"Which loop repeats until the condition becomes false?",
answers:["for","while","switch","if"],
correct:1
},
{
question:"HTML stands for?",
answers:[
"Hyper Text Markup Language",
"High Text Machine Language",
"Hyper Tool Multi Language",
"Home Text Markup Language"
],
correct:0
},
{
question:"Which database language is used to retrieve data?",
answers:["SQL","Java","Python","C"],
correct:0
},
{
question:"Which company developed Java?",
answers:["Microsoft","Sun Microsystems","Google","Apple"],
correct:1
}
];

function initializeAudio(){
if(!backgroundMusicAudio){
backgroundMusicAudio = document.getElementById("backgroundMusic");
correctSoundAudio = document.getElementById("correctSound");
wrongSoundAudio = document.getElementById("wrongSound");
}

if(backgroundMusicAudio){
backgroundMusicAudio.volume = 0.45;
backgroundMusicAudio.loop = true;
}

if(correctSoundAudio){
correctSoundAudio.volume = 0.9;
}

if(wrongSoundAudio){
wrongSoundAudio.volume = 0.9;
}
}

function startBackgroundMusic(){
initializeAudio();

if(!backgroundMusicAudio || !backgroundMusicEnabled){
return;
}

backgroundMusicAudio.pause();
backgroundMusicAudio.currentTime = 0;

function playMusic(){
const playPromise = backgroundMusicAudio.play();
if(playPromise && typeof playPromise.then === "function"){
playPromise.then(function(){
backgroundMusicStarted = true;
}).catch(function(){
backgroundMusicStarted = false;
});
}
}

if(backgroundMusicAudio.readyState >= 2){
playMusic();
} else {
backgroundMusicAudio.addEventListener("canplaythrough", playMusic, { once: true });
backgroundMusicAudio.load();
}
}

function toggleAudio(){
backgroundMusicEnabled = !backgroundMusicEnabled;
const button = document.getElementById("audioToggle");
if(button){
button.textContent = backgroundMusicEnabled ? "🔊 Music On" : "🔈 Music Off";
}

initializeAudio();

if(!backgroundMusicAudio){
return;
}

if(backgroundMusicEnabled){
if(backgroundMusicStarted){
backgroundMusicAudio.play().catch(function(){});
} else {
startBackgroundMusic();
}
} else {
backgroundMusicAudio.pause();
backgroundMusicStarted = false;
}
}

function getAudioContext(){
if(!audioContext){
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
if(AudioContextClass){
audioContext = new AudioContextClass();
}
}
return audioContext;
}

function playTone(frequency, duration, type, volume){
const context = getAudioContext();
if(!context){
return;
}

try {
context.resume().catch(function(){});
} catch (error) {}

const now = context.currentTime;
const oscillator = context.createOscillator();
const gainNode = context.createGain();

oscillator.type = type;
oscillator.frequency.setValueAtTime(frequency, now);

gainNode.gain.setValueAtTime(0.0001, now);
gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01);
gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

oscillator.connect(gainNode);
gainNode.connect(context.destination);

oscillator.start(now);
oscillator.stop(now + duration + 0.02);
}

function playAttackSound(correct){
initializeAudio();

const audio = correct ? correctSoundAudio : wrongSoundAudio;
const frequency = correct ? 880 : 220;
const duration = correct ? 0.16 : 0.24;
const type = correct ? "square" : "triangle";
const volume = correct ? 0.16 : 0.14;

if(audio){
audio.pause();
audio.currentTime = 0;
const playPromise = audio.play();

if(playPromise && typeof playPromise.then === "function"){
playPromise.then(function(){}).catch(function(){
playTone(frequency, duration, type, volume);
});
} else {
playTone(frequency, duration, type, volume);
}
} else {
playTone(frequency, duration, type, volume);
}
}

function startGame(){
if(!gameStarted){
  gameStarted = true;
  document.getElementById("startMenu").classList.add("hidden");
  document.getElementById("gameShell").classList.remove("hidden");
}

hideVictoryScreen();
playerHP = 100;
bossHP = 100;
current = 0;
currentScore = 0;
updateHealth();
document.getElementById("result").innerHTML="";
initializeAudio();
startBackgroundMusic();
showQuestion();
}

function showQuestion(){

if(playerHP<=0){
document.getElementById("question").innerHTML="💀 GAME OVER";
document.getElementById("answers").innerHTML="";
document.getElementById("result").innerHTML="👹 Dragon Wins!";
return;
}

if(bossHP<=0){
document.getElementById("question").innerHTML="🏆 YOU WIN!";
document.getElementById("answers").innerHTML="";
document.getElementById("result").innerHTML="🎉 Congratulations! Dragon Defeated!";
showVictoryScreen();
return;
}

if(current>=questions.length){
current=0;
}

let q=questions[current];

document.getElementById("question").innerHTML=
"Question "+(current+1)+" / "+questions.length+"<br><br>"+q.question;

let html="";

const letters=["A","B","C","D"];

for(let i=0;i<q.answers.length;i++){

let answer=q.answers[i]
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;");

html += `
<button class="answerBtn" onclick="checkAnswer(${i})">
${letters[i]}. ${answer}
</button>
`;

}

document.getElementById("answers").innerHTML=html;

}

function checkAnswer(choice){
initializeAudio();

if(choice===questions[current].correct){

bossHP -=20;
playAttackSound(true);
alert("⚔ Correct Answer!\nDragon loses 20 HP.");

}
else{

playerHP -=20;
playAttackSound(false);
alert("🔥 Wrong Answer!\nDragon attacks you.");

}

updateHealth();

current++;

showQuestion();

}

function updateHealth(){

document.getElementById("playerHealth").style.width=playerHP+"%";
document.getElementById("bossHealth").style.width=bossHP+"%";

document.getElementById("playerHP").innerHTML="❤️ "+playerHP+" HP";
document.getElementById("bossHP").innerHTML="❤️ "+bossHP+" HP";

}

function restartGame(){
startGame();
}

function calculateScore(){
const answeredCount = Math.min(current, questions.length);
return Math.max(0, playerHP * 10 + bossHP * 2 + (questions.length - answeredCount) * 6);
}

function playVictoryMusic(){
const context = getAudioContext();
if(!context){
return;
}

try {
context.resume().catch(function(){});
} catch (error) {}

const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
const now = context.currentTime;
const gainNode = context.createGain();

gainNode.gain.setValueAtTime(0.0001, now);
gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
gainNode.connect(context.destination);

melody.forEach(function(freq, index){
const oscillator = context.createOscillator();
oscillator.type = "triangle";
oscillator.frequency.setValueAtTime(freq, now + index * 0.3);
oscillator.connect(gainNode);
oscillator.start(now + index * 0.3);
oscillator.stop(now + index * 0.3 + 0.24);
});
}

function createCelebrationParticles(){
const container = document.getElementById("victoryParticles");
if(!container){
return;
}

container.innerHTML = "";

const colors = ["#fbbf24", "#fb7185", "#7dd3fc", "#34d399", "#a78bfa", "#f97316"];

for(let i=0;i<40;i++){
const piece = document.createElement("span");
piece.className = "confetti-piece";
piece.style.left = Math.random() * 100 + "%";
piece.style.top = Math.random() * 20 + "%";
piece.style.background = colors[Math.floor(Math.random() * colors.length)];
piece.style.setProperty("--drift-x", ((Math.random() - 0.5) * 240) + "px");
piece.style.animationDelay = Math.random() * 0.2 + "s";
container.appendChild(piece);
}

for(let i=0;i<8;i++){
const burst = document.createElement("span");
burst.className = "firework-dot";
burst.style.left = (20 + Math.random() * 60) + "%";
burst.style.top = (15 + Math.random() * 50) + "%";
burst.style.background = colors[Math.floor(Math.random() * colors.length)];
burst.style.setProperty("--burst-x", ((Math.random() - 0.5) * 220) + "px");
burst.style.setProperty("--burst-y", ((Math.random() - 0.5) * 220) + "px");
burst.style.animationDelay = Math.random() * 0.1 + "s";
container.appendChild(burst);
}
}

function showVictoryScreen(){
const overlay = document.getElementById("victoryOverlay");
const scoreText = document.getElementById("finalScoreText");
if(!overlay || !scoreText){
return;
}

currentScore = calculateScore();
scoreText.textContent = "Final Score: " + currentScore;
overlay.classList.remove("hidden");
createCelebrationParticles();

if(backgroundMusicAudio){
backgroundMusicAudio.pause();
backgroundMusicStarted = false;
}

playVictoryMusic();
}

function hideVictoryScreen(){
const overlay = document.getElementById("victoryOverlay");
if(overlay){
overlay.classList.add("hidden");
}
}

function openInstructions(){
document.getElementById("instructionsModal").classList.remove("hidden");
}

function closeInstructions(){
document.getElementById("instructionsModal").classList.add("hidden");
}

function showMainMenu(){
gameStarted = false;
hideVictoryScreen();
document.getElementById("startMenu").classList.remove("hidden");
document.getElementById("gameShell").classList.add("hidden");
}

function exitGame(){
window.close();
}

document.addEventListener("DOMContentLoaded", function(){
const playButton = document.getElementById("playBtn");
const howToPlayButton = document.getElementById("howToPlayBtn");
const exitButton = document.getElementById("exitBtn");
const closeModalButton = document.getElementById("closeModalBtn");
const playAgainButton = document.getElementById("playAgainBtn");
const mainMenuButton = document.getElementById("mainMenuBtn");

if(playButton){
playButton.addEventListener("click", function(){
startGame();
});
}

if(howToPlayButton){
howToPlayButton.addEventListener("click", openInstructions);
}

if(exitButton){
exitButton.addEventListener("click", exitGame);
}

if(closeModalButton){
closeModalButton.addEventListener("click", closeInstructions);
}

if(playAgainButton){
playAgainButton.addEventListener("click", function(){
startGame();
});
}

if(mainMenuButton){
mainMenuButton.addEventListener("click", function(){
showMainMenu();
});
}
});