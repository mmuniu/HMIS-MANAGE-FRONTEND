/* global PRODUCTS_URL */
$(document).ready(function () {

    /*
     * Search the backend for a particular product in report filters
     */
    function search()
    {
        $("#item").select2({
            "theme": "bootstrap",
            "placeholder": "Search for an item",
            "formatNoMatches": function () {
                return "No matches found";
            },
            "allowClear": true,
            "ajax": {
                "url": PRODUCTS_URL,
                "dataType": "json",
                "cache": true,
                "data": function (term) {
                    return {
                        term: term
                    };
                },
                "results": function (data) {
                    return {results: data};
                }
            }
        });
    }

    search();
});