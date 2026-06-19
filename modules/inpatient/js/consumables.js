/*
 * =========================================================================
 * consumables settings
 * =========================================================================
 * */

/* global CONSUMABLE_PRODUCTS_URL, DONE_CONSUMABLE_URL, USER_ID, VISIT_ID, alertify*/

$(function () {
    var target_table = $('#consumables_table');

    target_table.dataTable({
        ajax: DONE_CONSUMABLE_URL,
        responsive: true
    });

    // check select event
    var consumable_select = $('.consumable-select');
    selectize(consumable_select);

    $('#department_id').on('change', function() {
        // consumable_select.trigger('change');
        // selectize(consumable_select);
        // consumable_select.val(null).select2("destroy");
        // console.log('consu 2 : ', consumable_select.val());

        // due to the above not working with select2, it's easier to refresh page
        if (consumable_select.val() != null) {
            window.location.reload();
        }
    });

    // update prices on select change
    $('.consumable-select').on('select2:select', function (e) {
        var selected = $(this).find('option:selected');
        var consumable_data = selected.data().data;

        var price = PAYMENT_METHOD == 'cash' ? consumable_data.selling_price : consumable_data.insurance_price;
        $('#price').val(price);
        $('#quantity').val(1);
        $('#amount').val(price);
        $('#consumable_store_id').val(consumable_data.store);
    });

    // check price input change
    $('#quantity').on('change', function() {
        $('#amount').val(parseFloat($('#price').val()) * parseFloat($(this).val()));
    });

    // submit form
    $('#consumable_form').submit(function (e) {
        e.preventDefault();
        var _this = $(this);
        _this.find('button[type="submit"]').html('<i class="fa fa-spinner fa-spin"></i> Saving...');
        $.ajax({
            type: "POST",
            url: CONSUMABLE_URL,
            data: _this.serialize(),
            success: function () {
                alertify.success('<i class="fa fa-check-circle"></i> Patient consumable updated');
                _this.find('button[type="submit"]').html('<i class="fa fa-save"></i> Save');
                _this.trigger('reset');
                target_table.dataTable().api().ajax.reload();
            },
            error: function () {
                _this.html('<i class="fa fa-save"></i>Save');
                alertify.error('<i class="fa fa-check-warning"></i> Could not save consumable');
            }
        });
    });

    // selectize the element
    function selectize(el)
    {
        el.select2({
            "theme": "classic",
            "placeholder": 'Please select an item',
            "formatNoMatches": function () {
                return "No matches found";
            },
            "formatInputTooShort": function (input, min) {
                return "Please enter " + (min - input.length) + " more characters";
            },
            "formatInputTooLong": function (input, max) {
                return "Please enter " + (input.length - max) + " less characters";
            },
            "formatSelectionTooBig": function (limit) {
                return "You can only select " + limit + " items";
            },
            "formatLoadMore": function (pageNumber) {
                return "Loading more results...";
            },
            "formatSearching": function () {
                return "Searching...";
            },
            "minimumInputLength": 2,
            "allowClear": true,
            "ajax": {
                "url": CONSUMABLE_PRODUCTS_URL,
                "dataType": "json",
                "cache": true,
                "data": function (term, page) {
                    return {
                        term: term,
                        clinic: $("#department_id").val()
                    };
                },
                "results": function (data, page) {
                    return { results: data };
                }
            }
        });
    }

});