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

        'dijit/registry',

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

        registry,

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
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa Vital Events report</h3> <br><div class="well well-sm">The Addis Ababa city current population as registered by VERA is ' + totalPopulation + '</div>';
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
                // var populationLegend = new Legend({
                //     chart: chart
                // }, "pieChartLegendDiv");

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
        $('#layerListCollapse #population').click(
            function () {
                if (subcitiesData.length === 0) {
                    dom.byId('reportHeader').innerHTML = "<h3>No population data found!</h3>";
                    return;
                }
                $('#barChartDiv').width("auto");

                resetReportContent();
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa population report</h3> <br><div class="well well-sm">The Addis Ababa city current population as registered by VERA is ' + totalPopulation + '</div>';
                var tableHead = "<div class='table-responsive '> <table class='table table-hover table-bordered'>";
                var tableBody = "<tr><td><b><b>Subcity Name</b></td><td><b>Population</b></td></tr>";
                subcitiesData.forEach(function (subcity) {
                    tableBody += "<tr><td>" + subcity.name + "</td><td>" + subcity.population + "</td></tr>";
                }, this);
                var tableFooter = "</table></div>";
                dom.byId('tableDiv').innerHTML = tableHead + tableBody + tableFooter;

                console.log(chart);
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
                // var populationLegend = new Legend({
                //     chart: chart
                // }, "pieChartLegendDiv");

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
        //Listen to the Sex link click 
        $('#layerListCollapse #sex').click(
            function () {
                if (subcitiesData.length === 0) {
                    dom.byId('reportHeader').innerHTML = "<h3>No population data found!</h3>";
                    return;
                }
                $('#barChartDiv').width("auto");
                resetReportContent();
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa Sex Distribution report</h3> <br><div class="well well-sm">The Addis Ababa city current population as registered by VERA is ' + totalPopulation + '<br>There are a total female of ' + femaleTotal + '<br> Male total of ' + maleTotal + '</dvi>';
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
                // var populationLegend = new Legend({
                //     chart: chart
                // }, "pieChartLegendDiv");

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
        //Listen to the Disability link click 
        $('#layerListCollapse #disability').click(
            function () {
                $('#barChartDiv').width("auto");
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa City Disability report</h3>';
            }
        );
        //Listen to the employment link click
        $('#layerListCollapse #employment').click(
            function () {
                $('#barChartDiv').width("auto");
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa City Employment report</h3>';
            }
        );

        //Custom Result Panel Links listener
        //Custom arda: populaion Links listener
        $('#aradaCollapse a').click(
            function () {
                dom.byId('reportHeader').innerHTML = '<h3>Addis Ababa City Arada Subcity Custom population report</h3>';
            }
        );
        //Custom arada: sex Links listener
        $('#aradaCollapse a').click(
            function () {
                renderSexReport('Arada');
            }
        );
        $('#boleCollapase a').click(
            function () {
                renderSexReport('Bole');
            }
        );
        $('#addisKetemaCollapse a').click(
            function () {
                renderSexReport('Addis Ketema');
            }
        );
        $('#nefasCollapase ').click(
            function () {
                renderSexReport('Nefas Silk Lafto');
            }
        );
        $('#lidetaCollapase a').click(
            function () {
                renderSexReport('Lideta');
            }
        );
        $('#kikosCollapase a').click(
            function () {
                renderSexReport('Kirkos');
            }
        );
        $('#yekaCollapase a').click(
            function () {
                renderSexReport('Yeka');
            }
        );
        $('#guleleCollapase a').click(
            function () {
                renderSexReport('Gulele');
            }
        );
        $('#akakiCollapase a').click(
            function () {
                renderSexReport('Akaki');
            }
        );
        $('#kolfeCollapase a').click(
            function () {
                renderSexReport('Kolfe - Keranio');
            }
        );

        //Custom subcity sex data presenter
        function renderSexReport(subcityName) {
            if (subcitiesData.length === 0) {
                dom.byId('reportHeader').innerHTML = "<h3>No Data found!</h3>";
                return;
            }
            resetReportContent();
            var chart = new Chart('pieChartDiv');
            // Apply a color theme to the chart.
            chart.setTheme(theme);

            chart.addPlot("default", {
                type: "Pie",
                radius: 150,
                markers: true,
                labelOffset: -5,
                labelStyle: "columns"
            });

            var pieChartData = [];
            subcitiesData.forEach(function (subcity) {
                if (subcity.name === subcityName) {
                    dom.byId('reportHeader').innerHTML = '<h3>' + subcityName + 'Vital Events report</h3> <br><div class="well well-sm">' + subcityName + ' Subcity current population as registered by VERA is ' + subcity.population + '<br>There are a total female of ' + subcity.female + '<br> Male total of ' + subcity.male + '</div>';

                    var malePercent = number.round(subcity.male / subcity.population * 100, 2);
                    console.log(malePercent);
                    var femalePercent = number.round(subcity.female / subcity.population * 100, 2);
                    var chartObject = {
                        y: femalePercent,
                        x: 'Female',
                        text: subcity.name + ' <br> ' + femalePercent + ' %<br>',
                        Tooltip: subcity.name + ' <br> ' + femalePercent + ' %<br>',
                    }
                    pieChartData.push(chartObject);
                    chartObject = {
                        y: malePercent,
                        x: 'Male',
                        text: 'Male' + ' <br> ' + malePercent + ' %<br>',
                        Tooltip: 'Male' + ' <br> ' + malePercent + ' %<br>',
                    }
                    pieChartData.push(chartObject);
                }
            }, this);

            chart.addSeries("PopulationSplit", pieChartData);
            console.log(pieChartData);
            defaultChartSetting(chart);

            chart.render();
            $('#barChartDiv').width("fit-content");
            //Display a barchar of subcity population
            var populationBarChart = new Chart("barChartDiv");
            populationBarChart.setTheme(theme);
            populationBarChart.addPlot("default", {
                type: "Columns",
                gap: 10,
            });
            var chartNameList = [{
                value: 1,
                text: 'Female'
            }, {
                value: 2,
                text: 'Male'
            }];
            console.log(subcityNameList);
            console.log(chartNameList);
            populationBarChart.addAxis('x', {
                labels: chartNameList
            });
            populationBarChart.addAxis('y', {
                vertical: true,
                min: 0,
            });
            var barChartData = [];
            subcitiesData.forEach(function (subcity) {
                if (subcity.name === 'Arada') {
                    // var malePercent = number.round(subcity.male / subcity.population * 100, 2);
                    // var femalePercent = number.round(subcity.female / subcity.population * 100, 2);
                    var chartObject = {
                        y: subcity.female,
                        X: 1,
                        text: 'Female' + ' <br> ' + subcity.female + ' %<br>',
                        Tooltip: 'Female' + ' <br> ' + subcity.female + ' %<br>',
                    }
                    barChartData.push(chartObject);
                    chartObject = {
                        y: subcity.male,
                        X: 2,
                        text: 'Male' + ' <br> ' + subcity.male + ' %<br>',
                        Tooltip: 'Male' + ' <br> ' + subcity.male + ' %<br>',
                    }
                    barChartData.push(chartObject);
                }
            }, this);
            //console.log($('#barChartDiv').width());

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
        //Resets the content of report body
        function resetReportContent() {
            dom.byId("pieChartDiv").innerHTML = "";
            //dom.byId("pieChartLegendDiv").innerHTML = "";
            dom.byId("barChartDiv").innerHTML = "";
            dom.byId("tableDiv").innerHTML = "";
            dom.byId("tableDiv").innerHTML = "";
        }
    });