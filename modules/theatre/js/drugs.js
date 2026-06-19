$(document).ready(function() {
    var form = $('#theatre-prescriptions-form');

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


    $('.cancel_prescription').on('click', function(){
      var id = $(this).attr('id');
      var apiUrl = "/api/evaluation/cancel/prescriptions/"+id;

      $.ajax({
        url: apiUrl,
        type: 'PATCH',
        data: {
          "prescription" : id,
          "cancelled" : "cancelled"
        },
        contentType: 'application/json-patch+json',
        accepts: 'application/json',
        success: function(response) {


          if(response.message == "Drug updated successfully")
            {
              $('#prescription_' + id).css('background-color', 'red').delay(2000).fadeOut();

              // console.log('prescription_'+id);
            }
            // loadProductToUi(response);
        },
        error: function(error) {
            console.log("Error in saveOffer:");
            console.log(error);
            alert("Error in saveOffer:" + error.responseText);
        }
    });



    })


    $('.store_id').on('change', function() {
      const store_id = $(this).val();
      const url = "/api/inventory/single/store/products/"+store_id;
      console.log(url);

        // consumable_select.trigger('change');
        // selectize(consumable_select);
        // consumable_select.val(null).select2("destroy");
        // console.log('consu 2 : ', consumable_select.val());
        //                        search: $('.consumable-select').val(),
        // store_id: $("#department_id").val(),
        // no_pagination: true,
        $.ajax({
          url: url,
          type: "GET",
          data: {
              // Any data to be sent to the server
              param1: "value1",
              param2: "value2"
          },
          success: function(response, status, xhr) {
              // Callback function executed on successful request
              console.log(response);
              $('#drug-select').empty();
              // var data = response.data;
              // console.log(data);
              if(response[0])
                {
                   var option = '<option value="" selected disabled ></option>'
                   $('#drug-select').append(option);
                }
              for(var i=0; i<response.length; i++)
                {
                  console.log(response[i])
                  const index = response[i]


                  var option = '<option value='+index['id']+'>'+response[i]['name']+'</option>'
                  $('#drug-select').append(option);
                }
          },
          error: function(xhr, status, error) {
              // Callback function executed on error
              alert("Error: " + error);
          }
      });


        $.ajax({
          type: 'GET',
          url: url,

          success: function (response) {
            console.log(response.data)
            // $('#drug-select').empty();
            // var data = response.data;
            // console.log(data.length);
            // if(data[0])
            //   {
            //      var option = '<option value="" selected disabled ></option>'
            //      $('#drug-select').append(option);
            //   }
            // for(var i=0; i<data.length; i++)
            //   {
            //     console.log(data[i])
            //     const index = data[i]


            //     var option = '<option value='+index['id']+'>'+data[i]['name']+'</option>'
            //     $('#drug-select').append(option);
            //   }


            // console.log(data)
          }
      });

        // console.log($(this).val());

        // due to the above not working with select2, it's easier to refresh page

    });

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

        form.find('#store_id').val(selected.data().data.store);
    });

    function map_select2(i) {
        //$('#addr' + i + ' select').select2({
        $('#item_' + i).select2({
            "theme": "classic",
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


    // form.submit(function(e) {
    //     e.preventDefault();
    //     console.log('haha');
    // });
});
