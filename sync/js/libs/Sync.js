import firebase from "firebase";
import "firebase/firestore";
import config from "@sync/config";

export default class Sync {
    constructor() {
        firebase.initializeApp(config);

        this.db = firebase.firestore();
    }

    /*
     * Boot up the synchronisation process
     */
    boot(table, document) {
        console.log(table, document);

        return "father was right";
    }

    /*
     * Send data to the online firebase store
     * Perform offline -> online synchronization
     */
    upload() {
        console.log(this.db);
    }

    /*
     * Fetch data from the online firebase store
     * Perform online -> offline synchronization
     */
    download() {

    }
}
