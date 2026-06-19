var JP_PAID = false;

function show_information() {
    function calculate_cost_array() {
        var total = 0;
        $('#bloodyMoves').find('tr').each(function () {
            if ($(this).find('input:checkbox').is(':checked')) {
                total += parseInt($(this).find('span.topay').html());
            }
        });
        return total;
    }

    function sumPayments() {
        function parser(j) {
            return parseInt(j) || 0;
        }

        var cash = parser($('input[name=CashAmount]').val());
        var mpesa = parser($('input[name=MpesaAmount]').val());
        var cheque = parser($('input[name=ChequeAmount]').val());
        var card = parser($('input[name=CardAmount]').val());
        var cash = parser($('#cash_amount').val());
        var account = parser($('#account_amount').val());
        if (account > __UXCT) {
            account = __UXCT;
            alertify.log("Patient account balance is " + account);
            $('#account_amount').val(account);
        }
        var mpesa = parser($('#mpesa_amount').val());
        var cheque = parser($('#cheque_amount').val());
        var card = parser($('#card_amount').val());
        var jp = 0;
        if (JP_PAID)
            jp = parser($('input[name=JPAmount]').val());
        return (cash + mpesa + cheque + card + jp + account) ;
    }

    //calculate percentage discount
    var total_amount = calculate_cost_array();
    var discountAmount = parseFloat($('#discountAsAPercentage').val()) || 0;
    var discountedAmount = total_amount * (discountAmount / 100);



   function discounted()
    {
        if(discountAmount > 0)
        {
            var to_payAmount = total_amount - discountedAmount;
        }else{
            var to_payAmount = total_amount;
        }
        return to_payAmount;
    }

    var total_one_has_to_pay = discounted();
    var to_pay = sumPayments();
    var debt_total = sumPayments();

    var needed = total_one_has_to_pay - to_pay;
    $('#total').html("Total: Ksh " + total_amount);
    $('#invoice_total_amount').val(total_amount);
    $('#all').html("Total Payments: <strong>Ksh " + to_pay + "</strong>");
    $('#balance').html('');
    $('#wholeAmountWithoutDiscount').val(total_amount);
    $('#total_paid').val(debt_total);
    if (needed > 0) {
        $('#balance').html("Balance: <strong style='color:red;'>Ksh " + needed + "</strong>");
        $('#remainingAmountBalance').val(needed);
    } else {
        $('#balance').html("Change: <strong style='color:blue;'>Ksh " + (-needed) + "</strong>");
        $('#remainingAmountBalance').val(0);
    }

    $("#discountAsAValue").on('input change', function () {
        var valueDiscount = $('#discountAsAValue').val();
        var valueDiscountedAmount = total_amount - valueDiscount;
        var percentageDiscount = (valueDiscountedAmount / total_amount) * 100;
        var percentageDiscount = (valueDiscountedAmount / total_amount) * 100;
        $('#discountAsAPercentage').val(percentageDiscount);
    });
}

$(function () {
    $('#payForm').find('input').keyup(function () {
        show_information();
    });

    $('#discountAsAValue').find('input').keyup(function () {
        show_information();
    });


    $('input').on('ifChanged', function () {
        show_information();
    });


    $('#paymentsTable').find('input:radio, input:checkbox').prop('checked', false);
    $('input[type="checkbox"]').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-blue',
        increaseArea: '20%'
    });
    // $('#saver').prop('disabled', true);
    $(".accordion").accordion({
        heightStyle: "content"
    });
    $('.datepicker').datepicker({maxDate: 0, changeMonth: true});

});
