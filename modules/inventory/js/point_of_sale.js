/* global PRODUCTS_URL */

// $('table').hide();
$(document).ready(function () {

    var itemIndex = 0;

    $("#add-item").click(function addRow(){

        var content = getContent(itemIndex);

        $("#pos").append(content);

        itemIndex++;

        mapselect(itemIndex);

    });

    function getContent(currentIndex){

        var index = currentIndex + 1;

        var name = "details["+index+"][product]";

        var quantity = "details["+index+"][quantity]";

        var price = "details["+index+"][price]";

        var amount = "details["+index+"][amount]";

        var round_up = "details["+index+"][round_up]";

        var total = "details["+index+"][total]";

        return "<div id='item-"+index+"' class='col-md-12'>"+
                    "<div class='col-md-3'>"+
                        "<div class='form-group'>" +
                            "<select class='col-md-12' name="+name+" style='width: 95%'></select>"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-1'>"+
                        "<div class='form-group' style='padding: 0 15px;'>"+
                            "<input id='quantity-"+index+"' type='number' name="+quantity+" class='form-control quantity' />"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-2'>"+
                        "<div class='form-group' style='padding: 0 15px;'>"+
                            "<input id='price-"+index+"' type='number' name='"+price+"' readonly title='Cannot be edited' class='form-control'/>"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-2'>"+
                        "<div class='form-group' style='padding: 0 15px;'>"+
                            "<input id='amount-"+index+"' type='number' step='0.01' readonly title='Cannot be edited' name='"+amount+"' class='form-control'/>"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-1'>"+
                        "<div class='form-group' style='padding: 0 15px;'>"+
                            "<input id='round_up-"+index+"' type='number' step='0.01' readonly title='Cannot be edited' name='"+round_up+"' class='form-control'/>"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-2'>"+
                        "<div class='form-group' style='padding: 0 15px;'>"+
                            "<input id='total-"+index+"' type='number' name='"+total+"' class='form-control total' />"+
                        "</div>"+
                    "</div>"+

                    "<div class='col-md-1'>"+
                        "<button value="+index+" type='button' class='btn btn-sm btn-danger remove'><i class='fa fa-trash-o'></i></button>"+
                    "</div>"+
                "</div>";
    }

    $("body").on("click", ".remove", function () {
        var index = $(this).val();

        var total = $("#total-"+index).val();

        var grandTotal = $("#grand-total").html();

        if(!total || isNaN(total))
        {
            total = 0;
        }

        $("#item-" + index).remove();

        grandTotal = parseFloat(grandTotal) - parseFloat(total);

        $("#grand-total").html(grandTotal);
    });

    function mapselect(index) {

        $("#item-" + index + " select").select2({
            "theme": "bootstrap",
            "placeholder": 'Search for an item',
            "formatNoMatches": function () {
                return "No matches found";
            },
            "allowClear": true,
            "ajax": {
                "url": PRODUCTS_URL,
                "dataType": "json",
                "data": function (term, page) {
                    return term;
                },
                "results": function (data, page) {
                    return {results: data};
                }
            }
        });

        $("#item-" + index + " select").on("select2:select", function(e){

            var selected = $(this).find("option:selected");

            var price = selected.data().data.cash_price;
            var stock = selected.data().data.available;
            //
            // $('#fb' + i).attr('available', in_stock);
            $("input[name='details[" + index + "][price]']").val(price);
            // calculate_total();
        });
    }
    mapselect(itemIndex);
});