<template>
    <div v-if="initialised">
        <div v-if="!visit_id">
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="text-body-2 ma-0 pa-0">All sales details report </h2>
                <v-spacer></v-spacer>
                <v-select label="Status"
                          closable
                          :items="['All', 'Paid', 'Pending','Dispensed']"
                          v-model="filters.status"
                ></v-select>
                <product-search @results="productSelected" @selectionCleared="productCleared" :un-clear-selected="true"></product-search>
                <procedure-search active_only
                                  label="Search for service"
                                  @results="procedureSelected"
                >
                </procedure-search>
                <collabmed-date-time-picker outline @input="setStartDate"
                                            :datetime="filters.start_date"
                                            label="Start date">
                </collabmed-date-time-picker>
                <collabmed-date-time-picker outline @input="setEndDate"
                                            :datetime="filters.end_date" label="End date">
                </collabmed-date-time-picker>
            </v-card-title>
            <v-row>
            <v-col>
                    <v-btn color="primary" @click="init()" class="mx-3">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url()" :filename="filename"
                                       requestType="get"
                    ></download-to-excel>
        
                        <v-btn   v-if="station.is_pharmacy" color="primary" @click="dispense()" class="mx-3">Dispense</v-btn>
                        <v-btn   v-else color="primary" @click="process()" class="mx-3">Process</v-btn>
                </v-col>
            </v-row>
        </div>
      <collabmed-loading v-if="sales === null"></collabmed-loading>
        <v-data-table
            v-else
            :headers="headers"
            :items="sales.data"
            item-key="uniqueKey"
            show-select
            v-model="selectedItems"
            class="mb-3" flat
            hide-default-footer
        >
        <template v-slot:item.data-table-select="{ item, select }">
            <v-checkbox
                :input-value="selectedItems.includes(item)"
                @click.stop="select(!selectedItems.includes(item))"
                :disabled="!(item.status === 'Paid' || item.status === 'paid')"
            ></v-checkbox>
        </template>
        
        <template v-slot:item.status="{ item }">
            <span v-if="item.status === 'Paid' || item.status === 'paid'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
            <span v-if="item.status === 'Pending' || item.status === 'pending'" style="color: red">{{ capitalizeStatus(item.status) }}</span>
            <span v-if="item.status === 'Invoiced'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
            <span v-if="item.status === 'Dispensed' || item.status === 'dispensed'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
            <span v-if="item.status === 'Processed'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
    
        </template>
        <template v-slot:item.actions="{ item }">
        <v-chip 
        :color="item.status === 'Dispensed' ? 'green' : 'blue'" 
        text-color="white" 
        @click="printLabel(item)" 
        :disabled="item.status !== 'Dispensed'"
      >
        <template v-if="item.status !== 'Dispensed'">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">Print Label</span>
            </template>
            <span>Not Dispensed</span>
          </v-tooltip>
        </template>
        <template v-else>
          Print Label
        </template>
      </v-chip>
    </template>
            <template v-slot:item.amount="{ item }">
                {{ item.amount | numberFormat }}
            </template>
            <template v-slot:footer="{ item }">
                <v-row>
                    <v-col cols="12" class="text-center">
                        <collabmed-paginator v-if="sales.meta" :meta="sales.meta" @change="navigate" />
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
            <drug-label-printout
            @close="dialogPrintLabel = false"
            :show="dialogPrintLabel"
            :drug="prescription"
            :dispensing_quantity="dispensing_quantity"
            :pos_drug_name="pos_drug_name"
            :is_pos="true"
            :patient_id="patient_id"
            :selected-visit="visit_object">
         </drug-label-printout>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';
import ProductSearch from '@inventory/components/ProductsSearch';
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import Pos from "@inventory/libs/pos/Pos";
import Visit from '@reception/libs/visits/Visit';
import DrugLabelPrintout from '@evaluation/components/evaluation/actions/partials/DrugLabelPrintout';
export default {
    props: [
        'station', 'visit_id',
    ],
    components: {
        ProductSearch,
        ProcedureSearch,
        'drug-label-printout': DrugLabelPrintout,
    },
   
    data: () => ({
        page: 1,
        placeholder: '',
        filename: 'Sale details',
        pos :new Pos(),
        visitObj: new Visit(),
        visit_object: [],
        patient_id:null,
        initial_drug_data:null,
        dispensing_quantity:null,
        pos_drug_name:null,
        filters: {
            station_id: null,
            start_date: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            end_date: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            status: 'All',
            visit_id: null,
            product_id: null,
            service_id: null,
        },
        selectedItems:[],
        dialogPrintLabel: false,
        drug: [],
        prescription:null,
        sales: null,
        headers: [
            { text: 'Product', value: 'product' },
            { text: 'Quantity', value: 'qty' },
            { text: 'Price', value: 'price' },
            { text: 'Amount', value: 'amount' },
            { text: 'Date', value: 'date' },
            { text: 'Status', value: 'status' },
            {text :'Actions', value: 'actions' },
        ],
    }),
    computed: {
        // ...mapGetters({
        //     sales: 'getPosSales',
        // }),
        initialised() {
            return this.station || this.$route.params.station;
        },
    visit() {
      return this.visitObj.selectedVisit;
    },
    },
    watch: {
        station(val) {
            if (val) {
                this.filters.station_id = val.id;
                this.init();//call init when station becomes available
            }
        },
        
    },
    methods: {
        ...mapActions({
            fetchPosSales: 'setPosSales',
        }),
        capitalizeStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
            },
       
        async printLabel(item) {
            //morph the drug now to whats needed in the modal
            //let the drug have prescription deets
            this.initial_drug_data  = await this.visitObj.fetchDrugFromSaleDetails(item.sale_id)
            this.drug = this.initial_drug_data.data.data.drugs
            this.prescription = this.initial_drug_data.data.data.prescription
            this.visitObj.fetch(this.initial_drug_data.data.data.visit_id);
            this.visit_object = this.visitObj.fetchVisit(this.initial_drug_data.data.data.visit_id);
            this.dialogPrintLabel = true;
            this.pos_drug_name = item.product;
            if(item.status === 'Dispensed' || item.status === 'dispensed'){
                this.dispensing_quantity = item.qty
            }
            else{
                
                this.dispensing_quantity = null;
            
            }
         },
      uniqueSales() {
        if (this.sales && this.sales.data) {
       
          return this.sales.data.map(item => ({
            ...item,
            uniqueKey: `${item.sale_id}-${item.product}`,
          }));
        }
        return [];
      },
      
        url() {
            const params = 'station_id=' + this.station.id + '&start_date=' + this.filters.start_date + '&end_date=' + this.filters.end_date + '&status=' + this.filters.status+ '&page=' + this.page;
            return '/api/inventory/posSales?' + params;
        },
        dispense(){
                  const selectedItems = this.selectedItems; // From the v-data-table
            // Ensure that both products and stores are selected
            if (selectedItems.length === 0 ) {
                alert("Please select at least one product and one store.");
                return;
            }
            this.pos.dispenseItems(selectedItems)
        .then(() => {
            // After successfully dispensing, reload the data table
            this.init(); // This will re-fetch the sales data and update the table
            window.location.reload(); // This will reload the current page
        })
        .catch(error => {
            console.error('Error during dispensing:', error);
            alert("An error occurred while dispensing items.");
        });      
      },
      process(){
                  const selectedItems = this.selectedItems; // From the v-data-table
            // Ensure that both products and stores are selected
            if (selectedItems.length === 0 ) {
                alert("Please select at least one product and one store.");
                return;
            }
            this.pos.processItems(selectedItems)
        .then(() => {
            this.init(); // This will re-fetch the sales data and update the table
            window.location.reload(); // This will reload the current page
        })
        .catch(error => {
            console.error('Error during proessing:', error);
            alert("An error occurred while processing items.");
        });      
      },
        setStartDate: function(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate: function(datetime) {
            this.filters.end_date = datetime;
        },
        navigate(page) {
            this.fetch(page);
        },
        productSelected(product) {
            this.placeholder = product.name;
            this.filters.product_id = product.id;
        },
        procedureSelected(procedure) {
            this.filters.service_id = procedure.id;
        },
        productCleared() {
            this.filters.product_id = null;
        },
        async init() {
            if (!this.station || this.station.id === null && false) {
                return;
            }
            const url = this.url();
            try {
                const response = await axios.get(url);
                this.sales = response.data;
                if (this.sales && this.sales.data) {
                    this.sales.data = this.sales.data.map(item => ({
                        ...item,
                        uniqueKey: `${item.sale_id}-${item.product}`,
                    }));
                }
            } catch (error) {
                console.error('Error fetching POS sales:', error);
            }
        },
      async fetch(page = null) {
        if (!this.station || this.station.id === null && false) {
          return;
        }
        this.page = page;
        const url = this.url();
        try {
          const response = await axios.get(url);
          this.sales = response.data;
          if (this.sales && this.sales.data) {
            this.sales.data = this.sales.data.map(item => ({
              ...item,
              uniqueKey: `${item.sale_id}-${item.product}`,
            }));
          }
        } catch (error) {
          console.error('Error fetching POS sales:', error);
        }
      }

    },
    mounted() {
        if (this.station) {
            this.filters.station_id = this.station.id;
        } else {
            this.filters.station_id = this.$route.params.station;
        }
        
        if (this.visit_id) {
            this.filters.visit_id = this.visit_id;
        }
   
        this.init();
      this.uniqueSales();
        if (this.filters.station_id) {
        }
    },
};
</script>
<style scoped>
.v-input--selection-controls__input{
    display:none !important
}
</style>
