/* global EVALUATION_INDEX_URL */
/* global EVALUATION_STORE_URL */

$(function () {
    "use strict";

    var fluidsTable = $("#fluids-table").dataTable({
        ajax: {
            "url": EVALUATION_STORE_URL,
            "type": "GET",
            "dataSrc" : function (data) {
                return data.fluids;
            }
        },
        order: [],
        scrollY:        500,
        scrollX:        true,
        scrollCollapse: true,
        fixedColumns:   {
            leftColumns: 3
        },
        searching: false, paging: false, info: false
    });

    /*
     * On page load, fetch the details of the anaesthetics chart
     */
    $.get({
        url: EVALUATION_INDEX_URL,
        success: function(data) {
            drawChart(data.chart);
        }
    });

    $("body").on("click", ".anaesthetic", function(e){
        $("#anaesthetic").val($(this).attr("id"));
    });

    /*
     * On submitting the details of the anaesthetics form
     */
    $("#anaesthetics-form").submit(function(event){
        event.preventDefault();
        $.post({
            url: EVALUATION_STORE_URL,
            data: $(this).serialize(),
            success: function(data) {
                if($("#anaesthetic").val() == "fluid")
                {
                    fluidsTable.DataTable().ajax.reload();
                }
                else
                {
                    drawChart(data.chart);
                }
                $("#anaesthetics-form")[0].reset();
            }
        });
    });

    function drawChart(chart)
    {
        var context = document.getElementById("anaesthetics-chart").getContext("2d");
        new Chart(context, {
            type: "line",
            data: {
                labels: chart.labels,
                datasets: [{
                    label: "Systolic",
                    data: chart.systolic,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0)"
                    ],
                    borderColor: [
                        "rgba(255,99,132,1)"
                    ],
                    borderWidth: 1
                }, {
                    label: "Diastolic",
                    data: chart.diastolic,
                    backgroundColor: [
                        "rgba(46, 204, 113, 0)"
                    ],
                    borderColor: [
                        "rgba(46, 204, 113,1.0)"
                    ],
                    borderWidth: 1
                }, {
                    label: "Pulse",
                    data: chart.pulse,
                    backgroundColor: [
                        "rgba(52, 152, 219, 0)"
                    ],
                    borderColor: [
                        "rgba(52, 152, 219,1.0)"
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