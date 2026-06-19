import { paths } from "./paths";
import { visa } from "../libs/Customs";
import { StoreActionUrl } from "./StoreActionUrl";

export default class StoreGenerator {
    constructor() {
        this.state = {};

        this.actions = {};

        this.getters = {};

        this.mutations = {};

        this.setState();

        this.setActions();

        this.setGetters();

        this.setMutations();
    }

    /*
     * Set the state variables
     */
    setState() {
        paths.forEach( (path) => {
            if (path.hasOwnProperty("params")) {
                path.params.forEach((param) => {
                    const stateProperty = this.lowerFirst(this.getName(path, param));

                    this.state[stateProperty] = [];
                });
            } else {
                const stateProperty = this.lowerFirst(this.getName(path));

                this.state[stateProperty] = [];
            }
        });
    }

    /*
     * Return the state variables
     */
    getState() {
        return this.state;
    }

    /*
     * Set the getters
     */
    setGetters() {
        paths.forEach( (path) => {
            const functionName = "get" + this.getName(path);

            this.getters[functionName] = function(state) {
                const name = this.getName(path);

                const stateProperty = this.lowerFirst(name);

                return state[stateProperty];
            }.bind(this);
        });
    }

    /*
     * Get the getters
     */
    getGetters() {
        return this.getters;
    }

    /*
     * Set the actions
     */
    setActions() {
        paths.forEach((path) => {
            const baseUrl = `/api/${path.url}`;

            const name = "set" + this.getName(path);

            this.actions[name] = function(context, options = {}) {
                const actionUrl = new StoreActionUrl(baseUrl, options).getUrl();

                // fire store loading event
                window.events.$emit("STORE_SET_ACTION_LOADING", true);

                const CancelToken = axios.CancelToken;
                const source = CancelToken.source();

                // ajax request
                axios.get(actionUrl, visa(), {
                    cancelToken: source.token,
                }).then(({ data }) => {
                    window.events.$emit("STORE_SET_ACTION_LOADING", false);

                    context.commit(name, data);
                }).catch(function(thrown) {
                    if (axios.isCancel(thrown)) {
                        console.log("Request canceled", thrown.message);
                    } else {
                        // handle error
                    }

                    window.events.$emit("STORE_SET_ACTION_LOADING", false);
                });
            };
        });
    }

    /*
     * Get actions
     */
    getActions() {
        return this.actions;
    }

    /*
     * Set Mutations
     */
    setMutations() {
        paths.forEach((path) => {
            const name = "set" + this.getName(path);

            this.mutations[name] = (state, value) => {
                const name = this.getName(path);

                const stateProperty = this.lowerFirst(name);

                state[stateProperty] = value;
            };
        });
    }

    /*
     * Get mutations
     */
    getMutations() {
        return this.mutations;
    }

    /*
     * Get the last segment of the url
     */
    getUrlSegment(url) {
        const contents = url.split("/");

        return contents[contents.length - 1];
    }

    /*
     * Make the first letter uppercase
     */
    ucwords(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /*
     * Make the first letter uppercase
     */
    lowerFirst(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    /*
     * Get the name of the action and mutation given a path
     */
    getName(path, prefix = "") {
        const base = path.alias || this.ucwords(this.getUrlSegment(path.url));
        return base + this.ucwords(prefix);
    }
}
