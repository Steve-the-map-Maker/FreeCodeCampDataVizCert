console.log("coming form choropleth.js!!!!");
document.addEventListener("DOMContentLoaded", function () {
  // Load data
  const EDUCATION_FILE =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
  const COUNTY_FILE =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

  Promise.all([d3.json(EDUCATION_FILE), d3.json(COUNTY_FILE)]).then(function ([
    educationData,
    countyData,
  ]) {
    // Set dimensions and create SVG
    const margin = { top: 50, right: 20, bottom: 30, left: 60 },
      width = 990 - margin.left - margin.right,
      height = 770 - margin.top - margin.bottom;

    const svg = d3
      .select("#container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add title above the map
    svg
      .append("text")
      .attr("id", "title")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text("US Education Level by County");

    // Add description below the title
    svg
      .append("text")
      .attr("id", "description")
      .attr("x", width / 2)
      .attr("y", 17 - margin.top / 4)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text(
        "Percentage of adults aged 25 and older with a bachelor's degree or higher (2010-2014)"
      );

    // Define color scale
    const color = d3
      .scaleThreshold()
      .domain([10, 20, 30, 40, 50, 60, 70, 80, 90])
      .range(d3.schemeBlues[9]);

    // Define tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Draw counties
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(countyData, countyData.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        const result = educationData.find((item) => item.fips === d.id);
        return result ? result.bachelorsOrHigher : 0;
      })
      .attr("fill", (d) => {
        const result = educationData.find((item) => item.fips === d.id);
        return result ? color(result.bachelorsOrHigher) : color(0);
      })
      .attr("d", d3.geoPath())
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 0.9);
        tooltip
          .html(function () {
            const result = educationData.find((item) => item.fips === d.id);
            return result
              ? `${result.area_name}, ${result.state}: ${result.bachelorsOrHigher}%`
              : 0;
          })
          .attr("data-education", () => {
            const result = educationData.find((item) => item.fips === d.id);
            return result ? result.bachelorsOrHigher : 0;
          })
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // Create legend
    const legendWidth = 400;
    const legendHeight = 20;
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${width - legendWidth - 60}, ${height - legendHeight - 30})`
      );

    // Adjust legend to use at least 4 different fill colors
    const legendThresholds = color.domain().slice(0, 4);
    const extendedRange = color.range().slice(0, 5);

    legend
      .selectAll("rect")
      .data(
        legendThresholds.map((threshold, index) => [
          threshold,
          legendThresholds[index + 1] || 100,
        ])
      )
      .enter()
      .append("rect")
      .attr("width", legendWidth / 4)
      .attr("height", legendHeight)
      .attr("x", (d, i) => (i * legendWidth) / 4)
      .attr("fill", (d, i) => extendedRange[i]);

    // Add legend text
    legend
      .append("text")
      .attr("class", "caption")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 20)
      .attr("text-anchor", "middle")
      .text("Percentage with Bachelor's or Higher");
  });
});
