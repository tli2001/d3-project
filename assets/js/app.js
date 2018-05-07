var svgWidth = 1000;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);;

// Initial Params
var chosenXAxis = "median_income"
var chosenYAxis = "pct_depressed"

// function used for updating x-scale var upon click on axis label
function xScale(dataSet, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataSet, d => d[chosenXAxis]) * 0.8,
      d3.max(dataSet, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width])
  return xLinearScale
};

function yScale(dataSet, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(dataSet, d => d[chosenYAxis]) * 0.8,
      d3.max(dataSet, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0])
  return yLinearScale
};


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale)

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    //.attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis == "median_income") {
    var label = "Median Household Income: $"
  } else if (chosenXAxis == "median_age") {
    var label = "Median Age:"
  } else {
    var label = "Gini Index:"
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.loc_name}<br>${label} ${d[chosenXAxis]}<br>${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/dataSet.csv", function (err, dataSet) {
  if (err) throw err;

  // parse data
  dataSet.forEach(function (data) {
    data.median_income = +data.median_income;
    data.median_age = +data.median_age;
    data.gini_index = +data.gini_index;
    data.pct_depressed = +data.pct_depressed;
    data.pct_bingedrink = +data.pct_bingedrink;
    data.pct_heavydrink = +data.pct_heavydrink;
    data.pct_smokers = +data.pct_smokers;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(dataSet, chosenXAxis)

  // Create y scale function
  var yLinearScale = yScale(dataSet, chosenYAxis)

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)

  // append y axis
  chartGroup.append("g")
  //  .classed("y-axis", true)
  //  .attr("transform", `translate(0, ${height})`)
    .call(leftAxis)

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(dataSet)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "pink")
    .attr("opacity", ".5")
    .attr("stroke", "black")

  // chartGroup.append("text")
  //   .text(d => d[loc_abbr])

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`)

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "median_income") //value to grab for event listener
    .classed("active", true)
    .text("Median Household Income (dollars)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "median_age") //value to grab for event listener
    .classed("inactive", true)
    .text("Median Age (years)");

  var giniLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "gini_index") //value to grab for event listener
    .classed("inactive", true)
    .text("Gini Index (0-1 income inequality)");


  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Percent Depressed");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value")
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(dataSet, chosenXAxis);
        //yLinearScale = yScale(dataSet, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        //yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x & y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis == "median_age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          giniLabel
            .classed("active", false)
            .classed("inactive", true)
        } else if (chosenXAxis == "median_income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
          incomeLabel
            .classed("active", true)
            .classed("inactive", false)
          giniLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          giniLabel
            .classed("active", true)
            .classed("inactive", false)
        };
      };
    });
});
