/*
 * =========================================================================
 * consumables settings
 * =========================================================================
 * */

/* global CONSUMABLE_PRODUCTS_URL, DONE_CONSUMABLE_URL, USER_ID, VISIT_ID, alertify*/

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



    //
    $('.cancel_consumable').on('click', function(){
      var id = $(this).attr('id');
      console.log(id);
      var apiUrl = "/api/evaluation/cancel/consumables/"+id;

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


          if(response.message == "Cancelled successfully")
            {
              $('.consumable_' + id).css('background-color', 'red').delay(2000).fadeOut();

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

    // check select event

    var consumable_select = $('.consumable-select');
    selectize(consumable_select);

    $('.store_id').on('change', function() {

      // alert('asdasdas')
        // consumable_select.trigger('change');
        // selectize(consumable_select);
        // consumable_select.val(null).select2("destroy");
        // console.log('consu 2 : ', consumable_select.val());
        //                        search: $('.consumable-select').val(),
        // store_id: $("#department_id").val(),
        // no_pagination: true,

        $.ajax({
          type: 'GET',
          url: CONSUMABLE_PRODUCTS_URL,
          data: {
              'search': $('#consumable-select').val(),
              'store_id': $("#department_id").val(),
              'no_pagination' : true,

          },
          success: function (response) {
            $('#consumable-select').empty();
            var data = response.data;
            console.log(data.length);
            if(data[0])
              {
                 var option = '<option value="" selected disabled ></option>'
                 $('#consumable-select').append(option);
              }
            for(var i=0; i<data.length; i++)
              {
                console.log(data[i])
                const index = data[i]


                var option = '<option value='+index['id']+'>'+data[i]['name']+'</option>'
                $('#consumable-select').append(option);
              }


            // console.log(data)
          }
      });

        // console.log($(this).val());

        // due to the above not working with select2, it's easier to refresh page
        if (consumable_select.val() != null) {
            window.location.reload();
        }
    });




    // update prices on select change


    $('#consumable-select').on('change', function (e) {
        var selected = $(this).find('option:selected');
        console.log($(this).val());
        $.ajax({
          type: 'GET',
          url: "/api/inventory/single/store/product/"+$(this).val(),

          success: function (response) {

            console.log(response)
            var consumable_data = response;

            var price = PAYMENT_METHOD == 'cash' ? consumable_data.selling_price : consumable_data.insurance_price;
            $('#price').val(price);
            $('#quantity').val(1);
            $('#amount').val(price);
            $('.product_id').val(consumable_data.product_id);
            $('#consumable_store_id').val(consumable_data.store);
          }
      });

    });

    // check price input change
    $('#quantity').on('change', function() {
        $('#amount').val(parseFloat($('#price').val()) * parseFloat($(this).val()));
    });

    // submit form
    // $('#consumable_form').submit(function (e) {
    //     e.preventDefault();
    //     var _this = $(this);
    //     _this.find('button[type="submit"]').html('<i class="fa fa-spinner fa-spin"></i> Saving...');
    //     $.ajax({
    //         type: "POST",
    //         url: CONSUMABLE_URL,
    //         data: _this.serialize(),
    //         success: function () {
    //             alertify.success('<i class="fa fa-check-circle"></i> Patient consumable updated');
    //             _this.find('button[type="submit"]').html('<i class="fa fa-save"></i> Save');
    //             _this.trigger('reset');
    //             target_table.dataTable().api().ajax.reload();
    //         },
    //         error: function () {
    //             _this.html('<i class="fa fa-save"></i>Save');
    //             alertify.error('<i class="fa fa-check-warning"></i> Could not save consumable');
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
            "minimumInputLength": 3,
            "allowClear": true,

            "ajax": {
                "url": CONSUMABLE_PRODUCTS_URL,
                "dataType": "json",
                "cache": true,
                "data": function (term, page) {
                    return {
                        search: $('.consumable-select').val(),
                        store_id: $("#department_id").val(),
                        no_pagination: true,

                    };
                },
                "results": function (data, page) {

                    return { results: data };

                  //   data.map(function (item) {
                  //     return {
                  //         id: item.id,
                  //         text: item.name
                  //     };
                  // })
                }
            }
        });
    }

});
