<template>
    <v-card flat>
        <v-card-title>
            <div class="body-2 ma-0 pa-0 grey--text">
                <span class="px-2">1.) Download the system list of procedures to excel here:
                    <download-to-excel :filters="filters" :url="url" :filename="filename" :requestType="requestType"></download-to-excel>
                </span> <br/>
                <span class="px-2">
                    2.) To ensure smooth and complete upload, format your excel in the format shown </span>
                <br/>
                <span class="px-2">
                    3.) Scheme price: refers to scenarios where the normal insurance price
                    does not apply but instead the system should pick the price specified for the scheme
                </span>
                <br/>
                <span class="px-2">
                    4.) To include an already excluded procedure, just leave the
                    scheme price and the excluded empty or defaulted to 0
                </span>
                <br/>
                <span class="px-2">
                    5.) Finally, after the upload, this process happens in the
                    background, once uploaded, you can check in later to see and verify the upload success
                </span>
                <br/>
            </div>

            <v-row style="font-size: 12px; font-weight: bold">
                <v-col>Procedure Id</v-col>
                <v-col>Procedure name</v-col>
                <v-col>Facility Id </v-col>
                <v-col>Cash price </v-col>
                <v-col>Insurance price</v-col>
                <v-col>Scheme price</v-col>
                <v-col>Excluded</v-col>
                <v-col>Scheme Id</v-col>
            </v-row>
        </v-card-title>

        <v-card-text>
            <div class="mx-3">
                <v-row >
                    <v-col>
                        <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
                    </v-col>
                    <v-col>
                        <v-btn small color="primary" :disabled="loading" @click="uploadExcel()">
                            <v-progress-circular
                                    indeterminate
                                    v-if="loading"
                                    :size="10"
                                    :width="2"
                                    color="primary"
                            ></v-progress-circular>
                            upload
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import SchemeObj from "@settings/libs/schemes/Scheme";

export default {
    props: [
        "scheme",
    ],

    data() {
        return {
            filename: "procedures_list",
            requestType: "get",
            schemeObj: new SchemeObj(),
            loading: false,
            filters: {
                scheme_id: this.scheme,
            },
        };
    },

    computed: {
        url() {
            return `/api/evaluation/procedures?export=true&scheme_id=${this.scheme}`;
        },
    },

    methods: {
        onChangeFileUpload() {
            this.schemeObj.excel = this.$refs.file.files[0];
            this.schemeObj.scheme_id = this.scheme;
        },

        uploadExcel() {
            const self = this;

            this.loading = true;

            this.schemeObj.uploadExcel("procedures").then((response) => {
                self.$emit("uploadingExcel");
                self.loading = false;
            });
        },
    },
};
</script>
