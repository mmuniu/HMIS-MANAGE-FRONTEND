/* global BOOKING_REQUESTS_ENDPOINT */
/* global SURGEON_LIST */
/* global SURGEON_TYPE */
$(document).ready(function () {

    //Adding a surgeon
    $("#add-surgeon").on("click", function(){

        var surgeonTotal = $("#surgeons .issa-surgeon").length;

        addSurgeon(surgeonTotal);
    });

    $("#add-nurse").on("click", function(){

        var nurseTotal = $("#nurses .issa-nurse").length;

        addNurse(nurseTotal);
    });

    async function addNurse(surgeonTotal)
    {
        surgeonTotal = surgeonTotal + 1;
       const list = await axios.get('/api/users/nurse/list',{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log();
        var nursesList = list.data;
        // var surgeonType = SURGEON_TYPE;



        var select = $('<select class="form-control select2">').attr('name', 'nurses[' + surgeonTotal + '][user_id]').addClass('select2');
        $.each(nursesList, function() {
            select.append($("<option />").val(this.id).text(this.profile.full_name));
        });

        // var input = $('<input class="form-control">').attr('name', 'nurses[' + surgeonTotal + '][rate]')
        //     .attr('type', 'number')
        //     .attr('placeholder', 0);

        // var hidden = $('<input class="form-control">').attr('name', 'nurses[' + surgeonTotal + '][medic_type_id]')
        //     .attr('type', 'hidden')
        //     .attr('value', surgeonType)
        //     .attr('placeholder', 0);

        var row = $('<div class="row-fluid issa-surgeon"></div>');
        var column1 = $('<div class="col-md-6"></div>');
        column1.append($('<div class="form-group"></div>')
            .append($('<label class="col-md-4"></label>').text('Choose a theatre Nurse'))
            .append($('<div class="col-md-8"></div>')
                .append(select)
            )
        );

        // var column2 = $('<div class="col-md-6"></div>');
        // column2.append($('<div class="form-group req"></div>')
        //     .append($('<label class="col-md-4"></label>').text('Enter surgeon\'s rate/min'))
        //     .append($('<div class="col-md-8"></div>')
                // .append(input)
        //     )
        // );

        row.append(column1);
        // row.append(column2);
        // row.append(hidden);

        console.log(row)

        $("#nurses").append(row);
    }
    async function addSurgeon(surgeonTotal)
    {
        surgeonTotal = surgeonTotal + 1;
       const list = await axios.get('/api/users/surgeon/list',{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log();
        var surgeonsList = list.data;
        // var surgeonType = SURGEON_TYPE;



        var select = $('<select class="form-control select2">').attr('name', 'surgeons[' + surgeonTotal + '][user_id]').addClass('select2');
        $.each(surgeonsList, function() {
            select.append($("<option />").val(this.id).text(this.profile.full_name));
        });

        // var input = $('<input class="form-control">').attr('name', 'surgeons[' + surgeonTotal + '][rate]')
        //     .attr('type', 'number')
        //     .attr('placeholder', 0);

        // var hidden = $('<input class="form-control">').attr('name', 'surgeons[' + surgeonTotal + '][medic_type_id]')
        //     .attr('type', 'hidden')
        //     .attr('value', surgeonType)
        //     .attr('placeholder', 0);

        var row = $('<div class="row-fluid issa-surgeon"></div>');
        var column1 = $('<div class="col-md-6"></div>');
        column1.append($('<div class="form-group"></div>')
            .append($('<label class="col-md-4"></label>').text('Choose a theatre surgeon'))
            .append($('<div class="col-md-8"></div>')
                .append(select)
            )
        );

        // var column2 = $('<div class="col-md-6"></div>');
        // column2.append($('<div class="form-group req"></div>')
        //     .append($('<label class="col-md-4"></label>').text('Enter surgeon\'s rate/min'))
        //     .append($('<div class="col-md-8"></div>')
                // .append(input)
        //     )
        // );

        row.append(column1);
        // row.append(column2);
        // row.append(hidden);

        console.log(row)

        $("#surgeons").append(row);
    }
});
