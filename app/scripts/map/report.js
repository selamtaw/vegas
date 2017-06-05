var map;
require([
        'dojo/dom',
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/on',
        'dojo/_base/Color',
        'dojo/_base/lang',
        'dojo/number',
        'dojo/_base/array',
        'dojo/parser',

        'dojox/charting/Chart',
        'dojox/charting/widget/Legend',
        'dojox/charting/plot2d/Pie',
        'dojox/charting/plot2d/Columns',
        'dojox/grid/DataGrid',
        'dojox/grid/cells/dijit',
        'dojox/charting/themes/Bahamation',
        "dojox/charting/action2d/Highlight",
        "dojox/charting/action2d/Tooltip",
        "dojox/charting/action2d/MoveSlice",

        'esri/layers/FeatureLayer',
        'esri/tasks/query',
        'esri/tasks/QueryTask',

        'dojox/charting/plot2d/Markers',
        'dojox/charting/axis2d/Default',
        'dojo/domReady!'
    ],
    function (
        dom,
        domClass,
        domConstruct,
        on,
        Color,
        lang,
        number,
        array,
        parser,

        Chart,
        Legend,
        Pie,
        Columns,
        DataGrid,
        cells,
        theme,
        Highlight,
        Tooltip,
        MoveSlice,

        FeatureLayer,
        Query,
        QueryTask,
    ) {
        'use strict';
        //Initialize the analysis widget
        // var analysisWidget = new MapAnalysis({}, "analysisWidgetDiv");
        // analysisWidget.startup();
        parser.parse();
        console.log("I'm report");
        //capitalization of attributes name in the layer matters!
        //Addis Ababa city layer
        var addisAbabaLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/vegas/MapServer/2", {
            outFields: ["POPULATION", "MALE", "FEMALE"]
        });

        //School Layer,
        var schoolLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/vegas/MapServer/1", {
            outFields: ["*"]
        });

        //Health Centers Layer
        var healthCenterLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/vegas/MapServer/0", {
            outFields: ["*"]
        });

        //Ethiopia wereda layer
        var ethiopia_layer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/vegas/MapServer/3", {
            id: "Ethiopia-regions"
        });

        //Holds currently selected layer id
        var activeLayerId = null;
        var queryTask = new QueryTask("http://localhost:6080/arcgis/rest/services/vegas/MapServer/2");
        var query = new Query();
        var subcitiesData = [];
        var subcityNameList = []
        var totalPopulation = 0;
        var femaleTotal = 0;
        var maleTotal = 0;
        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = ["WOREDANAME", "POPULATION", "FEMALE", "MALE"];
        var queryDeferred = queryTask.execute(query);

        queryDeferred.then(function (result) {
            if (result.features.length === 0) {
                return;
            }
            subcitiesData = [];
            var featuresTemp = result.features;
            featuresTemp.forEach(function (subcity) {
                var subcityTemp = {
                    "name": subcity.attributes.WOREDANAME,
                    "female": subcity.attributes.FEMALE,
                    "male": subcity.attributes.MALE,
                    "population": subcity.attributes.POPULATION
                };
                totalPopulation += subcityTemp.population;
                femaleTotal += subcityTemp.female;
                maleTotal += subcityTemp.male;
                subcitiesData.push(subcityTemp);
                
            }, this);
            subcitiesData.forEach(function (subcity) {
                subcityNameList.push({
                    value: subcityNameList.length + 1,
                    text: subcity.name
                })
            }, this);
            console.log(subcitiesData);

        }, function (err) {
            console.log(err);
        });
        //Listen to the summary link click 
        $('#summary').click(
            function () {
                if (subcitiesData.length === 0) {
                    dom.byId('reportHeader').innerHTML = "<h3>No population data found!</h3>";
                    return;
                }
                resetReportContent();
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa Vital Events report</h3> <br>The Addis Ababa city current population as registered by VERA is ' + totalPopulation;
                var tableHead = "<div class='table-responsive '> <table class='table table-hover table-bordered'>";
                var tableBody = "<tr><td><b><b>Subcity Name</b></td><td><b>Male</b></td><td>Female</td><td>Total</td></tr>";
                subcitiesData.forEach(function (subcity) {
                    tableBody += "<tr><td>" + subcity.name + "</td><td>" + subcity.male + "</td><td>" + subcity.female + "</td><td>" + (subcity.male + subcity.female) + "</td></tr>";
                }, this);
                var tableFooter = "</table></div>";
                dom.byId('tableDiv').innerHTML = tableHead + tableBody + tableFooter;

                var chart = new Chart('pieChartDiv');
                // Apply a color theme to the chart.
                chart.setTheme(theme);

                chart.addPlot("default", {
                    type: "Pie",
                    radius: 150,
                    markers: true,
                    labelOffset: -20,
                    labelStyle: "columns"
                });

                var pieChartData = [];
                subcitiesData.forEach(function (subcity) {
                    var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                    var chartObject = {
                        y: subcity.population,
                        x: subcity.name,
                        text: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                        Tooltip: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                    }
                    pieChartData.push(chartObject);
                }, this);

                chart.addSeries("PopulationSplit", pieChartData);
                console.log(pieChartData);
                defaultChartSetting(chart);

                chart.render();
                //Set a legend for the chart
                var populationLegend = new Legend({
                    chart: chart
                }, "pieChartLegendDiv");

                //Display a barchar of subcity population
                var populationBarChart = new Chart("barChartDiv");
                populationBarChart.setTheme(theme);
                populationBarChart.addPlot("default", {
                    type: "Columns",
                    gap: 10,
                });

                populationBarChart.addAxis('x', {
                    labels: subcityNameList
                });
                populationBarChart.addAxis('y', {
                    vertical: true,
                    min: 0,
                });
                console.log(subcityNameList);
                var barChartData = [];
                subcitiesData.forEach(function (subcity) {
                    var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                    var chartObject = {
                        y: subcity.population,
                        X: barChartData.length + 1,
                        text: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                        Tooltip: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                    }
                    barChartData.push(chartObject);
                }, this);
                populationBarChart.addSeries("PopulationSplit", barChartData);
                defaultChartSetting(populationBarChart);
                populationBarChart.render();
                //sets default property for charts
                function defaultChartSetting(chart) {
                    new Tooltip(chart, "default");
                    new Highlight(chart, "default");
                    new MoveSlice(chart, "default");
                }
            }
        );
        //Listen to the population link click 
        $('#population').click(
            function () {
                if (subcitiesData.length === 0) {
                    dom.byId('reportHeader').innerHTML = "<h3>No population data found!</h3>";
                    return;
                }
                resetReportContent();
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa population report</h3> <br>The Addis Ababa city current population as registered by VERA is ' + totalPopulation;
                var tableHead = "<div class='table-responsive '> <table class='table table-hover table-bordered'>";
                var tableBody = "<tr><td><b><b>Subcity Name</b></td><td><b>Population</b></td></tr>";
                subcitiesData.forEach(function (subcity) {
                    tableBody += "<tr><td>" + subcity.name + "</td><td>" + subcity.population + "</td></tr>";
                }, this);
                var tableFooter = "</table></div>";
                dom.byId('tableDiv').innerHTML = tableHead + tableBody + tableFooter;

                var chart = new Chart('pieChartDiv');
                // Apply a color theme to the chart.
                chart.setTheme(theme);

                chart.addPlot("default", {
                    type: "Pie",
                    radius: 150,
                    markers: true,
                    labelOffset: -20,
                    labelStyle: "columns"
                });

                var pieChartData = [];
                subcitiesData.forEach(function (subcity) {
                    var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                    var chartObject = {
                        y: subcity.population,
                        x: subcity.name,
                        text: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                        Tooltip: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                    }
                    pieChartData.push(chartObject);
                }, this);

                chart.addSeries("PopulationSplit", pieChartData);
                console.log(pieChartData);
                defaultChartSetting(chart);

                chart.render();
                //Set a legend for the chart
                var populationLegend = new Legend({
                    chart: chart
                }, "pieChartLegendDiv");

                //Display a barchar of subcity population
                var populationBarChart = new Chart("barChartDiv");
                populationBarChart.setTheme(theme);
                populationBarChart.addPlot("default", {
                    type: "Columns",
                    gap: 10,
                });

                populationBarChart.addAxis('x', {
                    labels: subcityNameList
                });
                populationBarChart.addAxis('y', {
                    vertical: true,
                    min: 0,
                });
                console.log(subcityNameList);
                var barChartData = [];
                subcitiesData.forEach(function (subcity) {
                    var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                    var chartObject = {
                        y: subcity.population,
                        X: barChartData.length + 1,
                        text: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                        Tooltip: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                    }
                    barChartData.push(chartObject);
                }, this);
                populationBarChart.addSeries("PopulationSplit", barChartData);
                defaultChartSetting(populationBarChart);
                populationBarChart.render();
                //sets default property for charts
                function defaultChartSetting(chart) {
                    new Tooltip(chart, "default");
                    new Highlight(chart, "default");
                    new MoveSlice(chart, "default");
                }
            });
        //Listen to the school link click 
        $('#sex').click(
            function () {
                if (subcitiesData.length === 0) {
                    dom.byId('reportHeader').innerHTML = "<h3>No population data found!</h3>";
                    return;
                }
                resetReportContent();
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa Sex Distribution report</h3> <br>The Addis Ababa city current population as registered by VERA is ' + totalPopulation + '<br>There are a total female of ' + femaleTotal + '<br> Male total of ' + maleTotal;
                var tableHead = "<div class='table-responsive '> <table class='table table-hover table-bordered'>";
                var tableBody = "<tr><td><b><b>Subcity Name</b></td><td><b>Male</b></td><td>Female</td></tr>";
                subcitiesData.forEach(function (subcity) {
                    tableBody += "<tr><td>" + subcity.name + "</td><td>" + subcity.male + "</td><td>" + subcity.female + "</td></tr>";
                }, this);
                var tableFooter = "</table></div>";
                dom.byId('tableDiv').innerHTML = tableHead + tableBody + tableFooter;
                var chart = new Chart('pieChartDiv');

                // Apply a color theme to the chart.
                chart.setTheme(theme);

                chart.addPlot("default", {
                    type: "Pie",
                    radius: 150,
                    markers: true,
                    labelOffset: -20,
                    labelStyle: "columns"
                });

                var pieChartData = [];
                subcitiesData.forEach(function (subcity) {
                    var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                    var femalePercent = number.round(subcity.female / femaleTotal * 100, 2);
                    var malePercent = number.round(subcity.male / maleTotal * 100, 2);
                    var chartObject = {
                        y: subcity.male,
                        tooltip: subcity.name + ' : ' + malePercent + ' %',
                        text: subcity.name + ' : ' + malePercent + ' %'
                    }
                    pieChartData.push(chartObject);
                }, this);

                chart.addSeries("PopulationSplit", pieChartData);
                console.log(pieChartData);
                defaultChartSetting(chart);

                chart.render();
                //Set a legend for the chart
                var populationLegend = new Legend({
                    chart: chart
                }, "pieChartLegendDiv");

                // //Display a barchar of subcity population
                // var populationBarChart = new Chart("barChartDiv");
                // populationBarChart.setTheme(theme);
                // populationBarChart.addPlot("default", {
                //     type: "Columns",
                //     gap: 10,
                // });

                // populationBarChart.addAxis('x', {
                //     labels: subcityNameList
                // });
                // populationBarChart.addAxis('y', {
                //     vertical: true,
                //     min: 0,
                // });
                // var barChartData = [];
                // subcitiesData.forEach(function (subcity) {
                //     var populationPercent = number.round(subcity.population / totalPopulation * 100, 2);
                //     var chartObject = {
                //         y: subcity.population,
                //         X: barChartData.length + 1,
                //         text: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                //         Tooltip: subcity.name + ' <br> ' + populationPercent + ' %<br>',
                //     }
                //     barChartData.push(chartObject);
                // }, this);
                // populationBarChart.addSeries("PopulationSplit", barChartData);
                // defaultChartSetting(populationBarChart);
                // populationBarChart.render();
                //sets default property for charts
                function defaultChartSetting(chart) {
                    new Tooltip(chart, "default");
                    new Highlight(chart, "default");
                    new MoveSlice(chart, "default");
                }
            }
        );
        //Listen to the health link click 
        $('#disability').click(
            function () {
                dom.byId('reportHeader').innerHTML = '<h3>Hello, this is Disability report</h3>';
            }
        );
        //Listen to the employment link click
        $('#employment').click(
            function () {
                dom.byId('reportHeader').innerHTML = '<h3>Hello, this is Employment report</h3>';
            }
        );
        //Resets the content of report body
        function resetReportContent() {
            dom.byId("pieChartDiv").innerHTML = "";
            dom.byId("pieChartLegendDiv").innerHTML = "";
            dom.byId("barChartDiv").innerHTML = "";
            dom.byId("tableDiv").innerHTML = "";
            dom.byId("tableDiv").innerHTML = "";
        }
    });