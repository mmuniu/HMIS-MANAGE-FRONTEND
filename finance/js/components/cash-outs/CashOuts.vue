<template>
    <div class="pt-3">
        <div v-if="resource">
            <h4 style="text-decoration: underline">Cash outs: </h4>

            <div>
                <span>{{ resource.issued_out_by }}</span> issued out
                <span class="font-weight-black"> {{ resource.amount | numberFormat }}</span> to
                <span>{{ resource.issued_to }} </span> on
                <span>{{ resource.date }}</span>
            </div>

            <div>
                Amount receiving status:
                <v-chip small color="primary" class="white--text">{{ resource.received_by }}</v-chip>
                <v-btn small
                       :disabled="!resource.can_receive"
                       color="purple"
                       rounded
                       class="mx-3 whit--text"
                       @click="receiveCash(resource.id)">
                    receive
                </v-btn>
            </div>

            <div>
                <br/>
                <h6>comments:</h6>
                <span>{{ resource.comments }}</span>
            </div>
        </div>

        <br/>

        <v-dialog  v-model="dialog" persistent
                  max-width="40%" >
            <template v-slot:activator="{ on }">
                <v-btn color="primary"
                       :disabled="resourceReceived"
                       v-on="on">
                    {{ resourceReceived ? "Amount received" : "issue out money" }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title class="headline primary white--text">
                    Give out money to acquire the items
                </v-card-title>
                <v-card-text>
                    <div class="mt-4">
                        <v-row>
                            <v-col cols="12">
                                <users-search @results="issueMoneyTo"
                                              label="Issue money to:"
                                              :placeholder="cashOut.issue_to ? cashOut.issue_to : 'Issue money to:'"
                                              leaveSelected
                                              required
                                              @clearedSelected="removeIssueMoneyTo"
                                ></users-search>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="amount"
                                              v-model="cashOut.amount"
                                              type="number"
                                              required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea label="comments"
                                            v-model="cashOut.comments"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="button" color="error darken-1" @click="dialog = false">Cancel</v-btn>
                    <v-btn type="submit" color="primary darken-1" @click="issueOutMoney()">Submit</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import CashOut from '@finance/libs/cash-outs/CashOuts';

export default {
    props: {
        resourceId: {
            type: Number,
            required: true,
        },

        resource: {
            type: Object,
            default: null,
        },

        moneyFor: {
            type: String,
            default: null
        }
    },

    data: () => ({
        dialog: false,
        resourceReceived: false,
        cashOut: new CashOut(),
    }),

    methods: {
        async issueOutMoney() {
            this.cashOut.resource_id = this.resourceId;

            const response = await this.cashOut.issueOutMoney();

            if (response) {
                this.dialog = false;

                this.$emit('recorded');
            }
        },

        issueMoneyTo(user) {
            this.cashOut.issued_out_to = user.id;
        },

        removeIssueMoneyTo() {
            this.cashOut.issued_out_to = null;
        },

        async receiveCash(resource_id) {
            const response = await this.cashOut.receiveCash(resource_id);

            if (response) {
                this.$emit('recorded');
            }
        },
    },

    mounted() {
        if (this.resource) {
            this.cashOut.assemble(this.resource);
            this.resourceReceived = this.resource.received ? true : false;
        }
        this.cashOut.money_for = this.moneyFor;
    },
};
</script>
