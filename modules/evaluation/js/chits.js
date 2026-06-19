/*
 * =========================================================================
 * Chits settings
 * =========================================================================
 * */

/* global CHITS_URL, PATIENT_CHITS_URL, VISIT_ID, alertify */
$(function () {
    var chits_table = $('#chits-table');
    chits_table.dataTable({
        ajax: PATIENT_CHITS_URL,
        orderable: false,
        columns: [
            { "data": "id" },
            { "data": "patient" },
            { "data": "category" },
            { "data": "duration" },
            { "data": "description" },
            { "data": "user" },
            { "data": "date" },
            { "data": "actions" }
        ]
    });

    $('#chits-form').submit(function(e) {
        e.preventDefault();
        var _this = $(this);
        _this.find('button[type="submit"]').html('<i class=" fa fa-spin fa-loading"></i> Saving...');
        $.ajax({
            url: CHIT_POST_URL,
            method: 'POST',
            data: _this.serialize(),
            success: function(response) {
                alertify.success('<i class="fa fa-check-circle"></i> Patient Chit Added.');
                _this.trigger('reset');
                chits_table.dataTable().api().ajax.reload();
            },
            error: function(error) {
                console.log(error);
                alertify.error('<i class="fa fa-check-warning"></i> Could not save chit');
            }
        });

        _this.find('button[type="submit"]').html('<i class=" fa fa-save"></i> Save');

    });
});
