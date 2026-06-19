<template>
    <div class="voucher-container">
        <!-- Main Content Area -->
        <div class="content-area">
            <!-- Header -->
            <div class="header-section">
                <div class="brand">
                    <div class="brand-name">Xana LIFE</div>
                    <div class="brand-tagline">Every Day Better</div>
                </div>
                <div class="voucher-title">
                    <span class="title-label">Gift</span>
                    <span class="title-value">VOUCHER</span>
                </div>
            </div>

            <!-- Divider Line -->
            <div class="divider"></div>

            <!-- Redemption Details -->
            <div class="details-section">
                <div class="redeemable-text">
                    Redeemable at any Xanalife checkout
                </div>
                <div class="categories-section">
                    <div class="categories-label">Valid across all categories :</div>
                    <div class="categories-list">
                        <span class="category-item" v-for="(category, index) in categories" :key="category">
                            {{ category }}{{ index < categories.length - 1 ? ', ' : '.' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Divider Line -->
            <div class="divider"></div>

            <!-- Value Display with Bow Shape -->
            <div class="value-section">
                <div class="value-content">
                    <div class="currency-symbol">KShs.</div>
                    <div class="value-amount">{{ formattedAmount }}</div>
                </div>
            </div>

            <!-- Divider Line -->
            <div class="divider"></div>

            <!-- Terms -->
            <div class="terms-section">
                <div class="terms-text">Non-refundable | Use in-store only</div>
            </div>
        </div>

        <!-- Logo at Top Left Corner -->
        <div class="logo-container">
            <img src="/xanalogo.png" alt="Xana Life Logo" class="voucher-logo" />
        </div>

        <!-- QR Code at Bottom Left Corner -->
        <div class="qr-section">
            <div class="qr-container">
                <div v-if="qrCodePath" class="qr-code">
                    <img :src="qrCodePath" :alt="'QR Code for ' + voucherCode" class="qr-image" />
                </div>
                <div v-else class="qr-placeholder">
                    <div class="qr-text">QR CODE</div>
                    <div class="qr-pattern">
                        <div v-for="i in 25" :key="i" 
                             :class="['qr-pixel', i % 3 === 0 ? 'qr-pixel-dark' : 'qr-pixel-light']"></div>
                    </div>
                    <div class="qr-subtext">Scan to redeem</div>
                </div>
            </div>
            <div class="qr-caption">Scan QR to Redeem</div>
        </div>

        <!-- Optional Voucher Code Display -->
        <div v-if="voucherCode" class="voucher-code-section">
            Code: {{ voucherCode }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'XanaVoucher',
    props: {
        qrCodePath: {
            type: String,
            default: ''
        },
        voucherCode: {
            type: String,
            default: ''
        },
        expiryDate: {
            type: String,
            default: ''
        },
        amount: {
            type: Number,
            default: 2000
        },
        categories: {
            type: Array,
            default: () => ['Supermarket', 'Pharmacy', 'Bakery', 'Cafe', 'Wholesale', 'Wineshop']
        }
    },
    computed: {
        formattedAmount() {
            return this.amount.toLocaleString();
        }
    }
}
</script>

<style scoped>
/* Container - Wider for bow shape */
.voucher-container {
    width: 130mm;
    height: 70mm;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Arial', 'Helvetica', sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    border: 1px solid #e2e8f0;
}

/* Main Content Area - Centered */
.content-area {
    width: 100%;
    padding: 20px 25px;
    padding-left: 100px; /* Space for left column */
    padding-right: 100px; /* Space for right side elements */
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Logo Container - Top Left Corner */
.logo-container {
    position: absolute;
    top: 10px;
    left: 15px;
    width: 80px;
    height: auto;
    z-index: 10;
}

.voucher-logo {
    width: 80px;
    height: auto;
    opacity: 0.9;
}

/* QR Section - Bottom Left Corner */
.qr-section {
    position: absolute;
    bottom: 15px;
    left: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70px;
}

.qr-container {
    width: 70px;
    height: 70px;
    background: white;
    border-radius: 6px;
    padding: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #cbd5e0;
}

.qr-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.qr-text {
    font-size: 8px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
}

.qr-pattern {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 1px;
    width: 40px;
    height: 40px;
}

.qr-pixel {
    width: 100%;
    height: 100%;
}

.qr-pixel-dark {
    background-color: #1a202c;
}

.qr-pixel-light {
    background-color: #cbd5e0;
}

.qr-subtext {
    font-size: 7px;
    color: #718096;
    margin-top: 2px;
}

.qr-caption {
    font-size: 8px;
    color: #4a5568;
    font-weight: 600;
    margin-top: 4px;
    text-align: center;
    letter-spacing: 0.3px;
}

/* Header Section */
.header-section {
    margin-bottom: 10px;
    text-align: center;
    width: 100%;
}

.brand {
    margin-bottom: 15px;
}

.brand-name {
    font-size: 22px;
    font-weight: 700;
    color: #1a202c;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.brand-tagline {
    font-size: 13px;
    color: #4a5568;
    font-weight: 500;
    margin-top: 2px;
    letter-spacing: 0.3px;
}

.voucher-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.title-label {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.title-value {
    font-size: 32px;
    font-weight: 800;
    color: #1a202c;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: -5px;
}

/* Divider Lines */
.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #cbd5e0 50%, transparent 100%);
    margin: 12px 0;
    width: 100%;
}

/* Details Section */
.details-section {
    margin: 8px 0;
    text-align: center;
    width: 100%;
}

.redeemable-text {
    font-size: 15px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
    line-height: 1.4;
}

.categories-section {
    margin-top: 10px;
}

.categories-label {
    font-size: 13px;
    color: #4a5568;
    font-weight: 500;
    margin-bottom: 6px;
}

.categories-list {
    font-size: 12px;
    color: #4a5568;
    line-height: 1.5;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
}

.category-item {
    white-space: nowrap;
}

/* Value Display with Bow Shape */
.value-section {
    position: relative;
    width: 100%;
    height: 80px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.value-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 40px;
    transform: skewY(-2deg);
    z-index: 1;
    box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
}

.value-section::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    border-radius: 45px;
    transform: skewY(-2deg);
    z-index: 0;
    opacity: 0.2;
}

.value-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: white;
    padding: 15px 40px;
    width: 100%;
    max-width: 90%;
}

.currency-symbol {
    font-size: 22px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 1px;
    margin-bottom: -5px;
}

.value-amount {
    font-size: 48px;
    font-weight: 800;
    color: white;
    letter-spacing: -1px;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Terms Section */
.terms-section {
    margin-top: 8px;
    padding-top: 8px;
    text-align: center;
    width: 100%;
}

.terms-text {
    font-size: 13px;
    font-weight: 600;
    color: #e53e3e;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

/* Voucher Code Display */
.voucher-code-section {
    position: absolute;
    bottom: 15px;
    right: 20px;
    font-size: 10px;
    color: #718096;
    font-family: 'Monaco', 'Courier New', monospace;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

/* Print Styles */
@media print {
    .voucher-container {
        width: 130mm !important;
        height: 70mm !important;
        box-shadow: none !important;
        border: 1px solid #cbd5e0 !important;
    }
    
    @page {
        size: 130mm 70mm;
        margin: 0;
    }
}
</style>