/**
 * File for processing inpatient finance output
 * global: CASH_ENDPOINT, INSURANCE_ENDPOINT
 * sweetalert, alertify
 */
$(function () {
    $(document).ready(function() {
        var MY_TOTAL = 0;
        var initial_total = 0;
        var checked_items = 0;
        var process_bill_form = $('#inpatient-process-bill-form');
        var process_billing_modal = $('#inpatient-process-billing-modal');

        process_bill_form.find('button[type="submit"]').attr('disabled', false);

        $('body').find('input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-blue',
            radioClass: 'iradio_square-blue',
            increaseArea: '20%'
        });

        $('body #individual').find('input[type="checkbox"]').each(function() {
            if ($(this).is(':checked')) {
                initial_total += parseInt($(this).data('price'));
                checked_items++;
            }
        });
        MY_TOTAL = initial_total;
        updateTotals(MY_TOTAL, checked_items);

        $('body #individual').find('input[type="checkbox"]').on('ifChanged', function () {
            if ($(this).is(':checked')) {
                MY_TOTAL += parseInt($(this).data('price'));
                checked_items++;
            } else {
                MY_TOTAL -= parseInt($(this).data('price'));
                checked_items--;
            }
            updateTotals(MY_TOTAL, checked_items);
        });

        $('.changeType').click(function(event){
            var payment = event.target.value

            if(payment == 'cash_payment')
            {
                $('#inpatient-process-billing-modal-cash').removeClass('hidden');
                $('#inpatient-process-billing-modal-insurance').addClass('hidden');
                $('#inpatient-process-billing-modal-patient-account').addClass('hidden');
            }

            if(payment == 'insurance')
            {
                $('#inpatient-process-billing-modal-cash').addClass('hidden');
                $('#inpatient-process-billing-modal-insurance').removeClass('hidden');
                $('#inpatient-process-billing-modal-patient-account').addClass('hidden');
            }

            if(payment == 'patient_account')
            {
                $('#inpatient-process-billing-modal-cash').addClass('hidden');
                $('#inpatient-process-billing-modal-insurance').addClass('hidden');
                $('#inpatient-process-billing-modal-patient-account').removeClass('hidden');
            }

        });

        process_bill_form.submit(function(e) {
            e.preventDefault();

            // provide a modal for showing payment options. Each payment will be generated for an invoice
            process_billing_modal.find('#selected_items_data').val($(this).serialize());

            // show modal now
            process_billing_modal.find('#inpatient-process-billing-modal-balance').text(MY_TOTAL).css('color', 'red');
            process_billing_modal.modal('show');
        });

        process_billing_modal.find('input[type="checkbox"]').on('ifChanged', function () {
            updateBilling(process_billing_modal, MY_TOTAL);
        });

        process_billing_modal.find('input[type="radio"]').on('change', function () {
            updateBilling(process_billing_modal, MY_TOTAL);
        });

        process_billing_modal.find('input[name*="amount"]').on('change keyup', function () {
            updateBilling(process_billing_modal, MY_TOTAL);
        });

        // $('#billing-summary-tab').scroll(function() {
        //     console.log('y');
        // });
    });

    function updateBilling(modal, balance)
    {
        // check selected mode of payment
        var selected_payment_mode = modal.find('input[name="payment_type"]:checked').val();

        // check amount provided for the selected payment method
        var total = 0;

        // patient account
        if(selected_payment_mode == "patient_account") {
            var patient_account_total = $('#inpatient-process-billing-modal-patient-account').find('input[name*="amount"]').val();
            if(patient_account_total && patient_account_total !== undefined) {
                total += parseFloat(patient_account_total);
            }
        }

        // check cash payments
        if(selected_payment_mode == "cash_payment") {
            $('#inpatient-process-billing-modal-cash').find('input[name*="amount"]').each(function() {
                if($(this).val() && $(this).val() !== undefined) {
                    total += parseInt($(this).val());
                }
            });
        }

        // check insurance
        if(selected_payment_mode == "insurance") {
            $('#inpatient-process-billing-modal-insurance').find('input[name*="amount"]').each(function() {
                // if ($(this).parent().parent().parent().find('input[type="radio"]').is(':checked')) {
                    if($(this).val() && $(this).val() !== undefined) {
                        total += parseInt($(this).val());
                    }
                // }
            });
        }

        //update amount
        var balance_element = modal.find('#inpatient-process-billing-modal-balance');
        balance_element.text(balance - total);
        if (balance - total > 0 && selected_payment_mode != 'cash_payment') {
            // danger
            balance_element.css('color', 'red');
            modal.find('button[type="submit"]').attr('disabled', true);
        } else {
            balance_element.css('color', 'green');
            modal.find('button[type="submit"]').attr('disabled', false);
        }
    }

    /**
     *
     * @param float MY_TOTAL
     * @param int checked_items
     */
    function updateTotals(MY_TOTAL, checked_items)
    {
        $('#thesum').html(MY_TOTAL.toFixed(2));
        $('#amount_send').val(MY_TOTAL);
        $('#theitems').html(checked_items);
        var patient_account_balance = $('#patient-account-balance').data('balance');
        $('#patient-deficit').html(MY_TOTAL - patient_account_balance);
        if (MY_TOTAL - patient_account_balance > 0) {
            // danger
            $('#patient-deficit').css('color', 'red');
        } else {
            $('#patient-deficit').css('color', 'green');
        }
    }

});