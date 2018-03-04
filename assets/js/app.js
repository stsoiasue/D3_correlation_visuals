var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = svg.append("g");

// gather data from csv
d3.csv("data/data.csv", function(error, corrData) {
    if (error) {
        console.warn(error)
    };

    // convert values to numbers
    corrData.forEach(data => {
    data.greaterThan60 = +data.greaterThan60;
    data.depressed = +data.depressed;
    data.noWork = +data.noWork;
    data.bingeDrinkers = +data.bingeDrinkers;
    data.earlyBirds = data.earlyBirds;
    data.stroke = data.stroke; 
    });

    // create scale functions
    var yLinearScale = d3.scaleLinear()
        .range([height, 0]);

    var xLinearScale = d3.scaleLinear()
        .range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // calculate min and max of x axis
    var commuteMin = d3.min(corrData, data => data.greaterThan60) - 1
    var commuteMax = d3.max(corrData, data => data.greaterThan60) + 1

    // calculate min and max of y axis
    var depressedMin = d3.min(corrData, data => data.depressed) - 1
    var depressedMax = d3.max(corrData, data => data.depressed) + 1
    
    // Scale the domain
    xLinearScale.domain([commuteMin, commuteMax]);
    yLinearScale.domain([depressedMin, depressedMax]);  

    // add circles to chart according to data points
    chart.selectAll("circle")
        .data(corrData)
        .enter()
        .append("circle")
        .attr("cx", function(data, index) {
            return xLinearScale(data.greaterThan60);
        })
        .attr("cy", function(data, index) {
            return yLinearScale(data.depressed);
        })
        .attr("r", "8")
        .attr("class", "dataPoints")
    
    // add state abbr to chart according to data points
    chart.selectAll("text")
        .data(corrData)
        .enter()
        .append("text")
        .attr("class", "stateText")
        .text(function(data) { return data.stateAbbr })
        .attr("x", function(data, index) {
            return xLinearScale(data.greaterThan60);
        })
        .attr("y", function(data, index) {
            return yLinearScale(data.depressed);
        })

    // add x axis to chart
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(bottomAxis);
    
    // add y axis to chart
    chart.append("g")
        .attr("class", "y-axis")
        .call(leftAxis);
    
    // add y axes
    // depression
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText yAxisText active")
        .attr("data-axis-name", "depressed")
        .text("Some Form of Depression (%)");
    
    // binge drinkers
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText yAxisText inactive")
        .attr("data-axis-name", "bingeDrinkers")
        .text("Binge Drinkers (%)");
    
    // stroke
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText yAxisText inactive")
        .attr("data-axis-name", "stroke")
        .text("Had Stroke (%)");

    // add x axes
    // commute greater than 60 mins
    chart.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
        .attr("class", "axisText xAxisText active")
        .attr("data-axis-name", "greaterThan60")
        .text("Commute Greater than 60 mins (%)");
    
    // did not work
    chart.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .attr("class", "axisText xAxisText inactive")
        .attr("data-axis-name", "noWork")
        .text("Did not work for the year (%)");
    
    // earlu risers
    chart.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 60) + ")")
        .attr("class", "axisText xAxisText inactive")
        .attr("data-axis-name", "earlyBirds")
        .text("Early Risers - Leave for work between 12AM and 5AM  (%)");

    // create tool tip
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(data) { 
            return (
                `<strong>${data.state}</strong><hr>
                Depressed: ${data.depressed}<br>
                Commute > 60: ${data.greaterThan60}`
            )
        });
        
    chart.call(tool_tip);

    d3.selectAll(".dataPoints").on("mouseover", tool_tip.show)
    d3.selectAll(".dataPoints").on("mouseout", tool_tip.hide)
        
    function labelChange(clickedAxis) {

        if (clickedAxis.classed("xAxisText")) {
            d3.selectAll(".xAxisText")
                .filter(".active")
                .classed("active", false)
                .classed("inactive", true);
                clickedAxis.classed("inactive", false).classed("active", true);
        } else {
            d3.selectAll(".yAxisText")
                .filter(".active")
                .classed("active", false)
                .classed("inactive", true);
                clickedAxis.classed("inactive", false).classed("active", true);
        }
    };

    d3.selectAll(".axisText").on("click", function() {
        
        var selectedAxis = d3.select(this);

        // verify if axis is inactive
        var isSelectedAxisInactive = selectedAxis.classed("inactive");

        var isSelectedAxisX = selectedAxis.classed("xAxisText");

        // retrieve data name from axis
        var axisData= selectedAxis.attr("data-axis-name")

        if (isSelectedAxisInactive) {

            if (isSelectedAxisX) {
                var xMin = d3.min(corrData, data => data[axisData]) - 1
                var xMax = d3.max(corrData, data => data[axisData]) + 1
            
                // Scale the domain
                xLinearScale.domain([xMin, xMax]); 

                chart.select(".x-axis")
                    .transition()
                    .call(bottomAxis)
                
                chart.selectAll(".dataPoints")
                    .transition()
                    .attr("cx", function(data, index) {
                        return xLinearScale(data[axisData]);
                    })

                chart.selectAll(".stateText")
                    .transition()
                    .attr("x", function(data, index) {
                        return xLinearScale(data[axisData]);
                    })

                // d3.selectAll(".d3-tip")
                //     .transition()
                //     .html(function(data) { 
                //         return (
                //             `<strong>${data.state}</strong><hr>
                //             ${axisData}: ${data[axisData]}<br>`
                //         )
                //     });

                labelChange(selectedAxis)

            } else {
                var yMin = d3.min(corrData, data => data[axisData]) - 1
                var yMax = d3.max(corrData, data => data[axisData]) + 1
                console.log(`${yMin} ${yMax}`)
                // Scale the domain
                yLinearScale.domain([yMin, yMax]); 

                chart.select(".y-axis")
                    .transition()
                    .call(leftAxis)

                chart.selectAll(".dataPoints")
                    .transition()
                    .attr("cy", function(data, index) {
                        return yLinearScale(data[axisData]);
                    })

                chart.selectAll(".stateText")
                    .transition()
                    .attr("y", function(data, index) {
                        return yLinearScale(data[axisData]);
                    })


                labelChange(selectedAxis)
            }
        }
    }
);
})


