@extends('layouts.app')

@section('title', 'Voucher Management')

@section('content')
<div id="voucher-management-app">
    <voucher-management></voucher-management>
</div>
@endsection

@section('scripts')
<script>
    Vue.component('voucher-management', require('@finance/components/vouchers/VoucherManagement.vue').default);

    new Vue({
        el: '#voucher-management-app'
    });
</script>
@endsection
