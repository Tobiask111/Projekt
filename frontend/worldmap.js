// The svg
const mapSvg = d3.select("#worldMapSVG"),
      width = +mapSvg.attr("width"),
      height = +mapSvg.attr("height");

// Map and projection
const projection = d3.geoNaturalEarth1()
  .scale(width / 1.3 / Math.PI)
  .translate([width / 2, height / 2]);

// Create geoPath generator
const path = d3.geoPath().projection(projection);

// Load and draw the map
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .then(function(data) {
    mapSvg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", path)
        .style("stroke", "#fff");
  })
  .catch(function(error) {
    console.error("Fejl ved indlæsning af kortdata:", error);
  });