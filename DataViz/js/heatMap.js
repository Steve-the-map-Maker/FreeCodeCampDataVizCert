console.log("coming from heatmap.js");

// Step 1: Fetch the Data
fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    // Once the data is fetched, call the function to create the heatmap
    createHeatMap(data);
  });

function createHeatMap(dataset) {
  // Step 2: Create the SVG Container
  const width = 900;
  const height = 670;
  const padding = 100;

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Define scales and axis:
  const x = d3
    .scaleBand()
    .range([padding, width - padding]) // This sets the start of the x-scale at the padding value
    .domain(dataset.monthlyVariance.map((d) => d.year))
    .padding(0.15);

  svg
    .append("g")
    .attr("id", "x-axis")
    .style("font-size", 10)
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(
      d3
        .axisBottom(x)
        .tickSize(10)
        .tickValues(x.domain().filter((year) => year % 10 === 0))
    )
    .select(".domain")
    .remove();

  // Define the y-scale
  const y = d3
    .scaleBand()
    .range([height - padding, padding])
    .domain(d3.range(0, 12)) // Ensure that months go from January (0) to December (11)
    .padding(0.05);

  // Define the y-axis with correct month names
  svg
    .append("g")
    .attr("id", "y-axis")
    .style("font-size", 15)
    .attr("transform", `translate(${padding},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickSize(10)
        .tickFormat((monthIndex) => {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return months[monthIndex]; // The monthIndex is directly used here
        })
    )
    .select(".domain")
    .remove();

  // Step 3: Add title and description
  svg
    .append("text")
    .attr("id", "title")
    .attr("x", width / 3)
    .attr("y", padding / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Monthly Global Land-Surface Temperature");

  svg
    .append("text")
    .attr("id", "description")
    .attr("x", width / 3)
    .attr("y", padding - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("1753 - 2015: base temperature 8.66℃");

  // Step 4: Add Colors - Reversed color scale for Red-High, Blue-Low
  const colorScale = d3
    .scaleQuantize()
    .domain(
      d3.extent(
        dataset.monthlyVariance,
        (d) => d.variance + dataset.baseTemperature
      )
    )
    .range(d3.schemeRdYlBu[11].reverse()); // Reverse the color scheme array

  // Draw the cells
  svg
    .selectAll(".cell")
    .data(dataset.monthlyVariance)
    .enter()
    .append("rect")
    .attr("x", (d) => {
      const xPos = x(d.year);
      // console.log(`Year: ${d.year}, X position: ${xPos}`);
      return xPos;
    })
    .attr("y", (d) => y(d.month - 1))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) => colorScale(d.variance + dataset.baseTemperature))
    .attr("data-month", (d) => d.month - 1) // zero-indexed for the data-month attribute
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => dataset.baseTemperature + d.variance)
    .attr("class", "cell");

  // Step 6: Add Tooltip
  // Define the tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("display", "none"); // Ensure tooltip is not displayed by default

  // Add mouseover and mouseout events
  svg
    .selectAll(".cell")
    .on("mouseover", function (event, d) {
      tooltip
        .html(
          `<span class='date'>${d3.utcFormat("%Y - %B")(
            new Date(d.year, d.month - 1)
          )}</span><br />
      <span class='temperature'>${d3.format(".1f")(
        dataset.baseTemperature + d.variance
      )}℃</span><br />
      <span class='variance'>${d3.format("+.1f")(d.variance)}℃</span>`
        )
        .style("opacity", 0.9)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .style("display", "block") // Show the tooltip
        .attr("data-year", d.year); // Set the "data-year" attribute
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0).style("display", "none"); // Hide the tooltip
    });
  // Step 7: Create the legend
  const legendWidth = 400;
  const legendHeight = 300 / colorScale.ticks().length;

  const legendThreshold = d3
    .scaleThreshold()
    .domain(
      (function () {
        const thresholds = colorScale.range().map(function (color) {
          return colorScale.invertExtent(color)[0];
        });
        thresholds.shift();
        return thresholds;
      })()
    )
    .range(colorScale.range());

  const legendX = d3
    .scaleLinear()
    .domain(
      d3.extent(
        dataset.monthlyVariance,
        (d) => d.variance + dataset.baseTemperature
      )
    )
    .range([0, legendWidth]);

  const legendXAxis = d3
    .axisBottom(legendX)
    .tickSize(10, 0)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format(".1f"));

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      "translate(" + padding + "," + (height - padding + 40) + ")"
    );

  legend
    .append("g")
    .selectAll("rect")
    .data(
      legendThreshold.range().map(function (color) {
        const d = legendThreshold.invertExtent(color);
        if (d[0] == null) d[0] = legendX.domain()[0];
        if (d[1] == null) d[1] = legendX.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .style("fill", function (d) {
      return legendThreshold(d[0]);
    })
    .attr("x", function (d) {
      return legendX(d[0]);
    })
    .attr("width", function (d) {
      return legendX(d[1]) - legendX(d[0]);
    })
    .attr("height", 20);

  legend
    .append("g")
    .attr("transform", "translate(0," + 20 + ")")
    .call(legendXAxis);
}
