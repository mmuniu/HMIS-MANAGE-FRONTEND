$(document).ready(function() {
    $('body').on('click', '.update', function (e) {
        e.preventDefault();
        var url = EDIT_ADMISSION_DETAILS;
        var id = $(this).data('id');
        url = url.replace(':admission_id', id);

        $('#admissionModal').modal();
        var form = $('#admissionModalForm');
        form.find('input, select').prop('disabled', true);
        $.ajax({
            url: url,
            method: 'GET'
        })
            .done(function (response) {
                form.find('#admission_id').val(response.admission.id);
                form.find('#inpatient_no').val(response.admission.inpatient_no);
                form.find('#admitted_at').val(response.admission.admitted_at);
                form.find('#payment_mode').val(response.admission.payment_mode);
                form.find('input, select').prop('disabled', false);
            })
            .catch(function (error) {
                alertify.error('An error occurred. Please refresh the page.');
            });

    });

    $('#admissionModalForm').submit(function (e) {
        e.preventDefault();
        var url = UPDATE_ADMISSION_DETAILS;
        var id = $(this).find('#admission_id').val();
        url = url.replace(':admission_id', id);
        var data = $(this).serialize();

        $.ajax({
            url: url,
            method: 'POST',
            data: data,
            success: function (response) {
                alertify.success('Details updated');
                window.location.reload();
            },
            error: function (error) {
                alertify.error('An error occurred');
                console.log(error);
            }
        });
    });

    $("#confirm-swapping").on('change', function () {
        $('#confirm-swapping-container').toggle();
    });

    $('#ward').change(function (event) {
        let ward = JSON.parse(event.target.value);
        $('#wardId').val(ward.id);

        processBeds(ward);
    });

    // beds select
    function processBeds(ward) {
        let beds = ward.beds;
        let bedSelect = $('#beds');

        bedSelect.empty();
        var optionBuild = "";

        for (let key = 0; key < beds.length; key++) {
            optionBuild += '<option value="' + beds[key].id + '"';
            optionBuild += beds[key].is_available ? '' : 'disabled';
            optionBuild += ">";
            optionBuild += beds[key].number + ' ~ ' + formatBedStatus(beds[key].is_available);
            optionBuild += "</option>";
        }

        bedSelect.append(optionBuild);
    }

    // format availability of the bed
    function formatBedStatus(is_available) {
        if (is_available == 1) {
            return 'Available';
        }
        return 'Booked';
    }

    $('#search-form-toggle').on('click', function (e) {
        $('#search-form').toggle();
    });

    $("#admissions-table").dataTable({
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
});