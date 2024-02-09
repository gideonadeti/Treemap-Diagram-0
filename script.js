// Define DATASETS object
const DATASETS = {
  videogames: {
    TITLE: "Video Game Sales",
    DESCRIPTION: "Top 100 Most Sold Video Games Grouped by Platform",
    FILE_PATH:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json",
  },
  movies: {
    TITLE: "Movie Sales",
    DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
    FILE_PATH:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
  },
  kickstarter: {
    TITLE: "Kickstarter Pledges",
    DESCRIPTION:
      "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    FILE_PATH:
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json",
  },
};

// Default dataset
const DEFAULT_DATASET = "videogames";

// Get URL parameter for dataset selection
const urlParams = new URLSearchParams(window.location.search);
const SELECTED_DATASET = DATASETS[urlParams.get("data") || DEFAULT_DATASET];

// Set page title and description
document.getElementById("title").textContent = SELECTED_DATASET.TITLE;
document.getElementById("description").textContent =
  SELECTED_DATASET.DESCRIPTION;

// Define SVG dimensions
const svgWidth = 1200;
const svgHeight = 800;

// Define margin
const margin = { top: 25, right: 25, bottom: 25, left: 25 };

// Compute inner dimensions
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Define main
const main = d3.select("main");

// Define the div for the tooltip
const tooltip = main
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Append SVG
const svg = d3
  .select("#treemap-diagram")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Define color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Load data
d3.json(SELECTED_DATASET.FILE_PATH).then((data) => {
  // Create treemap layout
  const treemap = d3.treemap().size([width, height]).padding(1).round(true);

  // Generate treemap
  const root = d3.hierarchy(data).sum((d) => d.value);
  treemap(root);

  // Add tiles
  const tiles = svg
    .selectAll(".tile")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
    .style("opacity", 0.8)
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(250).style("opacity", 1);
      tooltip
        .html(
          `<b>Name:</b> ${d.data.name}
          <br>
          <b>Category:</b> ${d.parent.data.name}
          <br>
          <b>Value:</b> ${d.data.value}`
        )
        .attr("data-value", d.data.value)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Append rectangles for tiles
  tiles
    .append("rect")
    .attr("class", "tile")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.parent.data.name))
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.parent.data.name)
    .attr("data-value", (d) => d.data.value);

  // Append text for tile names
  const TEXT_MAX_LENGTH = 5;
  tiles
    .append("text")
    .attr("x", 5)
    .attr("y", 10)
    .text((d) => {
      const truncatedName =
        d.data.name.length > TEXT_MAX_LENGTH
          ? d.data.name.substring(0, TEXT_MAX_LENGTH) + "..."
          : d.data.name;
      return truncatedName;
    });

  // Create legend
  const categories = root.leaves().map((d) => d.parent.data.name);
  const uniqueCategories = Array.from(new Set(categories));

  const legend = d3.select("#legend");
  const legendWidth = +legend.attr("width");
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

  const legendElem = legend
    .append("g")
    .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
    .selectAll("g")
    .data(uniqueCategories)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return (
        "translate(" +
        (i % legendElemsPerRow) * LEGEND_H_SPACING +
        "," +
        (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
          LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
        ")"
      );
    });

  // Append rectangles for legend items
  legendElem
    .append("rect")
    .attr("width", LEGEND_RECT_SIZE)
    .attr("height", LEGEND_RECT_SIZE)
    .attr("class", "legend-item")
    .attr("fill", function (d) {
      return color(d);
    });

  // Append text for legend items
  legendElem
    .append("text")
    .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text(function (d) {
      return d;
    });
});
