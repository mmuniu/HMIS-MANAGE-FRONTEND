<template>
  <form @submit.prevent="submitForm" class="form-horizontal">
    <input type="hidden" v-model="form.schedule.scheduled_by" />
    <input type="hidden" v-model="form.schedule.booking_id" />

    <div class="row">
      <div class="col-md-12">
        <h4 class="form-legend">Scheduling details</h4>

        <!-- Operation Room -->
        <div class="form-group req" :class="{ 'has-error': errors['schedule.theatre_id'] }">
          <label for="theatre_id" class="col-md-3">Select an operation room</label>
          <div class="col-md-9">
            <select
              id="theatre_id"
              class="form-control"
              v-model="form.schedule.theatre_id"
              required
            >
              <option disabled value="">-- select --</option>
              <option v-for="(label, id) in theatres" :key="id" :value="id">
                {{ label }}
              </option>
            </select>
            <span class="help-block" v-if="errors['schedule.theatre_id']">{{ errors['schedule.theatre_id'][0] }}</span>
          </div>
        </div>

        <!-- Operation Date -->
        <div class="form-group req" :class="{ 'has-error': errors.date }">
          <label class="col-md-3">Schedule operation date</label>
          <div class="col-md-9">
            <collabmed-date-time-picker
            small
            outline
            @input="setOperationDate"
            date-only
            :datetime="form.date"
            label="Schedule operation date"
        />

            <span class="help-block" v-if="errors.date">{{ errors.date[0] }}</span>
          </div>
        </div>

        <!-- Start Time -->
        <div class="form-group req" :class="{ 'has-error': errors.start_time }">
          <label class="col-md-3">Schedule start time</label>
          <div class="col-md-9">
            <collabmed-date-time-picker
            small
            outline
            @input="setStartTime"
            time-only
            :datetime="form.start_time"
            label="Schedule start time"
        />
            <span class="help-block" v-if="errors.start_time">{{ errors.start_time[0] }}</span>
          </div>
        </div>

        <!-- End Time -->
        <div class="form-group req" :class="{ 'has-error': errors.end_time }">
          <label class="col-md-3">Schedule end time</label>
          <div class="col-md-9">
            <collabmed-date-time-picker
            small
            outline
            @input="setEndTime"
            time-only
            :datetime="form.end_time"
            label="Schedule end time"
        />
            <span class="help-block" v-if="errors.end_time">{{ errors.end_time[0] }}</span>
          </div>
        </div>

        <!-- Submit -->
        <div class="form-group text-right">
          <div class="col-md-12">
            <br />
            <button class="btn btn-success" type="submit">Save details</button>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>


export default {
  components: {

  },
  props: {
    bookingId: Number,
    userId: Number,
    theatres: Object,
  },
  data() {
    const now = new Date();
    const startHour = now.getHours();
    const endHour = (startHour + 1) % 24; // Ensure it wraps around if needed
    
    return {
      form: {
        schedule: {
          scheduled_by: this.userId,
          booking_id: this.bookingId,
          theatre_id: "",
        },
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        start_time: `${String(startHour).padStart(2, '0')}:00`,
        end_time: `${String(endHour).padStart(2, '0')}:00`,
      },
      errors: {},
      timeConfig: {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        minuteIncrement: 15,
        allowInput: true,
        static: true,
        locale: {
          firstDayOfWeek: 1,
          time_24hr: true
        }
      }
    };
  },
  methods: {
    validateTimeFormat(time) {
      // Strict 24-hour format validation
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    },
    setStartTime(datetime) {
            this.form.start_time = datetime;
        },
        setEndTime(datetime) {
            this.form.end_time = datetime;
        },
        setOperationDate(datetime) {
            this.form.date = datetime;
        },
    async submitForm() {
      console.log(this.form)
      this.errors = {};

      // Basic frontend validation
      if (!this.form.schedule.theatre_id) {
        this.errors['schedule.theatre_id'] = ['Please select an operation room.'];
      }
      if (!this.form.date) {
        this.errors.date = ['Please select a date.'];
      }
      if (!this.form.start_time ) {
        this.errors.start_time = ['Please enter a valid start time in 24-hour format (HH:MM).'];
      }
      if (!this.form.end_time ) {
        this.errors.end_time = ['Please enter a valid end time in 24-hour format (HH:MM).'];
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }

      // Convert times to minutes for comparison
      const startMinutes = this.timeToMinutes(this.form.start_time);
      const endMinutes = this.timeToMinutes(this.form.end_time);

      // Additional validation for time sequence
      if (startMinutes >= endMinutes) {
        this.errors.end_time = ['End time must be after start time.'];
        return;
      }

      try {
        const payload = {
        date: this.form.date,
        start_time: this.form.start_time,
        end_time: this.form.end_time,
        schedule: {
          scheduled_by: this.userId,
          booking_id: this.bookingId,
          theatre_id: this.form.schedule.theatre_id
        }
      };

        const response = await axios.post(`/theatre/booking/${this.bookingId}/schedule`, payload);
        flash(response);
        
        // Optionally emit an event or redirect
      } catch (error) {
        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors || {};
        } else {
          flash('red',"Something went wrong!");
          console.error(error);
        }
      }
    },
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }
  },
};
</script>

<style scoped>
.has-error input,
.has-error select {
  border-color: #dc3545;
}
.help-block {
  color: #dc3545;
}
</style>