/* global PRODUCTS_URL */

// $('table').hide();
$(document).ready(function () {

    $('.date').datepicker({minDate: "0"});

    var itemIndex = 0;

    $("#add-row").click(function addRow(){

        var content = getContent(itemIndex);

        $("#requisition-content").append(content);

        itemIndex++;

        mapselect(itemIndex);

    });

    function getContent(currentIndex){

        var index = currentIndex + 1;

        var id = "item-" + index;

        var name = "details["+index+"][product_id]";

        var quantity = "details["+index+"][quantity]";

        var price = "details["+index+"][price]";

        var total = "details["+index+"][total]";

        return "<div id="+id+" class='col-md-12'>"+
                    "<div class='col-md-5'>"+
                        "<div class='form-group'>" +
                            "<select class='col-md-12' name="+name+" style='width: 95%'></select>"+
                        "</div>"+
                    "</div>"+
                    "<div class='col-md-3'>"+
                        "<div class='form-group' style='margin-left: 1px; width: 180px;'>"+
                            "<input type='number' name="+quantity+" class='form-control' />"+
                        "</div>"+
                    "</div>"+
                    "<div class='col-md-3'>"+
                        "<div class='form-group' style='margin-left: 3px; width: 180px;'>"+
                            "<input type='number' name="+price+" class='form-control' />"+
                        "</div>"+
                    "</div>"+
                    // "<div class='col-md-3'>"+
                    //     "<div class='form-group' style='margin-left: 5px; width: 180px;'>"+
                    //         "<input type='number' name="+total+" class='form-control disabled' />"+
                    //     "</div>"+
                    // "</div>"+
                    "<div class='col-md-1'>"+
                        "<button value="+index+" type='button' class='btn btn-danger remove'><i class='fa fa-trash-o'></i></button>"+
                    "</div>"+
                "</div>";
    }

    $("body").on("click", ".remove", function (e) {
        $(".item-" + e.target.value).remove();
    });

    function mapselect(index) {

        $("#item-" + index + " select").select2({
            "theme": "bootstrap",
            "placeholder": 'Search for an item',
            "formatNoMatches": function () {
                return "No matches found";
            },
            // "formatInputTooShort": function (input, min) {
            //     return "Please enter " + (min - input.length) + " more characters";
            // },
            // "formatInputTooLong": function (input, max) {
            //     return "Please enter " + (input.length - max) + " less characters";
            // },
            // "formatSelectionTooBig": function (limit) {
            //     return "You can only select " + limit + " items";
            // },
            // "formatLoadMore": function (pageNumber) {
            //     return "Loading more results...";
            // },
            // "formatSearching": function () {
            //     return "Searching...";
            // },
            // "minimumInputLength": 2,
            "allowClear": true,
            "ajax": {
                "url": PRODUCTS_URL,
                "dataType": "json",
                "cache": true,
                "data": function (term, page) {
                    return {
                        term: term
                    };
                },
                "results": function (data, page) {
                    return {results: data};
                }
            }
        });

        // $('#addr' + i + ' select').on('select2:select', function (evt) {
        //     var selected = $(this).find('option:selected');
        //     var price = selected.data().data.prices.price;
        //     $('input[name=price' + i + ']').val(price);
        //     calculate_total();
        // });
        // $(".remove").click(function (e) {
        //     e.preventDefault();
        //     $(this).closest('tr').remove();
        // });
    }
    mapselect(itemIndex);
});