console.log("coming from tree.js");

document.addEventListener("DOMContentLoaded", () => {
  // Define dimensions and margins for the tree map
  const width = 960;
  const height = 600;
  const margin = { top: 40, right: 10, bottom: 10, left: 10 };

  // Function to create a tree map for a given dataset and container
  function createTreeMap(containerId, dataUrl, titleText, descriptionText) {
    const container = d3.select(containerId);

    // Adding title and description
    container.append("h1").attr("id", "title").text(titleText);
    container.append("p").attr("id", "description").text(descriptionText);

    // Create SVG container for the specific dataset
    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font", "10px sans-serif");

    // Load and process data for the specific dataset
    d3.json(dataUrl).then((data) => {
      // Root node
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

      // Create a tree map layout
      const treemap = d3
        .treemap()
        .size([
          width - margin.left - margin.right,
          height - margin.top - margin.bottom,
        ])
        .paddingInner(1);
      treemap(root);

      // Define color scale
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      // Create tiles
      const tile = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      tile
        .append("rect")
        .attr("class", "tile")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value)
        .attr("fill", (d) => color(d.data.category));

      // Tooltip
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

      tile
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(
              `
    Name: ${d.data.name}<br>
    Category: ${d.data.category}<br>
    Value: ${d.data.value}`
            )
            .attr("data-value", d.data.value)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Add text labels
      tile
        .append("text")
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text((d) => d);

      // Legend
      const legend = svg.append("g").attr("id", "legend");

      const colorr = d3.scaleOrdinal(d3.schemeCategory10);

      const categories = Array.from(
        new Set(data.children.map((d) => d.category))
      );

      categories.forEach((category, index) => {
        const legendItem = legend
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", `translate(0, ${index * 20})`);

        legendItem
          .append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", colorr(category));

        legendItem
          .append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("alignment-baseline", "middle")
          .text(category);
      });
    });
  }

  // Create tree maps for each dataset
  createTreeMap(
    "#kickstarterContainer",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
  );
  createTreeMap(
    "#moviesContainer",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
  );
  createTreeMap(
    "#videogamesContainer",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  );
});
