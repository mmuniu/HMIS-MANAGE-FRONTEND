
  <template v-for="item in visit.investigations" :key="item.id">
    <tr v-if="transferred2cash(item.id)">
      <!-- If paid or invoiced -->
      <template v-if="item.is_paid || item.invoiced">
        <td><input type="checkbox" disabled /></td>
        <td>
          <span v-if="item.is_paid" class="label label-success">Paid</span>
          <span v-else-if="item.invoiced" class="label label-warning">Invoiced</span>
          {{ item.procedures.name }}
          <i class="small">({{ item.nice_type }})</i> - Ksh {{ item.amount ?? item.price }}
        </td>
      </template>

      <!-- If not paid or invoiced -->
      <template v-else>
        <td>
          <input
              type="checkbox"
              :value="item.id"
              :data-price="item.amount ?? item.price"
              name="investigations[]"
              :disabled="shouldDisable(item)"
              :title="getCheckboxTitle(item)"
          />
        </td>
        <td>
          {{ item.procedures.name }}
          <i class="small">({{ item.nice_type }})</i> -
          Ksh <span class="topay">{{ item.amount ?? item.price }}</span>
        </td>
      </template>
    </tr>
  </template>


<script>
export default {
  props: {
    visit: {
      type: Object,
      required: true,
    },
    transferred2cash: {
      type: Function,
      required: true,
    },
  },
  methods: {
    shouldDisable(item) {
      const price = item.amount ?? item.price ?? 0
      return price === 0 || (item.removed_bills && item.removed_bills.length > 0)
    },
    getCheckboxTitle(item) {
      if (item.amount === 0 || item.price === 0) return 'Cannot bill a 0 Ksh item'
      if (item.removed_bills && item.removed_bills.length > 0) return 'Removed from billing'
      return ''
    },
  },
}
</script>

<style scoped>
.label {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}
.label-success {
  background-color: #4caf50;
  color: white;
}
.label-warning {
  background-color: #ff9800;
  color: white;
}
</style>
