// Creates the svgs drawing area
const w = 1000;
const h = 500;

// Padding between bars to avoid overlap
const padding = 10;

// Extra space around the edges for axis labels
const axisPadding = 70;

//Temporay dataset
let dataset = [];

function loadVigtigisteHandelspartnere(){
  fetch("/api/vigtig_handelpartnere").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadVigtigisteHandelspartnere()

function loadonKaffe(){
  fetch("/api/onKaffe").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadonKaffe()

function loadonMaskiner(){
  fetch("/api/onMaskiner").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadonMaskiner()

function loadonLevendeDyr(){
  fetch("/api/onLevendeDyr").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadonLevendeDyr()

function loadonMedicin(){
  fetch("/api/onMedicin").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadonMedicin()

function loadonTobak(){
  fetch("/api/onTobak").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadonTobak()





function loadTotalEksport(){
  fetch("/api/totaleksport").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadTotalEksport()

function loadTotalImport(){
  fetch("/api/totalimport").then(response => response.json()).then(data => {
    dataset=data;
    init(dataset,false) 
  }) 
}
loadTotalImport()

// Append an SVG element to the body of the HTML page
const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

// Variables for scales and axes
let yScale = null;
let xScale = null;
let xAxis = null;
let yAxis = null;

// Initialize the chart when the page loads
init(dataset, false);

// Add event listeners to sorting buttons
d3.selectAll("#sortByValue, #sortByDate, #sortByMeasureTime").on("click", function (e) {
  const id = e.target.id; // Get the ID of the clicked button
  console.log(id); // Log which button was clicked in the console

  // Check if sorting by measurement time
  let isFastest = id === "sortByMeasureTime";

  // Sort dataset based on the selected criteria
  sortData(id);
  console.log("Sorted data by " + id + " : ", dataset);

  // Animate the chart to reflect the new sorted order
  animateData(dataset, isFastest);
});

// Initializes the chart with axes and default data
function init(dataset, isFastest) {
  setUp(dataset, isFastest);
  createDefaultChart(dataset);
  addAxes();
}

// Set up the scales and axes
function setUp(dataset, isFastest) {
  yScale = createScaleY(dataset);
  xScale = createScaleX(dataset);
  xAxis = createAxisX(xScale, isFastest);
  yAxis = createAxisY(yScale);
}

// Draws the initial bar chart
function createDefaultChart(dataset) {
  svg
    .selectAll("rect")
    .data(dataset, function (d) {
      return d[2]; // Use the timestamp as an unique key
    })
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      return xScale(i) + padding; // X-position using scale and padding
    })
    .attr("y", function (d) {
      return yScale(d[1]); // Y-position depends on value
    })
    .attr(
      "width",
      w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length // Width per bar
    )
    .attr("height", function (d) {
      return h - padding - axisPadding - yScale(d[1]); // Height from value
    })
    .attr("fill", function (d) {
      // Color is based on the value (darker for higher values)
      return "rgb(0, 0, " + (256 - d[1] * 2) + ")";
    });
}

// Create the X scale using scaleBand for even spacing
function createScaleX(dataset) {
  return d3
    .scaleBand()
    .range([padding + axisPadding, w - padding - axisPadding])
    .domain(dataset.map((d, i) => i)); // Domain is the index of each item
}

// Create the Y scale using scaleLinear for value range
function createScaleY(dataset) {
  return d3
    .scaleLinear()
    .domain([0, d3.max(dataset, d => d[1])]) // From 0 to the max value
    .range([h - padding - axisPadding, padding + axisPadding]) // Inverted so higher values are higher on screen
    .nice(); // Round values nicely
}

// Create the left Y-axis
function createAxisY(yScale) {
  return d3.axisLeft().scale(yScale).ticks(5); // 5 ticks on the Y-axis
}

// Create the bottom X-axis with conditional formatting
function createAxisX(xScale, isFastest) {
  return d3.axisBottom()
    .scale(xScale)
    .tickFormat(function (d) {
      return isFastest ? dataset[d][0] : dataset[d][2]; // Show time or date depending on the context
    });
}

// Add axes to the SVG
function addAxes() {
  // X-axis group at the bottom
  svg
    .append("g")
    .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
    .attr("id", "xAxis");

  // Y-axis group on the left
  svg
    .append("g")
    .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
    .attr("id", "yAxis")
    .call(yAxis); // Attach Y-axis

  formatAxisX(); // Style and rotate X-axis labels
}

// Format X-axis labels (rotate and align)
function formatAxisX() {
  svg
    .select("#xAxis")
    .call(xAxis) // Apply updated X-axis
    .call(xAxis.tickSize(0)) // Remove tick lines
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)") // Tilt text
    .style("text-anchor", "end"); // Right-align text
}

// Animate bars and X-axis when sorting
function animateData(data, isFastest) {
  setUp(data, isFastest); 
    formatAxisX(); // Reapply axis labels

  svg
    .selectAll("rect")
    .data(data, function (d) {
      return d[2]; // Match bars by timestamp
    })
    .transition() // Start a transition
    .duration(2000) // Duration in milliseconds
    .attr("x", function (d, i) {
      return xScale(i) + padding; // Move bars to new positions
    });
}

// Sort the dataset based on selected criteria
function sortData(by) {
  if (by === "sortByValue") {
    // Sort descending by value
    dataset.sort((a, b) => b[1] - a[1]);
  } else if (by === "sortByDate") {
    // Sort ascending by timestamp
    dataset.sort((a, b) => new Date(a[2]) - new Date(b[2]));
  } else {
    // Sort ascending by measurement time
    dataset.sort((a, b) => a[0] - b[0]);
  }
}