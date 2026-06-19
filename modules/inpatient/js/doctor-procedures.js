/*
 * =========================================================================
 * Treatment URL
 * =========================================================================
 */
/* global TREAT_URL, VISIT_ID, USER_ID, DIAGNOSIS_URL, alertify */

$(function () {
    $('#proceduresLoader').hide();
    if (typeof PERFOMED_URL !== 'undefined') {
        $('#previousProcedures').dataTable({
            ajax: PERFOMED_URL
        });
    }
    $('#procedures_form').find('input:text').keyup(function () {
        preview_treatment_selection();
    });

    $('#procedures_form').find('input').blur(function () {
        preview_treatment_selection();
    });

    $('body').on('change', '#procedures_form input', function () {
        var elements = $(this).parents('tr').find('input');
        var texts = $(this).parents('tr').find('.textarea');
        var procedure_id = $(this).val();
        if ($(this).is(':checked')) {
            elements.prop('disabled', false);
            texts.prop('disabled', false);
            // $(texts).parent().show();
            var name = $('#name' + procedure_id).html();
            var amount = john_doe(procedure_id);
            addOrReplaceTreatment({
                id: procedure_id,
                name: name,
                // qty: $('#quantity' + procedure_id).val(),
                // price: $('#price' + procedure_id).val(),
                amount: amount
            });
        } else {
            console.log('not checked');

            // elements.prop('disabled', true);
            // texts.prop('disabled', true);
            // $(texts).parent().hide();
            // removeTheInvestigation(procedure_id);
        }
        $(this).prop('disabled', false);
        preview_treatment_selection();
    });

    function preview_treatment_selection() {
        $('#selected_treatment').hide();
        $('#proceduresTable > tbody > tr').remove();
        var total = 0;
        treatmentInvestigations.forEach(function (data) {
            var name = data.name;
            var amount = john_doe(data.id);
            total += parseInt(amount);
            $('#proceduresTable > tbody').append('<tr><td>' + name + '</td><td>' + amount + '</td></tr>');
        });
        if (total) {
            $('#proceduresTable > tbody').append('<tr><td>Total</td><td><strong>' + total + '</strong></td></tr>');
        }
        $('#selected_treatment').show();
    }

    var treatmentInvestigations = [], trIndex = {};
    var position = 0;

    function addOrReplaceTreatment(object) {
        var index = trIndex[object.id];
        if (index === undefined) {
            index = position;
            trIndex[object.id] = index;
            position++;
        }
        treatmentInvestigations[index] = object;
    }

    function removeTheTreatment(id) {
        treatmentInvestigations = treatmentInvestigations.filter(function (obj) {
            return obj.id !== id;
        });
    }

    $('#saveTreatment').click(function (e) {
        e.preventDefault();
        save_treatment($(this));
    });

    $('#previousProcedures').on('click', '#sapi_del', function () {
        $to_post = $(this).attr('to');
        swal({
            title: "Are you sure?",
            text: "The procedure will be deleted only if it hasn't been paid/billed",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }).then(function (willDelete) {
            if (willDelete) {
                $.ajax({
                    url: $to_post,
                    type: 'DELETE',
                    data: { _token: $("meta[name=token]").attr("content") },
                    success: function () {
                        alertify.success("Deleted");
                        $('#in_table').dataTable().api().ajax.reload();
                    }
                })
            }
        });
    });

    function save_treatment(btn_element) {
        var $btn = btn_element;
        var form = $('#procedures_form');
        var token = $('meta[name="csrf-token"]').attr('value');
        var data = form.find("input:checked").parent().parent().parent().find('input').serialize();

        var items = {};
        items = groupInArray(data);
        items['admission_id'] = form.find('input[name="admission_id"]').val();
        items['visit'] = form.find('input[name="visit"]').val();
        items['_token'] = token;

        $.ajax({
            type: "POST",
            url: DIAGNOSIS_URL,
            beforeSend: function () {
                $btn.hide();
                $('#proceduresLoader').show();
            },
            data: items,
            success: function () {
                $('#proceduresLoader').hide();
                alertify.success('<i class="fa fa-check-circle"></i> Selected treatment procedures saved');
                // $('.treatment_item').find('input').iCheck('uncheck');
                form.find('input:radio, input:checkbox').prop('checked', false);
                $('#selected_treatment').hide();
                $('#previousProcedures').dataTable().api().ajax.reload();
                treatmentInvestigations = [];
                trIndex = {};
                preview_treatment_selection();
                $btn.show();
            },
            error: function () {
                alertify.error('<i class="fa fa-check-warning"></i> Something wrong happened, Retry');
                $('#proceduresLoader').hide();
                $btn.show();
            }
        });
    }

    function john_doe(procedure_id) {
        var cost = $('#cost' + procedure_id).val();
        // var discount = $('#discount' + procedure_id).val();
        var quantity = $('#quantity' + procedure_id).val();
        var amount = get_amount_given(cost, quantity, 0);
        $('#amount' + procedure_id).val(amount);
        return amount;
    }

    function get_amount_given(price, qty, discount) {
        try {
            var total = price * qty;
            var d = total * (discount / 100);
            return total - d;
        } catch (e) {
            return price;
        }
    }

    $('#procedures_form').find('input:radio, input:checkbox').prop('checked', false);
    $('#selected_treatment').hide();


    /**
     * group selected items in an associative array.
     * only the arrays with 'item' property are actually selected
     *
     * @param data
     * @param needle
     */
    function groupInArray(data, needle = "item")
    {
        data = deparam(data);
        var selectedStack = [];

        for(let item in data)
        {
            if(item.startsWith(needle)) {

                var key = item.substring(needle.length, item.length);
                selectedStack.push(key);
            }
        }

        // add to stack
        var returnedItems = {};
        var particulars = [needle, 'discount', 'price', 'amount', 'type', 'quantity', 'instructions'];

        Object.entries(data).forEach((item, index) => {

            // eg if item contains discount10, include entire stack
            for(let i=0; i<particulars.length; i++) {
                for(let j=0; j < selectedStack.length; j++) {
                    if(item.includes(particulars[i] + selectedStack[j])) {
                        returnedItems[item[0]] = item[1];
                    }
                }
            }
        });

        return returnedItems;
    }

    function deparam(query) {
        var pairs, i, keyValuePair, key, value, map = {};
        // remove leading question mark if its there
        if (query.slice(0, 1) === '?') {
            query = query.slice(1);
        }
        if (query !== '') {
            pairs = query.split('&');
            for (i = 0; i < pairs.length; i += 1) {
                keyValuePair = pairs[i].split('=');
                key = decodeURIComponent(keyValuePair[0]);
                value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
                map[key] = value;
            }
        }
        return map;
    }
});
