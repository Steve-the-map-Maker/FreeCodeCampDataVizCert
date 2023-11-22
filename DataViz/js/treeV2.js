console.log("coming from tree.js");

document.addEventListener("DOMContentLoaded", () => {
  // Define dimensions and margins for the tree map
  const width = 960;
  const height = 600;
  const margin = { top: 40, right: 20, bottom: 10, left: 10 };

  // Define variables for the legend
  const legendWidth = 300; // Width of the legend
  const legendPadding = 10; // Padding between legend items
  const legendItemHeight = 20; // Height of each legend item

  // Function to create a tree map for a given dataset and container
  function createTreeMap(containerId, dataUrl, titleText, descriptionText) {
    const container = d3.select(containerId);

    // Adding title and description
    container.append("h1").attr("id", "title").text(titleText);
    container.append("p").attr("id", "description").text(descriptionText);

    // Create SVG container for the tree map
    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font", "10px sans-serif");

    // Load and process data
    d3.json(dataUrl).then((data) => {
      // Root node
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

      // Create a tree map layout
      const treemap = d3.treemap().size([width, height]).paddingInner(1);
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
        .style("opacity", 0)
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "#fff") // White background
        .style("border", "1px solid #ccc") // Light grey border
        .style("border-radius", "5px") // Rounded corners
        .style("padding", "10px") // Padding inside the tooltip
        .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.2)") // Slight shadow for depth
        .style("max-width", "200px") // Maximum width to prevent it from being too wide
        .style("font-size", "0.9em") // Adjust font size if needed
        .style("pointer-events", "none");

      tile
        .on("mouseover", (event, d) => {
          const tooltipWidth = tooltip.node().offsetWidth;
          const tooltipHeight = tooltip.node().offsetHeight;
          const pageX = event.pageX;
          const pageY = event.pageY;
          const margin = 20; // Margin from the cursor
          let left = pageX + margin;
          let top = pageY + margin;

          // Check if the tooltip would go off the right of the screen
          if (pageX + tooltipWidth + margin > window.innerWidth) {
            left = pageX - tooltipWidth - margin;
          }

          // Check if the tooltip would go off the bottom of the screen
          if (pageY + tooltipHeight + margin > window.innerHeight) {
            top = pageY - tooltipHeight - margin;
          }

          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
            )
            .attr("data-value", d.data.value)
            .style("left", `${left}px`)
            .style("top", `${top}px`);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Extract categories for legend
      const categories = root.leaves().map((nodes) => nodes.data.category);
      const distinctCategories = [...new Set(categories)];

      // Create an SVG element for the legend inside the container with the id 'legend'
      const legendSvg = container
        .append("svg")
        .attr("id", "legend")
        .attr("width", width)
        .style("font", "10px sans-serif");

      // Append the legend items (rect elements with a class of 'legend-item')
      const legend = legendSvg
        .selectAll("g")
        .data(distinctCategories)
        .enter()
        .append("g")
        .attr("class", "legend-label")
        .attr("transform", (d, i) => `translate(${i * 150}, 0)`); // Spacing of legend items

      legend
        .append("rect")
        .attr("class", "legend-item") // Assign class 'legend-item' to each rect
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d) => color(d));

      legend
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text((d) => d);

      // Add labels to each tile for the videogame names
      tile
        .append("text")
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g)) // Split the name into multiple lines if necessary
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text((d) => d);
    });
  }

  // Create tree maps for each dataset
  createTreeMap(
    "#kickstarterContainer",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    "Kickstarter Pledges",
    "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category"
  );
});
