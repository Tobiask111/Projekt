//Drawing area for the barchart. Also uses padding to create margins between the bars and the axis.
const w = 1000;
const h = 500;
const padding = 10;
const axisPadding = 70;

//We use let here to create an empty array where we can place data in later.
let dataset = [];

//A variable that tracks the currently selected metric (e.g., exports, imports, or total).
let currentMetric = "total";

//A variable that is needed to change the color of the bars based on their values. 
let colorScale = null; // We use null because the color scale is not yet created

// Fetches data
function loadVigtigisteHandelspartnere() {
  fetch("/api/VIP") //Gets the data from the server
    .then(response => response.json()) //converts it into json
    .then(data => {
      dataset = processData(data); //Processes the raw data
      dataset.sort((a, b) => b.total - a.total); //sorts the data descending
      initialize(dataset); //runs the initialize function
    });
}
//calls the function
loadVigtigisteHandelspartnere();

//Adds an SVG element to the page with defined width and height.
const svg = d3.select("#barChart").append("svg")
  .attr("width", w)
  .attr("height", h);

//Creates the body and adds a div element with the id "tekstboksBarchart"
d3.select("body").append("div")
  .attr("id", "tekstboksBarchart");

//Adds a text svg element 
const sortingText = svg.append("text")

//Places the horizontal part of the text in the middle of the svg element 
  .attr("x", w / 2) 

  //Places the vertical part of the text a little down from the top
  .attr("y", padding + 30)

  //Adds the text "samlet"
  .text("Sortering: Samlet");

 // the x and y scale places the data on the x and y axes
 // we use null because the avlues are created at a later point 
let yScale = null;
let xScale = null;

//Creates the axes
let xAxis = null;
let yAxis = null;

// function "processData" with a data parameter 
function processData(data) {
  const result = {}; //crates an empty object to handle the text
  data.forEach(row => {
    const { land, indud, indhold } = row; //creates an variable for each row

    //Tries to convert "indhold" into a number and if it cant it will skip this entry
    const value = parseFloat(indhold);
    if (isNaN(value)) return;

    //This makes it so that if there is no object for a country then there will be added an object where "eksport and import" are set to 0 in result
    if (!result[land]) result[land] = { eksport: 0, import: 0 };

    //Makes it so that if "indud" is "eksport or import" it will return the value of them
    if (indud === 'Exports') result[land].eksport = value;
    else if (indud === 'Imports') result[land].import = value;
  });

  //Here every country is collected in an array where they each include 
  return Object.keys(result).map(land => ({
    //country name
    land,

    //export for the country
    eksport: result[land].eksport,

    //import for each country
    import: result[land].import,

    //the total sum
    total: result[land].eksport + result[land].import
  }));
}

//function with the parameter dataset
function initialize(dataset) {
  
  //calls the function setUp
  setUp(dataset);

  //calls function createDefaultChart
  createDefaultChart(dataset);
  
  //calls function addAxes
  addAxes();
} 

//function setUp
function setUp(dataset) {

  //creates a y scale based on dataset and save it in the variable "yScale"
  yScale = createScaleY(dataset);

  //does the same but for the x scale instead
  xScale = createScaleX(dataset);

  //creates a visual x axis based on "xScale" and saves it in "xAxis"
  xAxis = createAxisX(xScale);

  //does the same but for y instead
  yAxis = createAxisY(yScale);

  //creates a colorscale that is used to determin the color of each pillar in the barChart based on the number 
  colorScale = createColorScale(dataset);
}

//function createScaleX
function createScaleX(dataset) {

  //Creates a pillar for each kategori
  return d3.scaleBand()//returns the finished result

    //places the bars from left to right
    .range([padding + axisPadding,//left margin
       w - padding - axisPadding])//right margin

       //places each country the x axis
    .domain(dataset.map(d => d.land))

    //adds space between the bars
    .padding(0.1);
}

//function createScaleY
function createScaleY(dataset) {

  //creates a linear scale to showcase higher numbers more easily 
  return d3.scaleLinear()//returns the finished result

  //tells it which numbers the scale needs
    .domain([0, d3.max(dataset, getValueByMetric)]) // starts from 0 and goes up to the highest number in the dataset

    //Places the scale in terms of pixels
    .range([h - padding - axisPadding, padding + axisPadding])// is needed to make the bars grow upwards

    //adjust the scale så it is easier to read
    .nice();
}

//function createColorScale
function createColorScale(dataset) {

  //connects a linear scale to colors
  return d3.scaleLinear()//returns the finished result

    //tells it which numbers to work with (in this case from 0 to the highest numver in dataset)
    .domain([0, d3.max(dataset, getValueByMetric)])//finds the biggest number

    //translates numbers into colors
    .range(["lightblue", "darkblue"]);
}

//this function makes it so that the numbers are showsn on the left side
function createAxisY(yScale) {
  return d3.axisLeft().scale(yScale).ticks(5);//"yScale" controls how high the numbers go and lastly returns the final result 
}
//Creates a horizontal axis where it then determines where the names of the countries goes
function createAxisX(xScale) {
  return d3.axisBottom().scale(xScale);
}

//A function that has if statements. The function more or less says if curentMetric is "eksport" then return d.eksport
function getValueByMetric(d) {
  if (currentMetric === "eksport") {
    return d.eksport;
  } else if (currentMetric === "import") { //if it is not d.eksport then return d.import
    return d.import;
  } else {
    return d.total; // if it is neither of thoose then return d.total
  }
}

function createDefaultChart(dataset) {
  svg.selectAll("rect") //selects all "rect" elements
    .data(dataset, d => d.land) //binds the dataset to the rectangles and uses the countries name as a key
    .enter()
    .append("rect")//adds a "rect" for each pillar
    .attr("x", d => xScale(d.land)) //creates the horizontal postion for each pillar 
    .attr("y", d => yScale(getValueByMetric(d))) //creates the vertical starting position for each pillar
    .attr("width", xScale.bandwidth()) //gives each pillar a width determinded by scaleBand
    .attr("height", d => h - padding - axisPadding - yScale(getValueByMetric(d)))//calculates the height of the pillar(the entire height - padding and the position of the axis - y postion to make the pilars go upwards)
    .attr("fill", d => colorScale(getValueByMetric(d))) //determinds the color of the pillar based on the value. This is controlled by colarScale function
    
    //when the mouse is over the pillar it shows an infobox
    .on("mouseover", function (event, d) {
      d3.select("#tekstboksBarchart")
        .style("visibility", "visible")
        .html(`${d.land}: ${getValueByMetric(d).toFixed(1)}`) //gives us a countries name and value
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");//places the box close to the mouse
    })
    //hides the infobox again
    .on("mouseout", () => d3.select("#tekstboksBarchart").style("visibility", "hidden"));
}


function addAxes() {

  //appends g groups
  svg.append("g")

  //Moves the x axis
    .attr("transform", `translate(0, ${h - padding - axisPadding})`)//"padding" amd "axisPadding" creates distance between the svg element

    //gives the xAxis and id 
    .attr("id", "xAxis")

    //calls xAxis function which creates the axes lines
    .call(xAxis)

    //moves the text a bit
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end");

    //appends g to the y axis and moves it to the right as not to be all the way left
  svg.append("g")
    .attr("transform", `translate(${padding + axisPadding},0)`)
    .attr("id", "yAxis")
    .call(yAxis);
}

      //Addition of text on the y-axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", padding)
    .attr("x", -h / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Værdi i mio. kr.");

//d3 select all 3 buttons and when they are clicked the function will run
d3.selectAll("#sortByExport, #sortByImport, #sortByTotal").on("click", function (e) {
  
  //saves the ID on a button that has been clicked
  const id = this.id; // I stedet for e.target.id

  //If statement that when run it will set "currentMetric" to "a.eksport" and sort the dataset descending also updates the text on screen tp "sortering: Eksport"
  if (id === "sortByExport") {
    currentMetric = "eksport";
    dataset.sort((a, b) => b.eksport - a.eksport);
    sortingText.text("Sortering: Eksport");

    //sorts it by import instead
  } else if (id === "sortByImport") {
    currentMetric = "import";
    dataset.sort((a, b) => b.import - a.import);
    sortingText.text("Sortering: Import");

    //Sorts by total istead
  } else {
    currentMetric = "total";
    dataset.sort((a, b) => b.total - a.total);
    sortingText.text("Sortering: Samlet");
  }
  //calls the animateData function
  animateData(dataset);
});

//updates the scales and axes.
function animateData(data) {
  yScale = createScaleY(data);
  xScale = createScaleX(data);
  xAxis = createAxisX(xScale);
  colorScale = createColorScale(data);

  //Draws the y axis and the x axis
  svg.select("#yAxis").call(yAxis.scale(yScale));
  svg.select("#xAxis").call(xAxis);

  //calls function
  

  //binds data to all rectangles in the svg
  const bars = svg.selectAll("rect").data(data, d => d.land);//"d.land" is used as a key så d3 knows which data belongs to which pillar

  //animates the bars postion,size and color in 1000ms
  bars.transition()
    .duration(1000)
    .attr("x", d => xScale(d.land))//finds the horizontal position for the country
    .attr("y", d => yScale(getValueByMetric(d)))//gets the numbers from "import and eksport" and "yScale" converts it into a position
    .attr("width", xScale.bandwidth())//determinds how wide the bars is
    .attr("height", d => h - padding - axisPadding - yScale(getValueByMetric(d)))//Calculates how tall the bars should be (h-padding-axisPadding is the bottom area and yScale is the top of the pillar)
    .attr("fill", d => colorScale(getValueByMetric(d)));//Determinds the corlor based off value
  bars.exit().remove();
}



