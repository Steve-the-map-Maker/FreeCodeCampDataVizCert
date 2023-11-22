console.log("comeing from scatterPlot.js");

// Define the dimensions and padding for the chart
const width = 800;
const height = 400;
const padding = 60;

// URL to the dataset
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// Function to parse the time in the dataset
const parseTime = d3.timeParse("%M:%S");
const formatTime = d3.timeFormat("%M:%S");

// Load the data from the URL
d3.json(url).then((data) => {
  // Convert strings into proper date and time formats
  data.forEach((d) => {
    d.ParsedTime = parseTime(d.Time);
    d.YearDate = new Date(d.Year, 0); // Convert Year to a Date object
  });

  // Adjust the xScale domain to fit the actual data range
  const xScale = d3
    .scaleTime()
    .domain([new Date(1994, 0), new Date(2016, 0)]) // Set the domain to span from 1994 to 2016
    .range([padding, width - padding]);
  // The yScale remains unchanged
  const yScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.ParsedTime))
    .range([padding, height - padding]);

  // Append SVG to the container
  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin meet");

  // Append a title to the SVG element
  svg
    .append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", padding / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Doping in Professional Bicycle Racing");

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("visibility", "hidden")
    .style("position", "absolute")
    .style("text-align", "center")
    .style("width", "auto")
    .style("height", "auto")
    .style("background", "#fff")
    .style("border", "1px solid")
    .style("border-radius", "5px")
    .style("padding", "10px");

  // Append dots to SVG and add tooltip functionality
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.YearDate.getFullYear())
    .attr("data-yvalue", (d) => d.ParsedTime)
    .attr("cx", (d) => xScale(d.YearDate))
    .attr("cy", (d) => yScale(d.ParsedTime))
    .attr("r", 5)
    .on("mouseover", (event, d) => {
      tooltip.transition().style("visibility", "visible");
      tooltip
        .html(
          d.Name +
            ": " +
            d.Nationality +
            "<br>Year: " +
            d.Year +
            "<br>Time: " +
            formatTime(d.ParsedTime)
        )
        .attr("data-year", d.YearDate.getFullYear())
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().style("visibility", "hidden");
    });

  // Create an array of Date objects for each year from 1994 to 2016
  const years = d3.range(1994, 2017).map((year) => new Date(year, 0));

  // Create and append x-axis with specified tick values
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(years) // Use the years array for tick values
    .tickFormat(d3.timeFormat("%Y")); // Format the ticks to display only the year

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis);
  // Create and append y-axis
  const yAxis = d3.axisLeft(yScale).tickFormat(formatTime);
  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

  // Append the legend to the SVG element
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width - padding * 3}, ${padding})`);

  // Add legend items (example for two categories, you can modify as per your dataset)
  legend
    .selectAll(null)
    .data(["Doping allegations", "No doping allegations"])
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", 20)
    .attr("y", (d, i) => i * 20)
    .style("text-anchor", "start")
    .style("alignment-baseline", "hanging");

  // Add legend color boxes (example for two categories, you can modify as per your dataset)
  legend
    .selectAll(null)
    .data(["#ff0000", "#0000ff"]) // colors for the categories
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20 - 10)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d) => d);
});
