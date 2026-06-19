
export default class Search {
    constructor(field) {
        this.term = null;

        this.field = field;

        this.results = [];

        this.loading = false;

        this.noData = '';

        this.own_term = null;

        this.own_field = field;

        this.own_results = [];

        this.own_loading = false;

        this.noData = '';
    }

    /*
     * makes the defaults, default
     */
    reset() {
        this.results = [];

        this.loading = false;

        this.noData = '';
    }
    own_reset(){
        this.own_results =[];
        this.own_loading = false;

        this.noData = '';

    }
}
