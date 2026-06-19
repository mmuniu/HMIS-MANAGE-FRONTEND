/* global PRODUCTS_URL */

$(document).ready(function () {
    // shrink the sidebar for improved UX
    // $('body').addClass('sidebar-collapse');
    // alert user
    // $('.navbar-btn.sidebar-toggle').append('Click here for more space');
    // alertify.success("Sidebar Minimized for improved viewing.");

    var purchases = {
        "product": { size: 3, meta: "style='width: 100%'", field: "select" },
        "package_size": { size: 1, attr: 'number', default_value: 1 },
        "quantity": { size: 1, meta: "quantity", attr: 'number', default_value: 1 },
        "bonus": { size: 1, attr: 'number', default_value: 0, step: 0.01 },
        "expiry_date": { size: 2, meta: "datepicker" },
        "unit_cost": { size: 1,  meta: "unit_cost", attr: 'number', required: true, step: 0.01 },
        "discount": { size: 1, meta: "discount", attr: 'number', default_value: 0, step: 0.01 },
        "tax": { size: 1, meta: "tax", attr: 'number', default_value: 0, step: 0.01 },
        "total": { size: 1, attr: "number", step: 0.01, meta: "total", disabled: true }
    };

    $("body").on("focus", ".datepicker", function () {
        $(this).datepicker({
            dateFormat: "yy-mm-dd",
            minDate: 0
        });
    });

    var itemIndex = 0;

    $("#add-row").click(function addRow(){

        var content = getContent(itemIndex);

        $("#receive-content").append(content);

        itemIndex++;

        mapselect(itemIndex);

    });

    function getContent(currentIndex){

        var index = currentIndex + 1;

        // Use jquery objects. Very easy in maintenance and manipulation. EASSSSY!
        var content_container = $('<div></div>').attr('id', 'item-' + index).addClass('content-container');

        for(var purchase in purchases)
        {
            var column = $('<div></div>').addClass('col-md-' + purchases[purchase].size);
            var form_group = $('<div></div>').addClass('form-group');

            if(purchases[purchase].hasOwnProperty("field"))
            {
                var input = $('<select />').attr('name', 'purchases[' + index + '][' + purchase + ']')
                    .addClass('form-control ' + meta);
                form_group.append(input);
            }
            else
            {
                var meta = purchases[purchase].meta ? purchases[purchase].meta : "";

                var input = $('<input />').attr('name', 'purchases[' + index + '][' + purchase + ']')
                    .addClass('form-control ' + meta);

                purchases[purchase].attr !== undefined ? input.attr('type', purchases[purchase].attr) : "";

                purchases[purchase].default_value !== undefined ? input.val(purchases[purchase].default_value) : "";

                purchases[purchase].required !== undefined ? input.attr('required', purchases[purchase].required) : "";

                purchases[purchase].step !== undefined ? input.attr('step', purchases[purchase].step) : "";

                purchases[purchase].disabled !== undefined ? input.attr('disabled', purchases[purchase].disabled) : "";

                form_group.append(input);
            }

            column.append(form_group);
            content_container.append(column);
        }

        return content_container;
    }

    function mapselect(index) {

        $("#item-" + index + " select").select2({
            "theme": "bootstrap",
            "placeholder": "Search for an item",
            "formatNoMatches": function () {
                return "No matches found";
            },
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
    }
    mapselect(itemIndex);


    /*
     * calculating the totals
     */
    $("body #receive-content").on("keyup", ".tax", total);
    $("body #receive-content").on("keyup", ".discount", total);
    $("body #receive-content").on("keyup", ".quantity", total);
    $("body #receive-content").on("keyup", ".unit_cost", total);

    /*
     * calculates the total across a given row
     */
    function total(event)
    {
        var total = 0;

        var target = $(event.target).closest(".content-container");

        var quantity = parseFloat(target.find(".quantity").val());

        var unit_cost = parseFloat(target.find(".unit_cost").val());

        var tax = parseFloat(target.find(".tax").val()) / 100;

        var discount = parseFloat(target.find(".discount").val()) / 100;

        if(!isNaN(quantity) && !isNaN(unit_cost))
        {
            total = quantity * unit_cost;

            if(discount > 0)
            {
                total = total - (discount * total);
            }

            if(tax > 0)
            {
                total = total + (tax * total);
            }
        }

        target.find(".total").val(total);

        total = isNaN(total) ? 0 : total;

        grandTotal();
    }

    /*
     * calculates the total across a given row
     */
    function grandTotal()
    {
        var grandTotal = 0;

        $(".total").each(function(index, element){

            if(!isNaN(element.value))
            {
                grandTotal += parseFloat(element.value);
            }

        });

        $(".grand-total").val(grandTotal);
        $("#grand-total").html(grandTotal);
    }
});