/* global MATERNITY_OBSTETRIC_HISTORY_POST_URL, MATERNITY_OBSTETRIC_HISTORY_TABLE_URL, alertify*/

$(function () {
    $(document).ready(function () {
        var form = $('#maternity_obstetric_history_form');
        var table = $('#maternity_obstetric_history_table');
        var submit_btn = form.find('button[type="submit"]');

        if (typeof MATERNITY_OBSTETRIC_HISTORY_TABLE_URL !== 'undefined') {
            table.dataTable({
                "ajax": {
                    "url": MATERNITY_OBSTETRIC_HISTORY_TABLE_URL,
                    "dataSrc": ""
                },
                'responsive': true,
                'processing': true
            });
        }

        form.submit(function (e) {
            e.preventDefault();
            submit_btn.html('<i class="fa fa-refresh fa-spin"></i> Saving ...').attr('disabled', true);

            $.ajax({
                url: MATERNITY_OBSTETRIC_HISTORY_POST_URL,
                method: 'POST',
                data: form.serialize(),
                success: function (response) {
                    alertify.success("Details Saved");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                    form.trigger('reset');
                    table.dataTable().api().ajax.reload();
                },
                error: function (error) {
                    alertify.error("There was an error saving the information. Please try again.");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                }
            });
        });
    });
});
