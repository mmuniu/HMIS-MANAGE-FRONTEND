/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-07
* Time: 20:56
*/

<template>
    <div>
        <v-card>
            <v-card-title>
                <h3 class="title">Recorded Sync Facilities</h3>

                <v-tooltip top>
                    <v-btn color="purple" small outline slot="activator">
                        <span v-if="currentFacilityIdentifier">{{ currentFacilityIdentifier }}</span>
                        <span v-else>NOT SET!</span>
                    </v-btn>
                    <span>Current Facility Identifier</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <collabmed-loading v-if="! initialised" type="epic-hollow-dots" :display-text="false"></collabmed-loading>

                <v-row  v-else>
                    <v-col cols="12" md="7">
                        <div v-if="currentFacility && currentFacility.sync_to_facility_identifier">
                            <v-tooltip top>
                                <v-btn outline color="green" type="button" slot="activator">
                                    <span class="font-weight-bold pr-2">{{ currentFacility.name }}</span>
                                    is set to sync to
                                    <span class="font-weight-bold pl-2">{{ getSyncToFacility('name') }}</span>
                                </v-btn>

                                <span>{{ currentFacility.url }} -> {{ getSyncToFacility('url') }}</span>
                            </v-tooltip>
                        </div>

                        <v-btn v-else color="green" dark @click="match()" :loading="saveLoader">
                            <v-icon>compare_arrows</v-icon> Match Sync Facility
                        </v-btn>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-btn :disabled="!currentFacility || !currentFacility.sync_to_facility_identifier" color="teal" dark @click="authorize()" :loading="syncing">
                            <v-icon>cached</v-icon> Trigger Sync
                            <span slot="loader">
                                <v-icon class="custom-loader fa-spin">cached</v-icon>
                                Syncing...
                            </span>
                        </v-btn>
                    </v-col>
                    <v-col cols="6" md="2">
                        <v-btn color="primary" dark @click="create()">
                            <v-icon>add</v-icon> Add New
                        </v-btn>
                    </v-col>
                </v-row>

            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>

                    <v-container>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-text-field
                                        v-model="search"
                                        append-icon="search"
                                        label="Search from loaded results"
                                        hide-details
                                ></v-text-field>
                            </v-col>
                        </v-row>

                        <v-row >
                            <v-col cols="12" :class="[updates.length > 0 ? 'md9' : 'md12']">

                                <v-data-table
                                        :headers="facilities.headers"
                                        :items="facilities.data"
                                        :search="search"
                                        :loading="saveLoader"
                                        hide-default-footer
                                        class="mb-3"
                                        flat
                                        disable-initial-sort
                                >
                                    <template v-slot:item.name="{ item }">
                                        {{ item.name }}
                                        <p class="grey--text">{{ item.url }}</p>
                                    </template>
                                    <template v-slot:item.identifier="{ item }">
                                        {{ item.identifier }}
                                        <p class="green--text" v-if="item.identifier == currentFacilityIdentifier">
                                            Current Facility
                                        </p>
                                    </template>
                                    <template v-slot:item.last_synced_at="{ item }">
                                        {{ item.last_synced_at }}
                                        <small v-if="item.last_synced_at_w3c">~ {{ item.last_synced_at_w3c | moment('from') }}</small>
                                    </template>
                                    <template v-slot:item.actions="{ item }">
                                        <v-btn dark icon small color="primary" @click="edit(item)" :loading="saveLoader">
                                            <v-icon small>edit</v-icon>
                                        </v-btn>

                                        <v-tooltip top>
                                            <template v-slot:activator="{ on }">
                                                <v-btn dark icon small
                                                       color="green"
                                                       v-on="on"
                                                       @click="updateToken(item)"
                                                       :loading="saveLoader"
                                                >
                                                    <v-icon small>lock</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Access Token</span>
                                        </v-tooltip>
                                    </template>
                                </v-data-table>
                            </v-col>

                            <v-col cols="12" :class="[updates.length > 0 ? 'md3' : 'md12']">
                                <div v-if="updates.length > 0" class="elevation-1 px-2 ml-2">
                                    <v-container>
                                        <v-row >
                                            <v-col cols="10">
                                                <h4 class="grey--text title">Sync Updates</h4>
                                            </v-col>
                                            <v-col cols="2">
                                                <v-tooltip top>
                                                    <v-btn small icon dark color="blue" @click="clearUpdates()" slot="activator">
                                                        <v-icon>clear_all</v-icon>
                                                    </v-btn>
                                                    <span>Clear</span>
                                                </v-tooltip>
                                            </v-col>
                                        </v-row>
                                    </v-container>

                                    <transition-group
                                            name="slideInDown"
                                            mode="out-in"
                                            tag="ul"
                                            class="updates-list"
                                            enter-active-class="animated fadeInDown"
                                            leave-active-class="animated slideOutRight"
                                    >
                                        <li v-for="item in updates" :key="item.id">
                                            <p>
                                                {{ item.message }}
                                                <br/>
                                                <small class="grey--text">
                                                    {{ item.sync_from_facility_identifier }}
                                                    <v-icon small>keyboard_arrow_right</v-icon>
                                                    {{ item.sync_to_facility_identifier }}
                                                </small>
                                            </p>
                                        </li>
                                    </transition-group>

                                </div>
                            </v-col>

                        </v-row>

                    </v-container>

                </div>
            </v-card-text>
        </v-card>

        <!--dialog-->
        <v-dialog v-model="dialog.add" max-width="500" persistent>
            <v-card>
                <v-card-title primary-title class="blue white--text">
                    <div>
                        <p class="headline">Add a New Sync Facility</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <v-text-field v-model="obj.name"
                                  label="Facility Name"
                                  :error="errors.has('name')"
                                  :hint="errors.get('name')" persistent-hint
                                  @keyup="errors.clear('name')"
                    ></v-text-field>

                    <v-text-field v-model="obj.identifier"
                                  label="Facility Identifier -> Should be exact as set in the facility's environment"
                                  :error="errors.has('identifier')"
                                  :hint="errors.get('identifier')" persistent-hint
                                  @keyup="errors.clear('identifier')"
                    ></v-text-field>

                    <v-text-field v-model="obj.url"
                                  label="URL for the sync database (Including http(s)://)"
                                  :error="errors.has('url')"
                                  :hint="errors.get('url')" persistent-hint
                                  @keyup="errors.clear('url')"
                    ></v-text-field>

                </v-card-text>

                <v-card-actions>
                    <v-btn dark outline color="orange" @click="close" :loading="saveLoader">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn dark color="primary" @click="save" :loading="saveLoader">Save</v-btn>

                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--dialogedit-->
        <v-dialog v-model="dialog.edit" max-width="500" persistent>
            <v-card>
                <v-card-title primary-title class="blue white--text">
                    <div>
                        <p class="headline">Edit Sync Facility Details</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text v-if="selected.id">

                    <v-text-field v-model="selected.name"
                                  label="Facility Name"
                                  :error="errors.has('name')"
                                  :hint="errors.get('name')" persistent-hint
                                  @keyup="errors.clear('name')"
                    ></v-text-field>

                    <v-text-field v-model="selected.identifier"
                                  label="Facility Identifier -> Should be exact as set in the facility"
                                  :error="errors.has('identifier')"
                                  :hint="errors.get('identifier')" persistent-hint
                                  @keyup="errors.clear('identifier')"
                    ></v-text-field>

                    <v-text-field v-model="selected.url"
                                  label="URL for the sync database (Including http(s)://)"
                                  :error="errors.has('url')"
                                  :hint="errors.get('url')" persistent-hint
                                  @keyup="errors.clear('url')"
                    ></v-text-field>

                </v-card-text>

                <v-card-actions>
                    <v-btn dark outline color="orange" @click="close" :loading="saveLoader">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn dark color="primary" @click="update" :loading="saveLoader">Save</v-btn>

                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--dialogtokens-->
        <v-dialog v-model="dialog.tokens" max-width="500" persistent>
            <v-card>
                <v-card-title primary-title class="green white--text">
                    <div>
                        <p class="headline">Edit Sync Facility Access Tokens</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text v-if="selected.id">

                    <h4 class="title">{{ selected.name }}</h4>

                    <v-text-field v-model="selected.token.client_id"
                                  label="Client ID"
                                  hint="Generate these via terminal: php artisan passport:client"
                    ></v-text-field>

                    <v-textarea v-model="selected.token.client_secret"
                                  label="Client Secret"
                    ></v-textarea>

                    <v-alert v-if="errors.any()" type="error" :value="true">
                        <div v-html="errors.display()"></div>
                    </v-alert>

                </v-card-text>

                <v-card-actions>
                    <v-btn dark outline color="orange" @click="close" :loading="saveLoader">Close</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn dark color="primary" @click="saveToken" :loading="saveLoader">Save</v-btn>

                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--dialog match-->
        <v-dialog v-model="dialog.match" max-width="50%" persistent>
            <v-card v-if="facilities">
                <v-card-title primary-title class="blue white--text">
                    <div>
                        <p class="headline">Match Sync Facilities</p>
                        <p>Specify this facility syncs with which cloud facility</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <v-container>

                        <v-row >
                            <v-col cols="12" md="4">
                                <v-select
                                        :items="facilitiesForSelects"
                                        label="Local (Sync From)"
                                        hint="Ideally, manually select this platform"
                                        item-text="name"
                                        return-object persistent-hint
                                        v-model="syncData.from"
                                        class="ml-2"
                                ></v-select>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-select
                                        :items="facilitiesForSelects"
                                        label="Remote (Sync To)"
                                        item-text="name"
                                        return-object
                                        v-model="syncData.to"
                                        class="ml-2"
                                ></v-select>
                            </v-col>

                            <v-col cols="12" md="3">
                                <v-btn dark color="teal" @click="saveMatch()" :loading="saveLoader">
                                    <v-icon>compare_arrows</v-icon>
                                    Match
                                </v-btn>
                            </v-col>
                        </v-row>

                    </v-container>

                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" flat @click="close()">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Facility from "@sync/libs/facilities/Facility";

export default {
    data() {
        return {
            obj: new Facility(),
            saveLoader: false,
            dialog: {
                add: false,
                edit: false,
                tokens: false,
                match: false,
            },
            syncing: false,
            facilities: null,
            facilitiesForSelects: null,
            search: "",
            selected: {},
            currentFacilityIdentifier: null,
            currentFacility: null, // this facility
            syncData: {},
            updates: [],
            interval: null,
        };
    },

    computed: {
        ...mapGetters([
            "getSyncFacilities",
        ]),

        initialised() {
            return this.facilities;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        saved() {
            return this.obj.saved;
        },

        hasAuthorized() {
            return this.obj.hasAuthorized;
        },

        authorizing() {
            return this.obj.authorizing;
        },
    },

    watch: {
        getSyncFacilities(val) {
            if (val) {
                this.facilities = val;
                this.facilitiesForSelects = _.map(val.data, (item) => {
                    const text = item.name + " (" + item.url + ")";

                    return {
                        id: item.id,
                        name: text,
                        url: item.url,
                        identifier: item.identifier,
                        token: item.token,
                    };
                }),

                this.setCurrentFacility();
            }
        },

        submitted(val) {
            this.saveLoader = false;
        },

        contaminated(val) {
            this.saveLoader = false;
            if (val) {
                this.obj.form.errorDetected = false;
            }
        },

        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.close();
                this.obj.saved = false;
                this.initialise();
            }
        },

        currentFacilityIdentifier(val) {
            if (val) {
                this.setCurrentFacility();
                this.listenToPusher();
            }
        },

        hasAuthorized(val) {
            this.saveLoader = false;

            if (val) {
                this.trigger();
                this.obj.hasAuthorized = false;
            }
        },

        authorizing(val) {
            this.saveLoader = val;
        },

        updates(val) {
            if (val.length < 1 && this.interval) {
                clearInterval(this.interval);
            }
        },
    },

    methods: {
        ...mapActions([
            "setSyncFacilities",
        ]),

        initialise() {
            this.setSyncFacilities();
            this.getConfig();
        },

        async getConfig() {
            this.currentFacilityIdentifier = await this.$options.methods.mconfig("sync.config.identifier");
        },

        create() {
            this.dialog.add = true;
        },

        close() {
            this.dialog.add = false;
            this.dialog.edit = false;
            this.dialog.tokens = false;
            this.dialog.match = false;
            this.selected = {};
        },

        save() {
            this.saveLoader = true;

            this.obj.save();
        },

        edit(item) {
            this.selected = item;
            this.dialog.edit = true;
        },

        update() {
            this.saveLoader = true;

            this.obj.update(this.selected);
        },

        updateToken(item) {
            this.selected = item;
            if (! this.selected.hasOwnProperty("token") || ! this.selected.token) {
                this.selected["token"] = {
                    client_id: null,
                    client_secret: null,
                };
            }

            this.dialog.tokens = true;
        },

        saveToken() {
            this.saveLoader = true;
            this.obj.updateToken(this.selected);
        },

        trigger() {
            const from = this.syncData.from;
            const to = this.syncData.to;
            if (! from.url || ! to.url) {
                flash({ message: "Selected facilities could not be synced! Missing url", alert: "error" });
                return;
            }

            this.syncing = true;
            this.obj.triggerSync(from, to);
        },

        clearUpdates() {
            this.interval = setInterval(() => {
                this.updates.splice(0, 1);
            }, 300);
        },

        authorize() {
            const from = this.currentFacility;
            const to = this.getSyncToFacility();

            if (! to.token) {
                flash({ message: "OAuth Token not set! Process Cannot proceed", alert: "error" });
                return;
            }

            this.syncData.from = from;
            this.syncData.to = to;

            flash({ message: "Authorizing now. Wait confirmation before proceeding", alert: "info" });

            this.saveLoader = true;
            this.obj.getAccessToken(to);
        },

        listenToPusher() {
            const channel = `for_facility_${this.currentFacilityIdentifier}`;
            Echo.channel(channel)
                .listen(".Ignite\\Sync\\Events\\SyncUpdateOccurred", (e) => {
                    this.updates.unshift(e.message);
                });
        },

        getSyncToFacility(column = null) {
            const found = _.find(this.facilities.data, { identifier: this.currentFacility.sync_to_facility_identifier });
            if (found) {
                if (column) {
                    return found[column];
                }

                return found;
            }

            return null;
        },

        setCurrentFacility() {
            if (! this.currentFacilityIdentifier || ! this.facilities) {
                return;
            }

            const found = _.find(this.facilities.data, { identifier: this.currentFacilityIdentifier });
            if (found) {
                this.currentFacility = found;
            }
        },

        match() {
            this.dialog.match = true;
        },

        saveMatch() {
            const from = this.syncData.from;
            const to = this.syncData.to;

            const data = {
                local_identifier: this.syncData.from.identifier,
                remote_identifier: this.syncData.to.identifier,
            };

            this.saveLoader = true;
            this.obj.saveMatch(data);
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">
    .updates-list {
        max-height: 400px;
        overflow-y: auto;

        li {
            line-height: 1.4;
            word-wrap: break-word;
        }
    }
</style>
