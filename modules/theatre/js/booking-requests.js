/* global BOOKING_REQUESTS_ENDPOINT */
/* global BOOKING_REQUESTS_ENDPOINT */
$(document).ready(function () {

    if(BOOKING_REQUESTS_ENDPOINT)
    {
        $("#booking-requests").dataTable({
            ajax: {
                "url": BOOKING_REQUESTS_ENDPOINT,
                "type": "GET"
            },
            order: [],
            scrollY:        500,
            scrollX:        true,
            scrollCollapse: true,
            paging:         false,
            fixedColumns:   {
                leftColumns: 3
            }
        });

        $("body").on("click", ".authorize", function (event) {

            var data = JSON.parse(event.target.value);

            $("#booking-request-id").val(data.id);

            $("#required-amount").val(data.deposit);

        });
    }
});