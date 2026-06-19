/* global MATERNITY_MATERNAL_META_TABLE_URL, MATERNITY_MATERNAL_META_POST_URL, alertify*/

$(function () {
    $(document).ready(function () {
        var form = $('#maternity_maternal_meta_form');
        var modal = $('#maternity_maternal_meta_modal');
        var modal_form = $('#maternity_maternal_meta_modal_form');
        var table = $('#maternity_maternal_meta_table');
        var submit_btn = form.find('button[type="submit"]');
        var modal_submit_btn = modal_form.find('button[type="submit"]');

        if (typeof MATERNITY_MATERNAL_META_TABLE_URL !== 'undefined') {
            table.dataTable({
                "ajax": {
                    "url": MATERNITY_MATERNAL_META_TABLE_URL,
                    "dataSrc": ""
                },
                'order': [],
                'searching': false,
                'orderable': false,
                'processing': true
            });
        }

        form.submit(function (e) {
            e.preventDefault();
            submit_btn.html('<i class="fa fa-refresh fa-spin"></i> Saving ...').attr('disabled', true);

            $.ajax({
                url: MATERNITY_MATERNAL_META_POST_URL,
                method: 'POST',
                data: form.serialize(),
                success: function(response) {
                    alertify.success("Details Saved");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                    form.trigger('reset').hide(300).remove(); // a simple animation
                    table.dataTable().api().ajax.reload();
                },
                error: function(error) {
                    alertify.error("There was an error saving the information. Please try again.");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);

                }
            });
        });

        $('body').on('click', '.maternity_maternal_meta_modal_form_toggle', function(e) {
            e.preventDefault();
            var url = $(this).data('href');
            // fetch data now
            $.ajax({
                url: url,
                method: 'GET',
                success: function(response) {
                    var data = response.data;
                    modal.modal('show');
                    modal_form.find('#blood_group').val(data.blood_group);
                    modal_form.find('#rhesus_factor').val(data.rhesus_factor);
                    modal_form.find('#khan_rpr').val(data.khan_rpr);
                    modal_form.find('#hiv_status').val(data.hiv_status);
                    modal_form.find('#gestation').val(data.gestation);
                    modal_form.find('#para').val(data.para);
                    modal_form.find('#lmp').val(data.lmp);
                    modal_form.find('#edd').val(data.edd);
                    modal_form.find('#gravida').val(data.gravida);
                    modal_form.find('#diagnosis_meta').val(data.diagnosis);
                    modal_form.find('#remarks').val(data.remarks);
                    modal_form.find('#maternal_meta_id').val(data.id);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });

        // update meta details
        modal_form.submit(function(e) {
            e.preventDefault();
            modal_submit_btn.html('<i class="fa fa-refresh fa-spin"></i> Saving ...').attr('disabled', true);

            $.ajax({
                url: MATERNITY_MATERNAL_META_POST_URL,
                method: 'POST',
                data: modal_form.serialize(),
                success: function (response) {
                    alertify.success("Details Updated. Refreshing...");
                    modal_submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                    modal.modal('hide');
                    table.dataTable().api().ajax.reload();
                },
                error: function (error) {
                    alertify.error("There was an error saving the information. Please try again.");
                    modal_submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                }
            });
        });
    });
});
