// Read the CSV data
d3.csv("data.csv").then(function(data) {
    // Convert PurchaseAmount and FamilySize to numeric values
    data.forEach(function(d) {
        d.PurchaseAmount = +d.PurchaseAmount;
        d.FamilySize = +d.FamilySize;
    });

    // Visualization 1: Bar chart for average purchase by gender
    var avgPurchaseByGender = d3.group(data, d => d.Gender);

    var barSvg = d3.select("#barChart")
        .append("svg")
        .attr("width", 600)
        .attr("height", 400);

    var x = d3.scaleBand()
        .domain(Array.from(avgPurchaseByGender.keys()))
        .range([80, 480])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.PurchaseAmount; })])
        .range([300, 20]);

    var bars = barSvg.selectAll("rect")
        .data(Array.from(avgPurchaseByGender.entries()))
        .enter().append("rect")
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", function(d) { return y(d3.mean(d[1], function(v) { return v.PurchaseAmount; })); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return 300 - y(d3.mean(d[1], function(v) { return v.PurchaseAmount; })); })
        .attr("fill", function(d, i) { return i === 0 ? "steelblue" : "orange"; })
        .on("click", function(event, d) {
            var selectedGender = d[0];
            var filteredData = data.filter(function(d) { return d.Gender === selectedGender; });

            updateLineChart(filteredData);
            updatePieChart(filteredData);
        });

    barSvg.append("g")
        .attr("transform", "translate(0," + 300 + ")")
        .call(d3.axisBottom(x));

    barSvg.append("g")
        .attr("transform", "translate(80, 0)")
        .call(d3.axisLeft(y));

    barSvg.append("text")
        .attr("x", 300)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Average Purchase by Gender")
        .style("font-size", "18px");

    barSvg.append("text")
        .attr("x", 300)
        .attr("y", 350)
        .attr("text-anchor", "middle")
        .text("Gender")
        .style("font-size", "14px");

    barSvg.append("text")
        .attr("x", -200)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text("Purchase Amount")
        .style("font-size", "14px")
        .attr("transform", "rotate(-90)");

    // Visualization 2: Multi-line chart for average purchase by gender and family size
    var lineSvg = d3.select("#lineChart")
        .append("svg")
        .attr("width", 600)
        .attr("height", 400);

    var xLine = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.FamilySize; })])
        .range([80, 480]);

    var yLine = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.PurchaseAmount; })])
        .range([300, 20]);

    lineSvg.append("g")
        .attr("transform", "translate(0," + 300 + ")")
        .call(d3.axisBottom(xLine));

    lineSvg.append("g")
        .attr("transform", "translate(80, 0)")
        .call(d3.axisLeft(yLine));

    lineSvg.append("text")
        .attr("x", 300)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Average Purchase by Family Size and Gender")
        .style("font-size", "18px");

    lineSvg.append("text")
        .attr("x", 300)
        .attr("y", 350)
        .attr("text-anchor", "middle")
        .text("Family Size")
        .style("font-size", "14px");

    lineSvg.append("text")
        .attr("x", -200)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text("Purchase Amount")
        .style("font-size", "14px")
        .attr("transform", "rotate(-90)");

    // Visualization 3: Pie chart for payment methods
    var pieSvg = d3.select("#pieChart")
        .append("svg")
        .attr("width", 600)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(300,200)");

    var paymentData = d3.group(data, d => d.PaymentMethod);

    var pie = d3.pie()
        .value(function(d) { return d[1].length; });

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(150);

    var arcs = pieSvg.selectAll("arc")
        .data(pie(paymentData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return d3.schemeCategory10[i]; });

    arcs.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .text(function(d) { return d3.format(".1%")(d.data[1].length / data.length); })
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    pieSvg.append("text")
        .attr("x", 0)
        .attr("y", -180)
        .attr("text-anchor", "middle")
        .text("Payment Methods Distribution")
        .style("font-size", "18px");

    function updateLineChart(filteredData) {
        var avgPurchaseByGenderAndFamilySize = d3.group(filteredData, d => d.Gender, d => d.FamilySize);

        lineSvg.selectAll("circle").remove();
        lineSvg.selectAll("path").remove();

        for (let [gender, group] of avgPurchaseByGenderAndFamilySize) {
            lineSvg.selectAll("circle")
                .data(group)
                .enter().append("circle")
                .attr("cx", function(d) { return xLine(d[0]); })
                .attr("cy", function(d) { return yLine(d3.mean(d[1], function(v) { return v.PurchaseAmount; })); })
                .attr("r", 3)
                .style("fill", gender === "Female" ? "steelblue" : "orange")
                .on("click", function(event, d) {
                    var selectedGender = gender;
                    var filteredData = data.filter(function(d) { return d.Gender === selectedGender; });

                    updateBarChart(filteredData);
                    updatePieChart(filteredData);
                });

            lineSvg.append("path")
                .datum(group)
                .attr("fill", "none")
                .attr("stroke", gender === "Female" ? "steelblue" : "orange")
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(function(d) { return xLine(d[0]); })
                    .y(function(d) { return yLine(d3.mean(d[1], function(v) { return v.PurchaseAmount; })); })
                );
        }
    }

    function updatePieChart(filteredData) {
        var paymentDataFiltered = d3.group(filteredData, d => d.PaymentMethod);

        pieSvg.selectAll(".arc").remove();

        var arcs = pieSvg.selectAll("arc")
            .data(pie(paymentDataFiltered))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", function(d, i) { return d3.schemeCategory10[i]; });

        arcs.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .text(function(d) { return d3.format(".1%")(d.data[1].length / filteredData.length); })
            .style("text-anchor", "middle")
            .style("font-size", "12px");
    }

    // Initial line chart and pie chart
    updateLineChart(data);
    updatePieChart(data);

});
