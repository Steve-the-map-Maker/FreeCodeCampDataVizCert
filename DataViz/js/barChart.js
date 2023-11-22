// Select the container div and append an SVG element to it
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", 800)
  .attr("height", 400);

// Create title
svg
  .append("text")
  .attr("id", "title")
  .attr("x", 400) // Center the title
  .attr("y", 30) // Position the title at the top
  .attr("text-anchor", "middle")
  .text("United States GDP");

// URL of the external dataset
const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// Fetch the data
d3.json(dataUrl).then((data) => {
  // Process the data...
  const dataset = data.data.map((item) => ({
    date: item[0],
    gdp: item[1],
  }));

  // Define the SVG container...
  const svg = d3.select("svg");
  const margin = { top: 30, right: 20, bottom: 30, left: 50 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  // Define scales...
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Create the SVG 'g' element that will contain our chart...
  const g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set the domain for the x and y scales...
  x.domain(d3.extent(dataset, (d) => new Date(d.date)));
  y.domain([0, d3.max(dataset, (d) => d.gdp)]);

  // Add the x-axis...
  g.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the y-axis...
  g.append("g").attr("id", "y-axis").call(d3.axisLeft(y));

  // Draw the bars...
  g.selectAll(".bar")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(new Date(d.date)))
    .attr("y", (d) => y(d.gdp))
    .attr("width", 10) // Width of the bars
    .attr("height", (d) => height - y(d.gdp))
    .attr("data-date", (d) => d.date)
    .attr("data-gdp", (d) => d.gdp);

  // Define and add the tooltip...
  const tooltip = d3.select("#tooltip");

  g.selectAll(".bar")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Date: ${d.date}<br>GDP: ${d.gdp}`)
        .attr("data-date", d.date)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
});
