/* global EVALUATION_INDEX_URL */
/* global EVALUATION_STORE_URL */

$(function () {
    "use strict";

    /*
     * On page load, fetch the details of the dialysis chart
     */
    $.get({
        url: EVALUATION_INDEX_URL,
        success: function(data) {
            drawChart(data.chart);
        }
    });

    /*
     * On submitting the details of the anaesthetics form
     */
    $("#dialysis-fluid-form").submit(function(event){
        event.preventDefault();
        $.post({
            url: EVALUATION_STORE_URL,
            data: $(this).serialize(),
            success: function(data) {
                drawChart(data.chart);
                $("#dialysis-fluid-form")[0].reset();
            }
        });
    });

    function drawChart(chart)
    {
        var context = document.getElementById("dialysis-fluid-chart").getContext("2d");
        new Chart(context, {
            type: "line",
            data: {
                labels: chart.labels,
                datasets: [{
                    label: "Weight",
                    data: chart.weight,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0)"
                    ],
                    borderColor: [
                        "rgba(255,99,132,1)"
                    ],
                    borderWidth: 1
                }, {
                    label: "Dry Weight",
                    data: chart.dry,
                    backgroundColor: [
                        "rgba(46, 204, 113, 0)"
                    ],
                    borderColor: [
                        "rgba(46, 204, 113,1.0)"
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            steps: 20,
                            stepValue: 5,
                            max: 180,
                            min: 0
                        }
                    }]
                }
            }
        });
    }
});