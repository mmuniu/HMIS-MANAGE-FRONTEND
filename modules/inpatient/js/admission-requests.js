$(document).ready(function () {

    $('body').on('click', '.deposit', function (event) {

        let data = JSON.parse($(this).attr('value'));

        $('#admission-letter-print').attr('href', '/inpatient/admission-letter/create/' + data.patient.id);

        $('#patient-detail').val(data.patient.id);

        $('#modal-patient-name').text(data.patient.full_name);

        $('#admit-request-id').val(data.id);

        let schemes = data.patient.schemes;

        addPatientSchemes(schemes);

        data.patient.schemes.length == 0 ? $('#hasInsurance').addClass('hidden') :
            $('#hasInsurance').removeClass('hidden');

    });

    $('body').on('click', '.authorize', function (event) {

        let data = JSON.parse(event.target.value);

        $('#admission-request-id').val(data.id);

        var requiredAmount = data.type.name + " - " + data.type.deposit;

        $('#required-amount').val(requiredAmount);
    })

    function addPatientSchemes(schemes) {
        $('#insurance-scheme').empty();

        for (var item = 0; item < schemes.length; item++) {
            var value = schemes[item].id;
            var text = schemes[item].scheme_name;

            $('#insurance-scheme').append($('<option>', {
                value: value,
                text: text
            }));
        }
    }
});