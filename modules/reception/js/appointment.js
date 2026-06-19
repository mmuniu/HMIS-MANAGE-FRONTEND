/* global PATIENTS_URL */
$(function () {
    $("#patient").select2({
        tags: true,
        theme: "bootstrap",
        ajax: {
            url: PATIENTS_URL,
            dataType: "json",
            cache: true,
            data: function (term) {
                return {
                    term: term
                };
            },
            results: function (data) {
                return {results: data};
            }
        },
        formatNoMatches: function () {
            return "No matches found";
        },
        formatInputTooShort: function (input, min) {
            return "Please enter " + (min - input.length) + " more characters";
        },
        formatInputTooLong: function (input, max) {
            return "Please enter " + (input.length - max) + " less characters";
        },
        formatSelectionTooBig: function (limit) {
            return "You can only select " + limit + " items";
        },
        formatLoadMore: function (pageNumber) {
            return "Loading more results...";
        },
        formatSearching: function () {
            return "Searching...";
        },
        minimumInputLength: 2
    });











    // var active_tab = 0;
    // var active_category = 0;
    // var tables = null;
    // $('#new').click(function (e) {
    //     e.preventDefault();
    //     $('#newSchedule').modal('show');
    // });
    // $('#adds').click(function () {
    //     $('#newSchedule').modal('hide');
    // });
    // $(".prefetch").click(function () {
    //     active_tab = $(this).attr('sam-ajax');
    //     $("#all_cat").click();
    // });
    // function fetch_table() {
    //     $.ajax({
    //         url: GET_SCHEDULE,
    //         type: "GET",
    //         data: {'clinic': active_tab, 'category': active_category, 'start': $("#date1").val(), 'end': $('#date2').val(), 'doctor': $('#doctor').val()},
    //         success: function (data) {
    //             $('#appointments').html(data).fadeIn();
    //             if (tables)
    //             {
    //                 tables.destroy();
    //             }
    //             try {
    //                 tables = $('table').DataTable();
    //             } catch (e) {
    //             }
    //             alertify.success('<i class="fa fa-info"></i> Updated appointments');
    //         },
    //         error: function () {
    //             alertify.error('<i class="fa fa-warning"></i> Could not retrieve appointments');
    //         }
    //     });
    // }
    // $(".categories").click(function () {
    //     active_category = $(this).attr('sam-ajax2');
    //     fetch_table();
    // });
    //
    //
    //
    //
    // $('#clearBtn').click(function () {
    //     $("#date1").val('');
    //     $("#date2").val('');
    //     fetch_table();
    // });

});