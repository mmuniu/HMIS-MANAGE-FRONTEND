/* global MATERNITY_MATERNAL_EXAMINATIONS_POST_URL, MATERNITY_MATERNAL_EXAMINATIONS_TABLE_URL, alertify*/

$(function () {
    $(document).ready(function () {
        var form = $('#maternity_maternal_examinations_form');
        var submit_btn = form.find('button[type="submit"]');

        form.submit(function (e) {
            e.preventDefault();
            submit_btn.html('<i class="fa fa-refresh fa-spin"></i> Saving ...').attr('disabled', true);

            $.ajax({
                url: MATERNITY_MATERNAL_EXAMINATIONS_POST_URL,
                method: 'POST',
                data: form.serialize(),
                success: function (response) {
                    alertify.success("Details Saved. Refreshing page...");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                    form.trigger('reset');
                    window.location.reload();
                },
                error: function (error) {
                    alertify.error("There was an error saving the information. Please try again.");
                    submit_btn.html('<i class="fa fa-save"></i> Save ').attr('disabled', false);
                }
            });
        });
    });
});
