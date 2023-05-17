
let summary_statistics = true;
let selected_colleges = [];
let regions = [];
let locales = [];
let region_colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];
let locale_colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f',
                     '#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928', 'gray'];
let main_x_var = "% Undergrads 25+ y.o.";
let main_y_var = "Median Debt";
let current_legend = 'Region';

const titleHeight = 30;

const mainTotalWidth = 900;
const mainTotalHeight = 250;
const mainLeftMargin = 80;
const mainRightMargin = 200;
const mainTopMargin = 10;
const mainBottomMargin = 50;
const mainWidth = mainTotalWidth - mainLeftMargin - mainRightMargin;
const mainHeight = mainTotalHeight - mainTopMargin - mainBottomMargin;

const leftTotalWidth = 360;
const leftTotalHeight = 250;
const leftLeftMargin = 100;
const leftRightMargin = 0;
const leftTopMargin = 10;
const leftBottomMargin = 50;
const leftWidth = leftTotalWidth - leftLeftMargin - leftRightMargin;
const leftHeight = leftTotalHeight - leftTopMargin - leftBottomMargin;

const midTotalWidth = 480;
const midTotalHeight = 250;
const midLeftMargin = 50;
const midRightMargin = 0;
const midTopMargin = 10;
const midBottomMargin = 60;
const midWidth = midTotalWidth - midLeftMargin - midRightMargin;
const midHeight = midTotalHeight - midTopMargin - midBottomMargin;

const rightTotalWidth = 360;
const rightTotalHeight = 250;
const rightLeftMargin = 90;
const rightRightMargin = 10;
const rightTopMargin = 10;
const rightBottomMargin = 50;
const rightWidth = rightTotalWidth - rightLeftMargin - rightRightMargin;
const rightHeight = rightTotalHeight - rightTopMargin - rightBottomMargin;

let vars = [
    "% American Indian",
    "% Asian",
    "% Biracial",
    "% Black",
    "% Hispanic",
    "% Nonresident Aliens",
    "% Pacific Islander",
    "% White"
];


d3.csv("https://raw.githubusercontent.com/fuyuGT/CS7450-data/main/colleges.csv").then(function (data) {

    console.log(data);

    regions = Array.from(new Set(d3.map(data, d => d.Region)));
    console.log(regions);

    locales = Array.from(new Set(d3.map(data, d => d.Locale)));
    console.log(locales);

    let list_of_colleges = Array.from(new Set(d3.map(data, d => d.Name)));
    list_of_colleges.sort();
    
    d3.select("#college_selection_box")
        .on('change', function() {
            selected_colleges = [];
            for (var option of d3.select('#college_selection_box').property("selectedOptions")){
                selected_colleges.push(option.value);
            }
            summary_statistics = (selected_colleges.length == 0 ? true : false);
            updateAll(data, transition = false);
        })
        .selectAll("option")
        .data(list_of_colleges)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d.substring(0, 30));


    let clearButton = d3.select("#clearButton");
    clearButton.on("click", function() {
        let multiSelect = d3.select("#college_selection_box");
        multiSelect.property("value", []);
        multiSelect.dispatch("change");
        selected_colleges = [];
    });

    let legendButton = d3.select("#legendButton");
    legendButton.on("click", function() {
        if(current_legend == "Region") {
            current_legend = "Locale";
            d3.select("#legendText")
                .text("Current Legend: Locale")
                .style("font-weight", "bold");
        } else {
            current_legend = "Region";
            d3.select("#legendText")
                .text("Current Legend: Region")
                .style("font-weight", "bold");
        }
        updateAll(data);
        updateRightchart(data);
    });

    let x_vars = [
        "% Undergrads 25+ y.o.",
        "% American Indian",
        "% Asian",
        "% Biracial",
        "% Black",
        "% Federal Loans",
        "% Full-time Faculty",
        "% Hispanic",
        "% Nonresident Aliens",
        "% Pacific Islander",
        "% Part-time Undergrads",
        "% Pell Grant Recipients",
        "% Undergrads with Pell Grant",
        "% White"
    ];

    d3.select("#x_variable_selection_box")
        .on('change', function() {
            main_x_var = d3.select('#x_variable_selection_box').property("value");
            updateAll(data, transition = true);
        })
        .selectAll("option")
        .data(x_vars)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    let y_vars = [
        "Median Debt",
        "Median Debt on Graduation",
        "Median Debt on Withdrawal",
        "ACT Median",
        "SAT Average",
        "Average Age of Entry",
        "Average Cost",
        "Average Faculty Salary",
        "Average Family Income",
        "Median Family Income",
        "Completion Rate 150% time",
        "Expenditure Per Student",
        "Mean Earnings 8 years After Entry",
        "Median Earnings 8 years After Entry",
        "Number of Employed 8 years after entry",
        "Number of Unemployed 8 years after entry",
        "Retention Rate (First Time Students)",
        "Poverty Rate"
    ];

    d3.select("#y_variable_selection_box")
        .on('change', function() {
            main_y_var = d3.select('#y_variable_selection_box').property("value");
            updateAll(data, transitiion = true);
        })
        .selectAll("option")
        .data(y_vars)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
        
    createMainplot(data);
    createBarchart(data);
    createMidchart(data);
    createRightchart(data);
});

function updateAll(dta, transition = false) {
    updateMainplot(dta, transition);
    updateBarchart(dta);
    updateMidchart(dta);
    //updateRightchart(dta);
}

//////////////////////////////////////////////
////////////////////////////////////////////// Main Plot
//////////////////////////////////////////////
//////////////////////////////////////////////
function createMainplot(dta) {
    let group = d3.select("#main_group")
        .attr('transform', 'translate(' + mainLeftMargin + ', ' + mainTopMargin + ')');
    
        let tooltip_width = 300;
        let tooltip_height = 50;
        const tooltip = d3.select("#main_svg")
            .append("g");
        let tooltip_box = tooltip
            .append("rect")
            //.style("opacity", 0)
            .style("visibility", "hidden")
            .attr("class", "tooltip")
            .style("fill", "white")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", tooltip_width)
            .attr("height", tooltip_height)
            .style("rx", 5)
            .style("stroke", "black")
            .style("padding", "5px");
        let tooltip_text1 = tooltip  
            .append("text")
            .style("visibility", "hidden")
            .text("tooltip text")
            .style("font-size", 12)
            .attr("transform", "translate(" + 18 +"," + 25 + ")");
        let tooltip_text2 = tooltip  
            .append("text")
            .style("visibility", "hidden")
            .text("tooltip text")
            .style("font-size", 12)
            .attr("transform", "translate(" + 18 +"," + 39 + ")");
        let tooltip_text3 = tooltip  
            .append("text")
            .style("visibility", "hidden")
            .text("tooltip text")
            .style("font-size", 12)
            .attr("transform", "translate(" + 18 +"," + 53 + ")");
    

    let x_scale = d3.scaleLinear()
            .domain([0, d3.max(dta, d => d[main_x_var])])
            .range([0, mainWidth]);

    let y_scale = d3.scaleLinear()
            .domain([0, d3.max(dta, d => +d[main_y_var])])
            .range([mainHeight, 0]);

    let color_scale = null;
    if(current_legend == 'Region') {
        color_scale = d3.scaleOrdinal()
            .domain(regions)
            .range(region_colors);
    } else {
        color_scale = d3.scaleOrdinal()
            .domain(locales)
            .range(locale_colors);
    }
        

    group
        .append("g")
        .attr("id", "main-chart")
        .selectAll("circle")
        .data(dta)
        .enter("circle")
        .append("circle")
        .attr("cx", d => x_scale(+d[main_x_var]))
        .attr("cy", d => y_scale(+d[main_y_var]))
        .attr("r", 3)
        .style("fill", d => color_scale(d[current_legend]))
        .style("opacity", 0.8)
        .attr("id", d => d.Region.replaceAll(" ", ""))
        .attr("class", d => d.Locale.replaceAll(" ", ""))
        .on("mouseover", function(event, d) {
            d3.selectAll("#main-chart circle")
                .style("opacity", 0.3);
            d3.select(this)
                .attr("r", 5)
                .style("opacity", 1)
                .style("stroke", "black");

            
            if(current_legend == "Region") {
                d3.selectAll("#left-chart rect")
                    .style("opacity", 0.3);
                d3.selectAll("#left-chart #" + d.Region.replaceAll(" ", ""))
                    .style("opacity", 1)
                    .style("stroke", "black");
            } else {
                d3.selectAll("#mid-chart rect")
                    .style("opacity", 0.3);
                d3.selectAll("#mid-chart #" + d.Locale.replaceAll(" ", ""))
                    .style("opacity", 1)
                    .style("stroke", "black");
            }
            

            tooltip_box.style("visibility", "visible");
            tooltip_text1.style("visibility", "visible");
            tooltip_text2.style("visibility", "visible");
            tooltip_text3.style("visibility", "visible");
        })
        .on("mouseleave", function(event, d) {
            d3.selectAll("#main-chart circle")
                .attr("r", 3)
                .style("opacity", d => selected_colleges.includes(d.Name) ? 1 : 0.8)
                .style("stroke", "none");

            d3.selectAll("#left-chart rect")
                .style("opacity", 1)
                .style("stroke", "none");
            d3.selectAll("#mid-chart rect")
                .style("opacity", 1)
                .style("stroke", "none");

            tooltip_box.style("visibility", "hidden");
            tooltip_text1.style("visibility", "hidden");
            tooltip_text2.style("visibility", "hidden");
            tooltip_text3.style("visibility", "hidden");
        })
        .on("mousemove", function(event, d) {
            let newx = (event.pageX - tooltip_width/2 + 30) - 300 - mainLeftMargin;
            let newy = (event.pageY - tooltip_height - 10) - mainBottomMargin - titleHeight;
            newy = (newy < 10) ? newy + 100 : newy - 10;

            if(newx < 10) {
                newx = 10;
            }

            tooltip
                .attr('transform', 'translate(' + newx + ', ' + newy + ')');

            tooltip_text1
                .text(d.Name.substring(0, 45));
            tooltip_text2
                .text(main_y_var + ": " + (+d[main_y_var]));
            tooltip_text3
                .text(main_x_var + ": " + (Math.round((+d[main_x_var]) * 10000) / 100 ) + "%");
                
        });

    

    let XAxis = group.append("g")
            .attr("transform", `translate(0, ${mainHeight})`)
            .attr("id", "main-bottom-axis");
        XAxis
            .call(d3.axisBottom(x_scale))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", 16);
        XAxis
            .append("text")
            .attr("id", "main-bottom-axis-title")
            .attr("x", mainWidth / 2)
            .attr("y", 45)
            .style("fill", "black")
            .style("font-size", 16)
            .text(main_x_var);

    let YAxis = group.append("g");
        YAxis
            .call(d3.axisLeft(y_scale))
            .attr("id", "main-left-axis");
        YAxis
            .append("text")
            .attr("id", "main-left-axis-title")
            .style("fill", "black")
            .style("font-size", 16)
            .attr('transform', 'rotate(-90)')
            .attr("x", -mainHeight / 2)
            .attr("y", -60)
            .style("text-anchor", "middle")
            .text(main_y_var)

    let mainLegend = d3.legendColor()
        .scale(color_scale)
        //.labels(d => d.generatedLabels[d.i].substr(d.generatedLabels[d.i].lastIndexOf(".") + 1))
        //.title("Region")

        
    group.append("g")
        .attr("transform", "translate(" + (mainWidth + 30) + "," + 0 +")")
        .attr("id", "main-legend")
        .classed("legend_class", false)
        .call(mainLegend);

    // group.append("text")
    //     .attr("id", "main-title")
    //     .attr("x", mainWidth / 2)
    //     .attr("y", mainTopMargin)
    //     .style("text-anchor", "middle")
    //     .style("font-size", 20)
    //     .text(main_x_var + " VS " + main_y_var);

}
///////////////////////
/////////////////////// Update Main Plot
///////////////////////
///////////////////////
function updateMainplot(dta, transition = false) {
    let x_scale = d3.scaleLinear()
            .domain([0, d3.max(dta, d => d[main_x_var])])
            .range([0, mainWidth]);

    let y_scale = d3.scaleLinear()
            .domain([0, d3.max(dta, d => +d[main_y_var])])
            .range([mainHeight, 0]);

    let color_scale = null;
    if(current_legend == 'Region') {
        color_scale = d3.scaleOrdinal()
            .domain(regions)
            .range(region_colors);
    } else {
        color_scale = d3.scaleOrdinal()
            .domain(locales)
            .range(locale_colors);
    }

    if(transition) {
        d3.select("#main-chart")
            .selectAll("circle")
            .data(dta)
            .join("circle")
            .transition()
            .duration(500)
            .attr("cx", d => x_scale(+d[main_x_var]))
            .attr("cy", d => y_scale(+d[main_y_var]))
            .attr("r", d => 3)
            .attr("id", d => d.Region.replaceAll(" ", ""))
            .attr("class", d => d.Locale.replaceAll(" ", ""))
            .style("fill", function(d) {
                if(selected_colleges.length == 0)
                    return color_scale(d[current_legend]);
                return selected_colleges.includes(d.Name) ? color_scale(d[current_legend]) : "black";
            })
            .style("opacity", d => selected_colleges.includes(d.Name) ? 1 : 0.8);
    } else {
        d3.select("#main-chart")
            .selectAll("circle")
            .data(dta)
            .join("circle")
            .attr("cx", d => x_scale(+d[main_x_var]))
            .attr("cy", d => y_scale(+d[main_y_var]))
            .attr("r", d => 3)
            .attr("id", d => d.Region.replaceAll(" ", ""))
            .attr("class", d => d.Locale.replaceAll(" ", ""))
            .style("fill", function(d) {
                if(selected_colleges.length == 0)
                    return color_scale(d[current_legend]);
                return selected_colleges.includes(d.Name) ? color_scale(d[current_legend]) : "black";
            })
            .style("opacity", d => selected_colleges.includes(d.Name) ? 1 : 0.8);
    }
    
    d3.selectAll("#main-chart circle")
        .sort(function(a, b) {
            if (selected_colleges.includes(a.Name)) {
                return 1; // bring selected circle to front
            } else {
                return -1; // keep other circles behind
            }
        });

    d3.select("#main-bottom-axis")
        .call(d3.axisBottom(x_scale))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", 16);

    d3.select("#main-bottom-axis-title")
        .text(main_x_var);

    d3.select("#main-left-axis")
        .call(d3.axisLeft(y_scale));

    d3.select("#main-left-axis-title")
        .text(main_y_var);

    if(current_legend == "Region") {
        let mainLegend = d3.legendColor()
            .scale(color_scale)
            //.labels(d => d.generatedLabels[d.i].substr(d.generatedLabels[d.i].lastIndexOf(".") + 1))
            //.title("Region");
        
        d3.select("#main-legend")
            .classed("legend_class", false)
            .call(mainLegend);
    } else {
        let mainLegend = d3.legendColor()
            .scale(color_scale)
            //.labels(d => d.generatedLabels[d.i].substr(d.generatedLabels[d.i].lastIndexOf(".") + 1))
            //.title("Locale");
        
        d3.select("#main-legend")
            .classed("legend_class", true)
            .call(mainLegend);
    }
}
//////////////////////////////////////////////
////////////////////////////////////////////// Bar Chart
//////////////////////////////////////////////
//////////////////////////////////////////////
function createBarchart(raw_dta) {

    let variable = main_y_var;

    let dta = [];

    for (const [key, value] of d3.group(d3.filter(raw_dta, d => d[variable] > 0), d => d.Region)) {
        let j = `{"Region":"${key}", "${variable}":"${d3.mean(value, d => d[variable])}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }

    let group = d3.select("#left_group")
        .attr('transform', 'translate(' + leftLeftMargin + ', ' + leftTopMargin + ')');

    let tooltip_width = 155;
    let tooltip_height = 50;
    const tooltip = d3.select("#left_svg")
        .append("g");
    let tooltip_box = tooltip
        .append("rect")
        //.style("opacity", 0)
        .style("visibility", "hidden")
        .attr("class", "tooltip")
        .style("fill", "white")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", tooltip_width)
        .attr("height", tooltip_height)
        .style("rx", 5)
        .style("stroke", "black")
        .style("padding", "5px");
    let tooltip_text1 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 25 + ")");
    let tooltip_text2 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 39 + ")");
    let tooltip_text3 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 53 + ")");


    let x_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d[variable]/2), d3.max(dta, d => +d[variable]) + 2])
            .range([0, leftWidth]);

    let y_scale = d3.scaleBand()
        .domain(regions)
        .range([0, leftHeight])
        .padding(0);

    let color_scale = d3.scaleOrdinal()
        .domain(regions)
        .range(region_colors);

    group
        .append("g")
        .attr("id", "left-chart")
        .selectAll("rect")
        .data(dta)
        .enter("rect")
        .append("rect")
        .attr("x", 0)
        .attr("y", d => y_scale(d.Region))
        .attr("height", y_scale.bandwidth())
        .attr("width", d => x_scale(+d[variable]))
        .style("fill", d => color_scale(d.Region))
        .attr("id", d => d.Region.replaceAll(" ", ""))
        .on("mouseover", function(event, d) {
            
            d3.selectAll("#left-chart rect")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0);

            d3.selectAll("#main-chart #" + d.Region.replaceAll(" ", ""))
                .style("opacity", 0.8)
                .style("stroke", "black");

            tooltip_box.style("visibility", "visible");
            tooltip_text1.style("visibility", "visible");
            tooltip_text2.style("visibility", "visible");
            tooltip_text3.style("visibility", "visible");
        
        })
        .on("mousemove", function(event, d) {
            let newx = (event.pageX - tooltip_width/2 - 15);
            let newy = (event.pageY - tooltip_height - 10) - leftBottomMargin - mainTotalHeight - titleHeight;
            newy = (newy < 10) ? newy + 100 : newy - 10;

            if(newx < 10) {
                newx = 10;
            }
            if(newx > leftWidth - tooltip_width/2 - leftRightMargin) {
                newx = leftWidth - tooltip_width/2 - leftRightMargin;
            }

            tooltip
                .attr('transform', 'translate(' + newx + ', ' + newy + ')');

            tooltip_text1
                .text("Region: " + d.Region);
            tooltip_text2
                .text("# Nonzero Colleges: " + d[Object.keys(d)[2]]);
            tooltip_text3
                .text("Avg: " + (+d[Object.keys(d)[1]]).toFixed(4));
        })
        .on("mouseleave", function() {
            d3.selectAll("#left-chart rect")
                .style("opacity", 1)
                .style("stroke", "none");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0.8)
                .style("stroke", "none");

            tooltip_box.style("visibility", "hidden");
            tooltip_text1.style("visibility", "hidden");
            tooltip_text2.style("visibility", "hidden");
            tooltip_text3.style("visibility", "hidden");
        });


    let XAxis = group.append("g")
            .attr("transform", `translate(0, ${leftHeight})`)
            .attr("id", "left-bottom-axis");
        XAxis
            .call(d3.axisBottom(x_scale).ticks(3))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", 16);
        XAxis
            .append("text")
            .attr("id", "left-bottom-axis-title")
            .attr("x", leftWidth / 2)
            .attr("y", 45)
            .style("fill", "black")
            .style("font-size", 16)
            .text("Avg " + variable + " by Region");

    let YAxis = group.append("g");
        YAxis
            .call(d3.axisLeft(y_scale))
            .attr("id", "left-left-axis");

    tooltip.raise();

}
///////////////////////
/////////////////////// Update Bar Chart
///////////////////////
///////////////////////
function updateBarchart(raw_dta) {
    let variable = main_y_var;

    let dta = [];

    for (const [key, value] of d3.group(d3.filter(raw_dta, d => d[variable] > 0), d => d.Region)) {
        let j = `{"Region":"${key}", "${variable}":"${d3.mean(value, d => d[variable])}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }

    let x_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d[variable]/2), d3.max(dta, d => +d[variable])])
            .range([0, leftWidth]);

    let y_scale = d3.scaleBand()
        .domain(regions)
        .range([0, leftHeight])
        .padding(0);

    let color_scale = d3.scaleOrdinal()
        .domain(regions)
        .range(region_colors);
    
    d3.select("#left-chart")
        .selectAll("rect")
        .data(dta)
        .join("rect")
        .transition()
        .duration(500)
        .attr("x", 0)
        .attr("y", d => y_scale(d.Region))
        .attr("height", y_scale.bandwidth())
        .attr("width", d => x_scale(+d[variable]))
        .style("fill", d => color_scale(d.Region));

    d3.select("#left-bottom-axis")
        .call(d3.axisBottom(x_scale).ticks(3));

    d3.select("#left-bottom-axis-title")
        .text("Avg " + variable + " by Region");
    
}

//////////////////////////////////////////////
////////////////////////////////////////////// Mid Chart
//////////////////////////////////////////////
//////////////////////////////////////////////
function createMidchart(raw_dta) {

    let variable = main_y_var;

    let dta = [];

    for (const [key, value] of d3.group(d3.filter(raw_dta, d => d[variable] > 0), d => d.Locale)) {
        let j = `{"Locale":"${key}", "${variable}":"${d3.mean(value, d => d[variable])}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }
    // dta.push(JSON.parse(`{"Locale":"Other", "${variable}":"NA", "Number":"0"}`));
    console.log(dta);
    let group = d3.select("#right_group")
        .attr('transform', 'translate(' + (rightLeftMargin)  + ', ' + (rightTopMargin) + ')');


    let tooltip_width = 155;
    let tooltip_height = 50;
    const tooltip = d3.select("#right_svg")
        .append("g");
    let tooltip_box = tooltip
        .append("rect")
        //.style("opacity", 0)
        .style("visibility", "hidden")
        .attr("class", "tooltip")
        .style("fill", "white")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", tooltip_width)
        .attr("height", tooltip_height)
        .style("rx", 5)
        .style("stroke", "black")
        .style("padding", "5px");
    let tooltip_text1 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 25 + ")");
    let tooltip_text2 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 39 + ")");
    let tooltip_text3 = tooltip  
        .append("text")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 53 + ")");


    let x_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d[variable]/2), d3.max(dta, d => +d[variable]) + 2])
            .range([0, rightWidth]);

    let y_scale = d3.scaleBand()
        .domain(locales)
        .range([0, rightHeight])
        .padding(0);

    let color_scale = d3.scaleOrdinal()
        .domain(locales)
        .range(locale_colors);

    group
        .append("g")
        .attr("id", "mid-chart")
        .selectAll("rect")
        .data(dta)
        .enter("rect")
        .append("rect")
        .attr("x", 0)
        .attr("y", d => y_scale(d.Locale))
        .attr("height", y_scale.bandwidth())
        .attr("width", d => x_scale(+d[variable]))
        .style("fill", d => color_scale(d.Locale))
        .attr("id", d => d.Locale.replaceAll(" ", ""))
        .on("mouseover", function(event, d) {
            
            d3.selectAll("#mid-chart rect")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0);

            d3.selectAll("#main-chart ." + d.Locale.replaceAll(" ", ""))
                .style("opacity", 0.8)
                .style("stroke", "black");

            tooltip_box.style("visibility", "visible");
            tooltip_text1.style("visibility", "visible");
            tooltip_text2.style("visibility", "visible");
            tooltip_text3.style("visibility", "visible");
        
        })
        .on("mousemove", function(event, d) {
            let newx = (event.pageX - tooltip_width/2 - 45) - leftTotalWidth - midTotalWidth;
            let newy = (event.pageY - tooltip_height - 10) - rightBottomMargin - rightTotalHeight - titleHeight;
            newy = (newy < 10) ? newy + 100 : newy - 10;

            if(newx > rightWidth - tooltip_width/2) {
                newx = rightWidth - tooltip_width/2;
            }

            tooltip
                .attr('transform', 'translate(' + newx + ', ' + newy + ')');

            tooltip_text1
                .text("Locale: " + d.Locale);
            tooltip_text2
                .text("# Nonzero Colleges: " + d[Object.keys(d)[2]]);
            tooltip_text3
                .text("Avg: " + (+d[Object.keys(d)[1]]).toFixed(4));
        })
        .on("mouseleave", function() {
            d3.selectAll("#mid-chart rect")
                .style("opacity", 1)
                .style("stroke", "none");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0.8)
                .style("stroke", "none");

            tooltip_box.style("visibility", "hidden");
            tooltip_text1.style("visibility", "hidden");
            tooltip_text2.style("visibility", "hidden");
            tooltip_text3.style("visibility", "hidden");
        });


    let XAxis = group.append("g")
            .attr("transform", `translate(0, ${rightHeight})`)
            .attr("id", "mid-bottom-axis");
        XAxis
            .call(d3.axisBottom(x_scale).ticks(3))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", 16);
        XAxis
            .append("text")
            .attr("id", "mid-bottom-axis-title")
            .attr("x", rightWidth / 2)
            .attr("y", 45)
            .style("fill", "black")
            .style("font-size", 16)
            .text("Avg " + variable + " by Locale");

    let YAxis = group.append("g");
        YAxis
            .call(d3.axisLeft(y_scale))
            .attr("id", "mid-left-axis");

    tooltip.raise();

}
///////////////////////
/////////////////////// Update Mid Chart
///////////////////////
///////////////////////
function updateMidchart(raw_dta) {
    let variable = main_y_var;

    let dta = [];

    for (const [key, value] of d3.group(d3.filter(raw_dta, d => d[variable] > 0), d => d.Locale)) {
        let j = `{"Locale":"${key}", "${variable}":"${d3.mean(value, d => d[variable])}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }

    let x_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d[variable]/2), d3.max(dta, d => +d[variable])])
            .range([0, rightWidth]);

    let y_scale = d3.scaleBand()
        .domain(locales)
        .range([0, rightHeight])
        .padding(0);

    let color_scale = d3.scaleOrdinal()
        .domain(locales)
        .range(locale_colors);
    
    d3.select("#mid-chart")
        .selectAll("rect")
        .data(dta)
        .join("rect")
        .transition()
        .duration(500)
        .attr("x", 0)
        .attr("y", d => y_scale(d.Locale))
        .attr("height", y_scale.bandwidth())
        .attr("width", d => x_scale(+d[variable]))
        .style("fill", d => color_scale(d.Locale))
        .attr("id", d => d.Locale.replaceAll(" ", ""));

    d3.select("#mid-bottom-axis")
        .call(d3.axisBottom(x_scale).ticks(3));

    d3.select("#mid-bottom-axis-title")
        .text("Avg " + variable + " by Locale");
    
}

//////////////////////////////////////////////
////////////////////////////////////////////// Right Chart
//////////////////////////////////////////////
//////////////////////////////////////////////
function createRightchart(raw_dta) {

    let dta = [];
    let total_colleges = raw_dta.length;
    for (const [key, value] of d3.group(raw_dta, d => d[current_legend])) {
        let j = `{"Variable":"${key}", "Percent":"${value.length / total_colleges * 100}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }
    dta.sort((a, b) => b.Percent - a.Percent);
    console.log(dta);
    let group = d3.select("#mid_group")
        .attr('transform', 'translate(' + (midLeftMargin)  + ', ' + (midTopMargin) + ')');
    let correct_order = Array.from(new Set(d3.map(dta, d => d.Variable)));
    
    let color_scale = null;
    if(current_legend == 'Region') {
        color_scale = d3.scaleOrdinal()
            .domain(regions)
            .range(region_colors);
    } else {
        color_scale = d3.scaleOrdinal()
            .domain(locales)
            .range(locale_colors);
    }

    let y_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d["Percent"]/2), d3.max(dta, d => +d["Percent"]) + 2])
            .range([midHeight, 0]);

    let x_scale = d3.scaleBand()
        .domain(correct_order)
        .range([0, midWidth])
        .padding(0);

    let tooltip_width = 155;
    let tooltip_height = 50;
    const tooltip = d3.select("#mid_svg")
        .append("g")
        .attr("id", "mid_tooltip_group");
    let tooltip_box = tooltip
        .append("rect")
        .attr("id", "mid_tooltip_box")
        .style("visibility", "hidden")
        .attr("class", "tooltip")
        .style("fill", "white")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", tooltip_width)
        .attr("height", tooltip_height)
        .style("rx", 5)
        .style("stroke", "black")
        .style("padding", "5px");
    let tooltip_text1 = tooltip  
        .append("text")
        .attr("id", "mid_tooltip_text1")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 25 + ")");
    let tooltip_text2 = tooltip  
        .append("text")
        .attr("id", "mid_tooltip_text2")
        .style("visibility", "hidden")
        .text("tooltip text")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 39 + ")");
    let tooltip_text3 = tooltip  
        .append("text")
        .attr("id", "mid_tooltip_text3")
        .style("visibility", "hidden")
        .text("")
        .style("font-size", 12)
        .attr("transform", "translate(" + 18 +"," + 53 + ")");

    group
        .append("g")
        .attr("id", "right-chart-lines")
        .selectAll("line")
        .data(dta, d => d.Variable)
        .enter("line")
        .append("line")        
        .attr("x1", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("y1", midHeight)
        .attr("x2", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("y2", d => y_scale(d.Percent))
        .style("stroke", "black")
        .style("stroke-width", 1);

    group
        .append("g")
        .attr("id", "right-chart-circles")
        .selectAll("circle")
        .data(dta, d => d.Variable)
        .enter("circle")
        .append("circle")
        .attr("cx", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("cy", d => y_scale(d.Percent))
        .attr("r", 8)
        .style("fill", d => color_scale(d.Variable))
        .attr("id", "lollipop-circle")
        .on("mouseover", function(event, d) {
            
            d3.selectAll("#lollipop-circle")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0);

            if(current_legend == "Region") {
                d3.selectAll("#main-chart #" + d.Variable.replaceAll(" ", ""))
                    .style("opacity", 0.8)
                    .style("stroke", "black");
            } else {
                d3.selectAll("#main-chart ." + d.Variable.replaceAll(" ", ""))
                    .style("opacity", 0.8)
                    .style("stroke", "black");
            }
            

            tooltip_box.style("visibility", "visible");
            tooltip_text1.style("visibility", "visible");
            tooltip_text2.style("visibility", "visible");
            tooltip_text3.style("visibility", "visible");
        
        })
        .on("mousemove", function(event, d) {
            let newx = (event.pageX - tooltip_width/2 - 35) - leftTotalWidth;
            let newy = (event.pageY - tooltip_height - 10) - midBottomMargin - midTotalHeight - titleHeight;
            newy = (newy < 10) ? newy + 100 : newy - 10;
          
            tooltip
                .attr('transform', 'translate(' + newx + ', ' + newy + ')');

            tooltip_text1
                .text(current_legend + ": " + d.Variable);
            tooltip_text2
                .text("Percent: " + (+d["Percent"]).toFixed(4) + "%");
            tooltip_text3
                .text("# Colleges: " + d.Number);
        })
        .on("mouseleave", function() {
            d3.selectAll("#lollipop-circle")
                .style("opacity", 1)
                .style("stroke", "none");

            d3.selectAll("#main-chart circle")
                .style("opacity", 0.8)
                .style("stroke", "none");

            tooltip_box.style("visibility", "hidden");
            tooltip_text1.style("visibility", "hidden");
            tooltip_text2.style("visibility", "hidden");
            tooltip_text3.style("visibility", "hidden");
        });

    let XAxis = group.append("g")
        .attr("transform", `translate(0, ${midHeight})`)
        .attr("id", "right-bottom-axis");
    XAxis
        .call(d3.axisBottom(x_scale).ticks(3))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-30)")
        .style("font-size", 12);

    let YAxis = group.append("g");
    YAxis
        .call(d3.axisLeft(y_scale))
        .attr("id", "right-left-axis");
    YAxis
        .append("text")
        .attr("id", "right-left-axis-title")
        .style("fill", "black")
        .style("font-size", 16)
        .attr('transform', 'rotate(-90)')
        .attr("x", -midHeight / 2)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .text("Percent");

    group
        .append("text")
        .attr("id", "lollipop-title")
        .attr("x", midWidth/2)
        .attr("y", 10)
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .text("Percent of Colleges in each Group");


}
///////////////////////
/////////////////////// Update Right Chart
///////////////////////
///////////////////////
function updateRightchart(raw_dta) {
    let dta = [];
    let total_colleges = raw_dta.length;
    for (const [key, value] of d3.group(raw_dta, d => d[current_legend])) {
        let j = `{"Variable":"${key}", "Percent":"${value.length / total_colleges * 100}", "Number":"${value.length}"}`;
        j = JSON.parse(j);
        dta.push(j);
    }
    dta.sort((a, b) => b.Percent - a.Percent);
    //console.log(dta);

    let correct_order = Array.from(new Set(d3.map(dta, d => d.Variable)));

    let tooltip_width = 155;
    let tooltip_height = 50;
    let tooltip = d3.select("#mid_tooltip_group");
    let tooltip_box = d3.select("#mid_tooltip_box");
    let tooltip_text1 = d3.select("#mid_tooltip_text1");
    let tooltip_text2 = d3.select("#mid_tooltip_text2");
    let tooltip_text3 = d3.select("#mid_tooltip_text3");
    
    let color_scale = null;
    if(current_legend == 'Region') {
        color_scale = d3.scaleOrdinal()
            .domain(regions)
            .range(region_colors);
    } else {
        color_scale = d3.scaleOrdinal()
            .domain(locales)
            .range(locale_colors);
    }

    let y_scale = d3.scaleLinear()
            .domain([d3.min(dta, d => +d["Percent"]/2), d3.max(dta, d => +d["Percent"]) + 2])
            .range([midHeight, 0]);

    let x_scale = d3.scaleBand()
        .domain(correct_order)
        .range([0, midWidth])
        .padding(0);

    d3.select("#right-chart-lines")
        .selectAll("line")
        .data(dta, d => d.Variable)
        .join(
            function enter(enter) {
                return enter
                    .append("line")
                    .attr("x1", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
                    .attr("y1", midHeight)
                    .attr("x2", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
                    .attr("y2", midHeight)
                    .style("opacity", 1);
            },
            function update(update) {
                return update;
            },
            function exit(exit) {
                return exit
                    .transition()
                    .duration(1000)
                    .attr("y2", midHeight)
                    .remove();
            }
        )    
        .transition()
        .duration(1000)   
        .attr("x1", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("y1", midHeight)
        .attr("x2", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("y2", d => y_scale(d.Percent))
        .style("stroke", "black")
        .style("stroke-width", 1);

    d3.select("#right-chart-circles")
        .selectAll("circle")
        .data(dta, d => d.Variable)
        .join(
            function enter(enter) {
                return enter
                    .append("circle")
                    .attr("cx", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
                    .attr("cy", -100)
                    .attr("r", 8)
                    .style("fill", d => color_scale(d.Variable))
                    .attr("id", "lollipop-circle")
                    .on("mouseover", function(event, d) {
                        
                        d3.selectAll("#lollipop-circle")
                            .style("opacity", 0.3);
                        d3.select(this)
                            .style("opacity", 1)
                            .style("stroke", "black");
            
                        d3.selectAll("#main-chart circle")
                            .style("opacity", 0);
            
                        if(current_legend == "Region") {
                            d3.selectAll("#main-chart #" + d.Variable.replaceAll(" ", ""))
                                .style("opacity", 0.8)
                                .style("stroke", "black");
                        } else {
                            d3.selectAll("#main-chart ." + d.Variable.replaceAll(" ", ""))
                                .style("opacity", 0.8)
                                .style("stroke", "black");
                        }
                        
            
                        tooltip_box.style("visibility", "visible");
                        tooltip_text1.style("visibility", "visible");
                        tooltip_text2.style("visibility", "visible");
                        tooltip_text3.style("visibility", "visible");
                    
                    })
                    .on("mousemove", function(event, d) {
                        let newx = (event.pageX - tooltip_width/2 - 35) - leftTotalWidth;
                        let newy = (event.pageY - tooltip_height - 10) - midBottomMargin - midTotalHeight - titleHeight;
                        newy = (newy < 10) ? newy + 100 : newy - 10;
         
                        tooltip
                            .attr('transform', 'translate(' + newx + ', ' + newy + ')');
            
                        tooltip_text1
                            .text(current_legend + ": " + d.Variable);
                        tooltip_text2
                            .text("Percent: " + (+d["Percent"]).toFixed(4) + "%");
                        tooltip_text3
                            .text("# Colleges: " + d.Number);
                    })
                    .on("mouseleave", function() {
                        d3.selectAll("#lollipop-circle")
                            .style("opacity", 1)
                            .style("stroke", "none");
            
                        d3.selectAll("#main-chart circle")
                            .style("opacity", 0.8)
                            .style("stroke", "none");
            
                        tooltip_box.style("visibility", "hidden");
                        tooltip_text1.style("visibility", "hidden");
                        tooltip_text2.style("visibility", "hidden");
                        tooltip_text3.style("visibility", "hidden");
                    });
            },
            function update(update) {
                return update;
            },
            function exit(exit) {
                return exit
                    .transition()
                    .duration(1000)
                    .attr("cy", midHeight)
                    .style("opacity", 0)
                    .remove();
            }
        ) 
        .transition()
        .duration(1000)
        .attr("cx", d => x_scale(d.Variable) + x_scale.bandwidth()/2)
        .attr("cy", d => y_scale(d.Percent))
        .attr("r", 8)
        .style("opacity", 1)
        .style("fill", d => color_scale(d.Variable))
        .attr("id", "lollipop-circle");
        
    d3.select("#right-bottom-axis")
        .call(d3.axisBottom(x_scale).ticks(3))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-30)")
        .style("font-size", 12);

    d3.select("#right-left-axis")
        .call(d3.axisLeft(y_scale));
    d3.select("#right-left-axis-title")
        .style("fill", "black")
        .style("font-size", 16)
        .attr('transform', 'rotate(-90)')
        .attr("x", -midHeight / 2)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .text("Percent");
}