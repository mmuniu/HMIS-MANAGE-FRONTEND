/*
 * =========================================================================
 * procedures settings
 * =========================================================================
 * */

/* global procedure_PRODUCTS_URL, DONE_procedure_URL, USER_ID, VISIT_ID, alertify*/

$(function () {

  // $.ajax({
  //     url: 'https://api.example.com/data', // Replace with your API endpoint URL
  //     method: 'GET', // Use GET method
  //     dataType: 'json', // Specify the expected data type of the response
  //     success: function(response) {
  //         // Handle successful response
  //         console.log('Response:', response);
  //         // Process the response data here
  //     },
  //     error: function(xhr, status, error) {
  //         // Handle errors
  //         console.error('Error:', error);
  //         // Display an error message or handle the error as needed
  //     }
  // });



  console.log('destination');

  // check select event

  // var procedure_select = $('.procedure-select');
  // selectize(procedure_select);

  $('.cancel_investigation').on('click', function(){
    var id = $(this).attr('id');
    var type = "investigation";
    var apiUrl = "/api/evaluation/cancel/investigation";

    $.ajax({
      url: apiUrl,
      type: 'GET',
      data: {
        "investigation" : id,

        "type" : "investigation"
      },
      contentType: 'application/json-patch+json',
      accepts: 'application/json',
      success: function(response) {



        if(response == "Investigation updated Successfully")
          {

            $(".procedure_"+id).css('background-color', 'red').delay(2000).fadeOut();
            $(this).delay(2000).fadeOut();

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
  });


  $('.cancel_procedure').on('click', function(){
    var id = $(this).attr('id');
    console.log(id)
    var type = "procedures";
    var apiUrl = "/api/evaluation/cancel/investigation";

    $.ajax({
      url: apiUrl,
      type: 'GET',
      data: {
        "investigation" : id,
        "type" : "procedures"
      },
      contentType: 'application/json-patch+json',
      accepts: 'application/json',
      success: function(response) {



        if(response == "Investigation updated Successfully")
          {
            console.log(id);
            $('.procedure_' + id).css('background-color', 'red').delay(2000).fadeOut();

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


  function cancelProcedures(id, type)
  {

  }



  $('.destination').on('change', function() {

    var operation_id = $('#operation_id').attr('value');
    var destination_value = $('#destination').attr('value')


    $.ajax({
      type: 'GET',
      url: "/api/theatre/procedures",
      data: {
          'dept': $(this).val(),
          'operation': operation_id

      },
      success: function (data) {
        $('.drug-select').empty();
        for(var i=0; i<data.length; i++)
          {
            console.log(data[i]['id'])
            var option = '<option value='+data[i]['id']+'>'+data[i]['name']+'</option>'
            $('.drug-select').append(option);
          }


        console.log(data)
      }
  });
      // procedure_select.trigger('change');
      // selectize(procedure_select);
      // procedure_select.val(null).select2("destroy");
      // console.log('consu 2 : ', procedure_select.val());

      // due to the above not working with select2, it's easier to refresh page

  });

  // update prices on select change
  $('.procedure-select').on('select2:select', function (e) {
      var selected = $(this).find('option:selected');
      var procedure_data = selected.data().data;

      var price = PAYMENT_METHOD == 'cash' ? procedure_data.cash_price : procedure_data.credit_price;
      $('#price').val(price);
      $('#quantity').val(1);
      $('#amount').val(price);
      $('#procedure_store_id').val(procedure_data.store);
  });

  // check price input change
  $('#quantity').on('change', function() {
      $('#amount').val(parseFloat($('#price').val()) * parseFloat($(this).val()));
  });

  // submit form
  // $('#procedure_form').submit(function (e) {
  //     e.preventDefault();
  //     var _this = $(this);
  //     _this.find('button[type="submit"]').html('<i class="fa fa-spinner fa-spin"></i> Saving...');
  //     $.ajax({
  //         type: "POST",
  //         url: procedure_URL,
  //         data: _this.serialize(),
  //         success: function () {
  //             alertify.success('<i class="fa fa-check-circle"></i> Patient procedure updated');
  //             _this.find('button[type="submit"]').html('<i class="fa fa-save"></i> Save');
  //             _this.trigger('reset');
  //             target_table.dataTable().api().ajax.reload();
  //         },
  //         error: function () {
  //             _this.html('<i class="fa fa-save"></i>Save');
  //             alertify.error('<i class="fa fa-check-warning"></i> Could not save procedure');
  //         }
  //     });
  // });

  // selectize the element
  function selectize(el)
  {
      el.select2({
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
              "url": CONSUMABLE_PRODUCTS_URL,
              "dataType": "json",
              "cache": true,
              "data": function (term, page) {
                  return {
                      term: term,
                      clinic: $("#department_id").val()
                  };
              },
              "results": function (data, page) {
                  return { results: data };
              }
          }
      });
  }

});
