    <template>
    <div class="evaluate">
        <nav class="navio text-left">
            <v-btn-toggle flat>
                <router-link tag="v-btn" v-for="(nav, index) in navigation" exact
                             :to="usher(nav)" active-class="active" :key="index" class="text-center">
                    <a>{{ visuals(nav) }}</a>
                </router-link>
            </v-btn-toggle>
        </nav>

        <div class="mt-4">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
    props: [
        "visitId", "item",
    ],

    data() {
        return {
            navigation: [
                { "monitoring": "Monitoring" },
                {"doctors-notes":"Doctor's Notes"},
                { "investigations": "Procedures" },
                { "procedures": "Investigations" },
                // { "consumables": "Consumables" },
                { "post-dialysis-notes": "Post Dialysis Notes" },
            ],
        };
    },

    methods: {
        usher(nav) {
            return route("dialysis.evaluate", [this.visitId, Object.keys(nav)[0]]).relative();
        },

        visuals(nav) {
            return nav[Object.keys(nav)[0]];
        },
    },
};
</script>
