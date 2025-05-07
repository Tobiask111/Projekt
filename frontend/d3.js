/// Your dataset: pairs of [x, y] values
const dataset = [
    [5, 20],
    [480, 90],
    [250, 50],
    [100, 33],
    [330, 95],
    [410, 12],
    [475, 44],
  ];
  
  // Width and height of the SVG features on the website
  const w = 950;
  const h = 600;
  const padding = 150;
  
  // Select the HTML element with id "barChart" and add an SVG to it
  const svg = d3.select("#barChart")
    .append("svg")
    .attr("width", w)    // Set SVG width
    .attr("height", h);  // Set SVG height
  
  // X scale: spreads bars evenly across the width
  const xScale = d3.scaleBand()
    .domain(dataset.map((_, i) => i)) // Use index as label
    .range([padding, w - padding])    // Leave space on both sides
    .padding(0.2);                    // Add spacing inbetween bars
  
  // Y scale: maps data values to pixel positions
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d[1])]) // From 0 to highest y-value
    .range([h - padding, padding]);          // Inverts axis (SVG y grows downward)
  
  // Draw bars for each data point
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (_, i) => xScale(i))            // Horizontal position
    .attr("y", d => yScale(d[1]))              // Top of the bar
    .attr("width", xScale.bandwidth())         // Bar width from x scale
    .attr("height", d => yScale(0) - yScale(d[1])) // Height = from baseline to top
    
  
  // Add the x-axis at the bottom of the chart
  svg.append("g")
    .attr("transform", `translate(0,${h - padding})`) // Move it to bottom
    .call(d3.axisBottom(xScale).tickFormat(i => `Data ${i + 1}`)) // Label bars
    .selectAll("text")
    .attr("transform", "rotate(-45)")     // Rotate labels to avoid overlap
    .style("text-anchor", "end");         // Align text properly
  
  // Add the y-axis on the left side
  svg.append("g")
    .attr("transform", `translate(${padding},0)`) // Move it to the left
    .call(d3.axisLeft(yScale));                   // Create y-axis using y scale