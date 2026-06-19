/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 22/09/2019
* Time: 18:47
*/

<template>
    <v-container fluid style="padding: 0
">
        <v-row >
            <v-col>
                <component v-if="targetComponent" :is="targetComponent"></component>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import { list } from "../routes";

export default {
    props: {
        decoratorKey: {
            required: true,
            type: String,
        },

        module: {
            required: true,
            type: String,
        },

        child: {
            type: String,
        },
    },

    data() {
        return {
            list: list,
            targetComponent: null,
        };
    },

    computed: {

    },

    watch: {
        //
    },

    methods: {
        getComponent() {
            const found = _.find(this.list, (item) => {
                return item.module == this.module && item.name == this.decoratorKey;
            });


            if (this.child) {
                if (found) {
                    this.targetComponent = require(`@reports/components/${found.module}/${found.name}/children/Index`).default;
                    return;
                }
            } else {
                if (found) {
                    this.targetComponent = require(`@reports/components/${found.component}`).default;
                    return;
                }
            }


            flash({ message: "Component not found!", alert: "error" });
        },
    },

    mounted() {
        this.getComponent();
    },
};
</script>

<style scoped lang="scss">

</style>
