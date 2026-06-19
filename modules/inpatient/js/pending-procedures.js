$(document).ready(function () {
    var target_modal = $('#approval-form');
    $('#pending-procedures').dataTable({
        order: [],
        scrollY:        500,
        scrollX:        true,
        scrollCollapse: true,
        paging:         false,
        fixedColumns:   {
            leftColumns: 3,
        },
        language: {
            searchPlaceholder: "Search in loaded results..."
        }
    });

    // hide sidebar to accommodate screen properly
    hide_sidebar();

    $('body').on('click', '.toggle-btn', function () {
        target_modal.find('#approval-form-title').text($(this).data('name'));
        target_modal.find('#approval-form-price').text($(this).data('price'));
        target_modal.find('#approval-form-quantity').text($(this).data('quantity'));
        target_modal.find('#approval-form-amount').text($(this).data('amount'));
        // fill inputs
        target_modal.find('#investigation_id').val($(this).data('id'));
        target_modal.find('#approval_price').val($(this).data('price'));
        update_approved_amount(target_modal);
        target_modal.modal('show');
    });

    target_modal.find('#approval-form-approve').on('click', function (e) {
        var id = $(this).data('id');
        alert('approved ' + id);
    });

    target_modal.find('#approval-form-reject').on('click', function (e) {
        var id = $(this).data('id');
        alert('rejected ' + id);
    });

    target_modal.find('#action').on('change', function (e) {
        var action = $(this).val();
        if (action == 'approve') {
            $('#approval-specifics').show();
        } else {
            $('#approval-specifics').hide();
        }
    });

    target_modal.find('#approval_price').on('change', function (e) {
        update_approved_amount(target_modal);
    });

    function update_approved_amount(target_modal) {
        var price = parseFloat(target_modal.find('#approval_price').val());
        var quantity = parseInt(target_modal.find('#approval-form-quantity').text());
        target_modal.find('#approval_amount').val(quantity * price);
    }

    $('body').on('click', '.view-details', function (e) {
        var data = $(this).data('details');
        var target_table = $('#details-modal table');
        $('#details-modal').modal('show');
        target_table.find('.initial-price').text(data.initial_price);
        target_table.find('.initial-amount').text(data.initial_amount);
        target_table.find('.approval-price').text(data.approval_price);
        target_table.find('.approval-amount').text(data.approval_amount);
        target_table.find('.status').text(data.is_approved == 1 ? 'Approved' : 'Not Approved');
        target_table.find('.user').text(data.user.profile.full_name);
        target_table.find('.created_at').text(data.created_at);
        target_table.find('.reason').text(data.reason);
    });
});