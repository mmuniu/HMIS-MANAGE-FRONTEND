/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 22/09/2019
 * Time: 18:17
 */


import Report from "@reports/libs/Report";
// import FiltersComponent from "@app/components/reports/partials/Filters";
// import CommonTable from "@app/components/reports/partials/CommonTable";
// import { randomNumber } from "@app/libs/Util";

export const reportsMixin = {
    components: {
        // FiltersComponent,
        // CommonTable,
    },

    data() {
        return {
            obj: new Report(),
            filteredList: null,
            saveLoader: false,
            processing_child: false,
            dialog: false,
            module: "",
            decoratorKey: "",
            decoratorKeyLabel: "",
            active: null,
            search: "",
            searchLocal: "",
            // randomNumber: randomNumber,
            periods: null,
            chartData: [],
            chartLabels: [],
        };
    },

    computed: {
        initialised() {
            return this.list;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        list() {
            return this.obj.reportData;
        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        headers() {
            return this.list.headers;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },
    },

    watch: {
        submitted(val) {
            if (val) {
                this.saveLoader = false;
            }
        },

        list(val) {
            if (val.data) {
                this.filteredList = val.data;

                this.chartData = _.map(val.data, (item) => {
                    if (item.hasOwnProperty("amount")) {
                        return item.amount;
                    }

                    return item.total;
                });

                this.chartLabels = _.map(val.data, (item) => {
                    if (item.date_friendly) {
                        return item.date_friendly;
                    } else if (item.labels) {
                        return item.labels;
                    } else {
                        return item.timeline;
                    }
                });
            }

            if (val.dates) {
                this.periods = val.dates;
            }
        },

        search() {
            this.performSearch();
        },
    },

    methods: {
        navigate(page) {
            this.get(page);
        },

        get(page = 1, data = null) {
            if (! this.decoratorKey) {
                flash({ message: "Please provide the decorator key", alert: "info" });
                return;
            }

            if (! this.module) {
                flash({ message: "Please provide the module", alert: "info" });
                return;
            }

            this.saveLoader = true;

            // Check if we have saved filters and use them for the initial request
            if (!data && this.obj.filters && Object.keys(this.obj.filters).length > 0) {
                this.obj.performFilter(this.module, this.decoratorKey, page);
            } else {
                this.obj.get(this.module, this.decoratorKey, page, data);
            }
        },

        performLocalSearch(term) {
            this.searchLocal = term;
        },

        close() {
            this.dialog = false;
        },

        performFilter() {
            this.saveLoader = true;

            this.obj.performFilter(this.module, this.decoratorKey);
        },
    },

    mounted() {
        if (!this.processing_child) {
            const usherParam = this.$route.path.lastIndexOf("/");
            this.active = this.$route.path.substring(usherParam + 1);
            this.get();
        }
    },
};

