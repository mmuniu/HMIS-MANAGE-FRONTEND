import { _ } from "vue-underscore";

export class StoreActionUrl {
    /*
     * Accepts an option to determine the best course of action
     */
    constructor(baseUrl, options) {
        this.url = baseUrl;

        this.setUrl(options);
    }

    /*
     * Moulds the route given an options object
     */
    setUrl(options) {
        if (options.hasOwnProperty("items")) {
            this.redis(options.items);
        }

        if (options.hasOwnProperty("page")) {
            this.paginated(options.page);
        }

        if (options.hasOwnProperty("search")) {
            this.search(options.search);
        }

        if (options.hasOwnProperty("params")) {
            this.params(options.params);
        }
    }

    /*
     * Moulds the route given an options object
     */
    getUrl() {
        return this.url;
    }

    /*
     * Redis actions are generated for routes that expect data to be extracted out of redis
     * These hit the redis controller in the backend and can take a string of values
     */
    redis(items) {
        this.url = this.url + "/fetch?";

        items.forEach((value, key) => {
            this.url = this.url + `p${key+1}=${value}&`;
        });

        this.url = this.url.slice(0, -1);
    }

    /*
     * This looks at a url and determines if there is cause to search
     */
    search(term) {
        this.url = this.makeUrl() + `search=${term}`;
    }

    /*
     * This looks at a url and determines if there is cause to paginate given the user request
     */
    paginated(page) {
        if (page) {
            this.url = this.makeUrl() + `page=${page}`;
        }
    }

    /*
    * This looks at a url and determines if there is cause to search
    */
    params(params) {
        const first_key = _.keys(params)[0];
        const first_value = _.values(params)[0];

        this.url = this.makeUrl() + `${first_key}=${first_value}`;

        _.each(params, (parameter, key) => {
            if (key != first_key) {
                this.url = `${this.url}&${key}=${parameter}`;
            }
        });
    }

    makeUrl() {
        return this.url.indexOf("?") > -1 ? `${this.url}&` : `${this.url}?`;
    }
}
