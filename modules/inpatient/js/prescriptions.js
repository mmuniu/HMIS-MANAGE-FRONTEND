$(document).ready(function() {
    var form = $('#prescription-form');

    $("#take").keyup(calculateDrugsToDispense);

    $('#method').change(calculateDrugsToDispense);

    $('#time_measure').change(calculateDrugsToDispense);

    $('#duration').keyup(calculateDrugsToDispense);

    function calculateDrugsToDispense(event) {
        let dosage = parseInt($('#take').val());

        let rate = parseInt(getRate());

        let time = getTime();

        $('#dispense').val(dosage * rate * time);
    }

    function getRate() {
        let content = $('#method').find("option:selected").text();

        if (content == 't.i.d') {
            return 3;
        }
        if (content == 'q.i.d') {
            return 4;
        }
        if (content == 'STAT' || content == 'O.D') {
            return 1;
        }

        return 2;
    }

    function getTime() {
        let measure = $('#time_measure').find("option:selected").text();

        let duration = $('#duration').val() ? parseInt($('#duration').val()) : 0;

        if (measure.indexOf('day') !== -1) {
            return 1 * duration;
        }

        if (measure.indexOf('week') !== -1) {
            return 7 * duration;
        }

        if (measure.indexOf('month') !== -1) {
            return 30 * duration;
        }

        if (measure.indexOf('year') !== -1) {
            return 365 * duration;
        }

        return 0;
    }

    var ITEMS_IN_STORE = 0;
    form.find('select').on('select2:select', function (evt) {
        var selected = $(this).find('option:selected');
        ITEMS_IN_STORE = selected.data().data.available;
    });

    function map_select2(i) {
        //$('#addr' + i + ' select').select2({
        $('#item_' + i).select2({
            "theme": "bootstrap",
            "placeholder": 'Please select an item',
            "formatNoMatches": function () {
                return "No matches found";
            },
            "formatInputTooShort": function (input, min) {
                return "Please enter " + (min - input.length) + " more characters";
            },
            "formatInputTooLong": function (input, max) {
                return "Please enter " + (input.length - max) + " less characters";
            },
            "formatSelectionTooBig": function (limit) {
                return "You can only select " + limit + " items";
            },
            "formatLoadMore": function (pageNumber) {
                return "Loading more results...";
            },
            "formatSearching": function () {
                return "Searching...";
            },
            "minimumInputLength": 2,
            "allowClear": true,
            "ajax": {
                "url": PRODUCTS_URL,
                "dataType": "json",
                "cache": true,
                "data": function (term, page) {
                    return {
                        term: term,
                        clinic: $("#clinic").val()
                    };
                },
                "results": function (data, page) {
                    return { results: data };
                }
            }
        });
    }
    map_select2(0);


    //Save prescriptions
    form.submit(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        savePrescription();
    });

    function savePrescription() {
        var saveButton = $('#save-prescription');
        $.ajax({
            type: "POST",
            url: PRESCRIPTIONS_ENDPOINT,
            data: form.serialize(),
            beforeSend: function () {
                saveButton.hide();
                $('#loader').removeClass('hidden');
                $('#prescriptionLoader').show();
            },
            success: function () {
                $('#prescriptionLoader').hide();
                $('#prescribed_drugs').dataTable().api().ajax.reload();
                form.trigger("reset");
                alertify.success("Prescription saved");
                saveButton.show();
                $('#loader').addClass('hidden');
            },
            error: function () {
                alertify.error('<i class="fa fa-check-warning"></i> An error occured prescribing drug');
                $('#prescriptionLoader').hide();
                saveButton.show();
            }
        });
    }

    $('.drug-select').on('select2:select', function (event) {

        $('#store_id').val(event.params.data.store);

    });
});