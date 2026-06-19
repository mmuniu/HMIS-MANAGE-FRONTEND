/* global DIAGNOSIS_URL, USER_ID, VISIT_ID, alertify */
$(function () {
    //mock hide this
    $('.instructions').hide();
    $('#diagnosisLoader').hide();
    if (typeof PERFOMED_INVESTIGATION_URL !== 'undefined') {
        $('#previousInvestigations').dataTable({
            ajax: PERFOMED_INVESTIGATION_URL,
            processing: true
        });
    }

    $('#previousInvestigations').on('click', '#sapi_del', function () {
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
                        $('#previousInvestigations').dataTable().api().ajax.reload();
                    }
                })
            }
        });
    });

    $('#investigations_form input').blur(function () {
        show_selection_investigation();
    });

    $('#investigations_form').find('input:text').keyup(function () {
        show_selection_investigation();
    });
    var investigationForms = $('#investigations_form');
    investigationForms.find('input').on('ifChanged', function () {
        var elements = $(this).parents('tr').find('input');
        var texts = $(this).parents('tr').find('textarea');
        var procedure_id = $(this).val();
        if ($(this).is(':checked')) {
            elements.prop('disabled', false);
            texts.prop('disabled', false);
            $(texts).parent().show();
            var name = $('#name' + procedure_id).html();
            var amount = get_total_for_investigation(procedure_id);
            addOrReplaceInvestigation({
                id: procedure_id,
                name: name,
                amount: amount
            });
        } else {
            elements.prop('disabled', true);
            texts.prop('disabled', true);
            $(texts).parent().hide();
            removeTheInvestigation(procedure_id);
        }
        $(this).prop('disabled', false);
        show_selection_investigation();
    });

    $(document).on('change', '#investigations_form input', function () {
        var elements = $(this).parents('tr').find('input');
        var texts = $(this).parents('tr').find('textarea');
        var procedure_id = $(this).val();
        if ($(this).is(':checked')) {
            elements.prop('disabled', false);
            texts.prop('disabled', false);
            // $(texts).parent().show();
            var name = $('#name' + procedure_id).html();
            var amount = get_total_for_investigation(procedure_id);
            addOrReplaceInvestigation({
                id: procedure_id,
                name: name,
                // qty: $('#quantity' + procedure_id).val(),
                // price: $('#price' + procedure_id).val(),
                amount: amount
            });
        } else {
            // elements.prop('disabled', true);
            // texts.prop('disabled', true);
            // $(texts).parent().hide();
            removeTheInvestigation(procedure_id);
        }
        $(this).prop('disabled', false);
        show_selection_investigation();
    });

    $('body').on('click', '.remove-investigation-btn', function(e) {
        e.preventDefault();
        $(this).parent().parent().remove();
        refreshSelectedItems();
    });

    function toggle_selections() {

    }

    function show_selection_investigation()
    {
        $('#show_selection').hide();
        $('#diagnosisInfo > tbody > tr').remove();
        var total = 0;
        var counter = 1;

        procedureInvestigations.forEach(function (data) {
            var name = data.name;
            var investigation_id = data.id;
            var amount = get_total_for_investigation(data.id);
            total += parseInt(amount);
            var tr = $('<tr>').css('width', '100%');

            var input_name = $('<input />').attr('name', 'name').val(name).attr('type', 'hidden').attr('required', true);
            var input_amount = $('<input />').attr('name', 'amount').val(amount).attr('step', 2).attr('type', 'hidden').attr('required', true);
            var input_investigation_id = $('<input />').attr('name', 'investigation_id').val(investigation_id).attr('type', 'hidden').attr('required', true);
            // var remove_button = $('<button />').addClass('btn btn-danger btn-xs remove-investigation-btn pull-right').html(' <i class="fa fa-trash"></i>');

            var td1 = $('<td>');
            var td2 = $('<td>');

            // td1.append('<b>' + counter + '.</b> ' + name);
            td1.append(name);
            td1.append(input_name);
            // td1.append(remove_button);
            td1.append(input_investigation_id);
            td1.append('<br/>');
            td2.append(amount);
            td2.append(input_amount);
            tr.append(td1);
            tr.append(td2);

            $('#diagnosisInfo > tbody').append(tr);
            counter++;
        });
        if (total) {
            var tr_total = $('<tr>').css('width', '100%').css('font-weight', 700);
            var td_total = $('<td>');
            var td_amount = $('<td id="selected_investigation_totals">');

            $('#diagnosisInfo > tbody').append(tr_total.append(td_total.append('<strong>Total:</strong>')).append(td_amount.append(total)));
        }
        $('#show_selection').show();
    }

    var procedureInvestigations = [], arrIndex = {};
    var position = 0;

    function addOrReplaceInvestigation(object) {
        var index = arrIndex[object.id];
        if (index === undefined) {
            index = position;
            arrIndex[object.id] = index;
            position++;
        }
        procedureInvestigations[index] = object;
    }

    function removeTheInvestigation(id) {
        procedureInvestigations = procedureInvestigations.filter(function (obj) {
            return obj.id !== id;
        });
    }

    function refreshSelectedItems() {
        var total = 0;
        $('#diagnosisInfo > tbody tr').each(function (item) {
            var amount = $(this).find('input[name="amount"]').val();
            if(amount) {
                amount = parseFloat(amount);
                total += amount;
            }
        });
        $('#selected_investigation_totals').html(total);
    }

    $('#saveDiagnosis').click(function (e) {
        e.preventDefault();
        var $btn = $(this);
        var form = $('#investigations_form');
        var token = $('meta[name="csrf-token"]').attr('value');
        var data = form.find("input:checked").parent().parent().find('input').serialize();
        var reasonsInput = $('#investigation_reasons');

        var items = {};
        items = groupInArray(data);
        items['admission_id'] = form.find('input[name="admission_id"]').val();
        items['visit'] = form.find('input[name="visit"]').val();
        items['_token'] = token;
        items['reasons'] = reasonsInput.val();

        $.ajax({
            method: "POST",
            url: DIAGNOSIS_URL,
            data: items,
            beforeSend: function () {
                $btn.hide();
                $('#diagnosisLoader').show();
            },
            success: function () {
                $btn.show();
                $('#diagnosisLoader').hide();
                reasonsInput.val(null);
                alertify.success('<i class="fa fa-check-circle"></i> Patient evaluation updated');
                // $('.investigation_item').find('input').iCheck('uncheck');
                $('input[type=checkbox]').prop('checked', false).trigger('change');
                procedureInvestigations = [];
                arrIndex = {};
                position = 0;
                $('#previousInvestigations').dataTable().api().ajax.reload();
                show_selection_investigation();
            },
            error: function () {
                alertify.error('<i class="fa fa-check-warning"></i> Could not save evaluation');
                $btn.show();
                $('#diagnosisLoader').hide();
            }
        });
        //location.reload();
    });
    $('.investigation_item').find('input').iCheck('uncheck');
    $('#show_selection').hide();

    function get_amount_given(price, qty, discount) {
        try {
            var total = price * qty;
            var d = total * (discount / 100);
            return total - d;
        } catch (e) {
            return price;
        }
    }

    function get_total_for_investigation(procedure_id) {
        var cost = $('#cost' + procedure_id).val();
        var discount = $('#discount' + procedure_id).val();
        var quantity = $('#quantity' + procedure_id).val();
        var amount = get_amount_given(cost, quantity, discount);
        $('#amount' + procedure_id).val(amount);
        return amount;
    }

    $(document).ready(function () {
        $('body').on('change', 'input[maxlength]', function (e) {
            var maxlength = parseFloat($(this).attr('maxlength'));
            if (parseFloat($(this).val()) > maxlength) {
                $(this).val(maxlength);
                alert('Sorry, you can input values upto a maximum of ' + maxlength);
            }
        });

        $('body').on('change', 'input[minlength]', function (e) {
            var minlength = parseFloat($(this).attr('minlength'));
            if (parseFloat($(this).val()) < minlength) {
                $(this).val(minlength);
                alert('Sorry, you can input values upto a minimum of ' + minlength);
            }
        });
    });

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