/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-07-07
 * Time: 22:27
 */

import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./FacilityRepository";
import { syncKey } from "@app/libs/Util";

export default class Facility extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.facilities = null;

        this.saved = false;

        this.authorizing = false;

        this.hasAuthorized = false;

        this.accessToken = null;

        this.fetchAccessToken();
    }

    /**
     * get all sync facilities
     */
    save() {
        this.saved = false;

        const data = this.getFields(["name", "identifier", "url"]);

        this.form.submit("post", route("api.sync.facilities.store").relative(), data).then((response) => {
            flash({ message: "Saved successfully", alert: "success" });

            this.saved = true;
        });
    }

    /**
     * get all sync facilities
     */
    update(data) {
        this.saved = false;

        this.form.submit("put", route("api.sync.facilities.update", data.id).relative(), data).then((response) => {
            flash({ message: "Updated successfully", alert: "success" });

            this.saved = true;
        });
    }

    /**
     * update sync facilities tokens
     */
    updateToken(data) {
        this.saved = false;

        this.form.submit("put", route("api.sync.facilities.token", data.id).relative(), data).then((response) => {
            flash({ message: "Access Tokens Updated successfully", alert: "success" });

            this.saved = true;
        });
    }

    saveMatch(data) {
        console.log("data", data);

        this.saved = false;

        this.form.submit("post", route("api.sync.facilities.save-match").relative(), data).then((response) => {
            flash({ message: "Sync Facilities matched successfully", alert: "success" });

            this.saved = true;
        });
    }

    /**
     * acquire access tokens to a sync facility system
     *
     * @param facility
     */
    getAccessToken(facility) {
        this.authorizing = true;
        this.hasAuthorized = false;

        const data = {
            client_id: facility.token.client_id,
            client_secret: facility.token.client_secret,
            scope: "*",
            grant_type: "client_credentials",
        };

        let url = facility.url;
        if (url.substr(-1) != "/") {
            url += "/";
        }

        url += "oauth/token";

        const headers = {
            "Accept": "application/json",
        };

        axios.post(url, data, headers)
            .then((response) => {
                flash({ alert: "success", message: "Authorization successful." });

                this.authorizing = false;
                this.hasAuthorized = true;

                window.localStorage.setItem(syncKey, JSON.stringify(response.data));

                this.accessToken = response.data;
            })
            .catch((error) => {
                flash({ alert: "error", message: "An error occurred during authorization process!" });

                this.authorizing = false;
            });
    }

    /**
     * get the access token form storage
     */
    fetchAccessToken() {
        const token = window.localStorage.getItem(syncKey);

        if (token) {
            this.accessToken = JSON.parse(token);
        }
    }

    /**
     * get visa for remote connection
     *
     * @returns {{headers: {Authorization: string, Accept: string}}|{}}
     */
    visa() {
        this.fetchAccessToken();

        if (this.accessToken) {
            const headers = {
                "Accept": "application/json",
                "Authorization": `${this.accessToken.token_type} ${this.accessToken.access_token}`,
            };

            return { headers };
        }

        return { };
    }

    /**
     * trigger the sync process
     *
     * @param from
     * @param to
     */
    triggerSync(from, to) {
        let url = to.url;
        if (url.substr(-1) != "/") {
            url += "/";
        }

        url += "api/sync/client-guard/trigger-sync?status=true";
        url += `&from=${from.url}&from_identifier=${from.identifier}&to_identifier=${to.identifier}`;
        url += "&phase=one";

        const _self = this;

        axios.get(url, this.visa())
            .then((response) => {
                flash({ alert: "success", message: "Sync Process in Motion" });

                // trigger phase 2
                _self.triggerPhase2(from, to);
            })
            .catch((error) => {
                flash({ alert: "error", message: "An error occurred!" });
            });

        flash({ alert: "info", message: "Sync Process will be started in the background" });
    }

    /**
     * trigger sync phase 2
     * @param to
     */
    triggerPhase2(from, to) {
        let url = from.url;
        if (url.substr(-1) != "/") {
            url += "/";
        }

        url += "api/sync/client-guard/trigger-sync?status=true";
        url += `&from=${from.url}&from_identifier=${from.identifier}&to_identifier=${to.identifier}`;
        url += "&phase=two";
        url += `&token_type=${this.accessToken.token_type}`;
        url += `&access_token=${this.accessToken.access_token}`;

        this.form.submit("get", url).then((response) => {
            flash({ message: "Sync Phase 2 in Progress", alert: "success" });
        });
    }
};

