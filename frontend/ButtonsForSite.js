//finds the html element with the id "worldmapknap" and adds the addeventlistener to listen for when the button is pressed
document.getElementById("worldmapknap").addEventListener("click", function () {
  const sektion = document.getElementById("tagmigtilworldmap"); //saves the element with the id "tagmigtilworldmap" to the varible sektion
  sektion.scrollIntoView({ behavior: "smooth" }); //makes it so that when pressed it scrolls down to the corresponding section after. And it does it smoothly instead of jumping right to it
});

document.getElementById("barchartknap").addEventListener("click", function () {
  const sektion = document.getElementById("tagmigtilbarchart");
  sektion.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("quizknap").addEventListener("click", function () {
  const sektion = document.getElementById("tagmigtilquiz");
  sektion.scrollIntoView({ behavior: "smooth" });
});