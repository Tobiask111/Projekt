//Drawing area for the barchart. Also uses padding to create margins inbetween the pillars and the axis.
const w = 1000;
const h = 500;
const padding = 10;
const axisPadding = 70;

//We use let here to create an empty array where we can place data in later.
let dataset = [];

//A variable that is needed to showcase the right data in the different pillars.
let currentMetric = "Total";

//A variable that is needed to change the color of the pillars based on their values. 
let colorScale = null; // We use null because the color sacle is not yet created

// Fetches data
function loadVigtigisteHandelspartnere() {
  fetch("/api/vigtig_handelpartnere") //Gets the data from the server
    .then(response => response.json()) //converts it into json
    .then(data => {
      dataset = processData(data); //the data is sent to be processed
      dataset.sort((a, b) => b.total - a.total); //sorts the data descending
      initialize(dataset); //runs the initialize function
    });
}
//calls the function
loadVigtigisteHandelspartnere();

//adds the atributes width(as w) and height(as h) to it
const svg = d3.select("body").append("svg")
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
    const { land, indud, indhold } = row; //creates a row for each "land, indud(import and export), indhold"

    
    const value = parseFloat(indhold);
    if (isNaN(value)) return;

    if (!result[land]) result[land] = { eksport: 0, import: 0 };

    if (indud === 'Exports') result[land].eksport = value;
    else if (indud === 'Imports') result[land].import = value;
  });

  return Object.keys(result).map(land => ({
    land,
    eksport: result[land].eksport,
    import: result[land].import,
    total: result[land].eksport + result[land].import
  }));
}

function initialize(dataset) {
  setUp(dataset);
  createDefaultChart(dataset);
  addAxes();
}

function setUp(dataset) {
  yScale = createScaleY(dataset);
  xScale = createScaleX(dataset);
  xAxis = createAxisX(xScale);
  yAxis = createAxisY(yScale);
  colorScale = createColorScale(dataset);
}

function createScaleX(dataset) {
  return d3.scaleBand()
    .range([padding + axisPadding, w - padding - axisPadding])
    .domain(dataset.map(d => d.land))
    .padding(0.1);
}

function createScaleY(dataset) {
  return d3.scaleLinear()
    .domain([0, d3.max(dataset, getValueByMetric)])
    .range([h - padding - axisPadding, padding + axisPadding])
    .nice();
}

function createColorScale(dataset) {
  return d3.scaleLinear()
    .domain([0, d3.max(dataset, getValueByMetric)])
    .range(["lightblue", "darkblue"]);
}

function createAxisY(yScale) {
  return d3.axisLeft().scale(yScale).ticks(5);
}

function createAxisX(xScale) {
  return d3.axisBottom().scale(xScale);
}

function getValueByMetric(d) {
  return currentMetric === "eksport" ? d.eksport
       : currentMetric === "import" ? d.import
       : d.total;
}

function createDefaultChart(dataset) {
  svg.selectAll("rect")
    .data(dataset, d => d.land)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.land))
    .attr("y", d => yScale(getValueByMetric(d)))
    .attr("width", xScale.bandwidth())
    .attr("height", d => h - padding - axisPadding - yScale(getValueByMetric(d)))
    .attr("fill", d => colorScale(getValueByMetric(d)))
    .on("mouseover", function (event, d) {
      d3.select("#tekstboksBarchart")
        .style("visibility", "visible")
        .html(`${d.land}: ${getValueByMetric(d).toFixed(1)}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => d3.select("#tekstboksBarchart").style("visibility", "hidden"));
}

function addAxes() {
  svg.append("g")
    .attr("transform", `translate(0, ${h - padding - axisPadding})`)
    .attr("id", "xAxis")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${padding + axisPadding},0)`)
    .attr("id", "yAxis")
    .call(yAxis);
}

d3.selectAll("#sortByExport, #sortByImport, #sortByTotal").on("click", function (e) {
  const id = e.target.id;

  if (id === "sortByExport") {
    currentMetric = "eksport";
    dataset.sort((a, b) => b.eksport - a.eksport);
    sortingText.text("Sortering: Eksport");
  } else if (id === "sortByImport") {
    currentMetric = "import";
    dataset.sort((a, b) => b.import - a.import);
    sortingText.text("Sortering: Import");
  } else {
    currentMetric = "total";
    dataset.sort((a, b) => b.total - a.total);
    sortingText.text("Sortering: Samlet");
  }

  animateData(dataset);
});

function animateData(data) {
  yScale = createScaleY(data);
  xScale = createScaleX(data);
  xAxis = createAxisX(xScale);
  colorScale = createColorScale(data);

  svg.select("#yAxis").call(yAxis.scale(yScale));
  svg.select("#xAxis").call(xAxis);
  formatAxisX();

  const bars = svg.selectAll("rect").data(data, d => d.land);

  bars.transition()
    .duration(1000)
    .attr("x", d => xScale(d.land))
    .attr("y", d => yScale(getValueByMetric(d)))
    .attr("width", xScale.bandwidth())
    .attr("height", d => h - padding - axisPadding - yScale(getValueByMetric(d)))
    .attr("fill", d => colorScale(getValueByMetric(d)));

  bars.on("mouseover", function (event, d) {
      d3.select("#tekstboksBarchart")
        .style("visibility", "visible")
        .html(`${d.land}: ${getValueByMetric(d).toFixed(1)}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => d3.select("#tekstboksBarchart").style("visibility", "hidden"));

  bars.enter().append("rect")
    .attr("x", d => xScale(d.land))
    .attr("y", d => yScale(getValueByMetric(d)))
    .attr("width", xScale.bandwidth())
    .attr("height", d => h - padding - axisPadding - yScale(getValueByMetric(d)))
    .attr("fill", d => colorScale(getValueByMetric(d)));

  bars.exit().remove();
}

function formatAxisX() {
  svg.select("#xAxis")
    .call(xAxis)
    .call(xAxis.tickSize(0))
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end");
}