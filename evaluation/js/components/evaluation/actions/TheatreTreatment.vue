<template>
  <div>
    <!-- Order procedures for a visit -->
    <v-card class="mb-4">
      <v-card-text>
        <theatre-order-procedures
            :items="items"
            :domain="domain"
            :visit_identifier="visit_id"
            :destination="destination"
            :admission_id="admission_id"
            :operation_id="operation_id"
            :user_id="user"
            :visit_id="visit_id"

        ></theatre-order-procedures>
      </v-card-text>
    </v-card>

    <!-- List of all the ordered procedures during the visit -->
    <v-card>
      <v-card-title class="text-bold grey--text text--darken-1">
        List of ordered procedures
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <ordered-procedures :domain="domain" :visit_identifier="visit_id" :destination="destination"></ordered-procedures>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: [
    'visit_id', 'destination', 'admission_id','user','operation_id','visit'
  ],

  data() {
    return {
      items: [],
      domain: 'treatment',
    };
  },

  methods: {
    checkCurrentModule() {
      const arr = this.$route.path.split('/');

      return arr[1];
    },
  },

  async mounted() {
    if (this.checkCurrentModule() == 'inpatient') {
      this.items.push('Inpatient');
    }

    const route = this.$route.path.split('/');

    if(this.destination !== 'inpatient')
    {
      try {
        this.loading = true;
        // Make API call to fetch patients based on search input
        const response = await fetch(`/api/settings/associated/procedure/category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ slug: route[5] })
        });
        const data = await response.json();
        this.items = data; // Assuming your API returns an array of patient data
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        this.loading = false;
      }

    }
    else
    {
      this.items = ['Doctor', 'Nurse', 'OPD']
    }


  },
};
</script>
