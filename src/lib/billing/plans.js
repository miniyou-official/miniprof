// Pro prices in rupees, GST included. The home page and /proyou both read these, so change prices here only.
export const PLANS = {
    monthly: { label: 'Pro monthly', price: 199, period: 'month', days: 30 },
    yearly: { label: 'Pro yearly', price: 1999, period: 'year', days: 365 },
};

export const formatRupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// Price a valid coupon brings the monthly plan down to. The server decides the real discount from the coupon row,
// so create the coupon with amount_off = launchOfferAmountOff(). The card only reads this to show the saving.
export const LAUNCH_OFFER_MONTHLY_PRICE = 149;
export const launchOfferAmountOff = () => PLANS.monthly.price - LAUNCH_OFFER_MONTHLY_PRICE;

// Honest comparison: yearly against twelve months of the monthly plan
export const yearlySaving = () => PLANS.monthly.price * 12 - PLANS.yearly.price;
