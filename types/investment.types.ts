import { Customer } from './customer.types';
import { InvestmentProduct as BaseProduct } from './investment-product.types';

export interface Nominee {
    name: string;
    nic: string;
    relationship: string;
}

export interface Investment {
    id: number;
    product_id: number;
    customer_id: number;
    amount: number;
    transaction_id: string;
    start_date: string;
    maturity_date: string;
    status: 'ACTIVE' | 'CLOSED' | 'RENEWED' | 'MATURED';

    // Snapshot fields
    snapshot_product_code: string;
    snapshot_product_name: string;
    snapshot_payout_type: 'MONTHLY' | 'MATURITY';
    snapshot_policy_term: number;
    snapshot_interest_rate_monthly: number;
    snapshot_interest_rate_maturity: number;
    snapshot_early_break_rate_monthly: number;
    snapshot_early_break_rate_maturity: number;
    snapshot_negotiation_rate: number;

    nominees: Nominee[];
    time_stamp: string;
    created_at: string;

    // Relations
    customer?: Customer;
    product?: BaseProduct;
}

export interface InvestmentFormData {
    product_id: string;
    customer_id: string;
    amount: string;
    policy_term: string;
    start_date: string;
    nominees: Nominee[];
    negotiation_rate: string;
}
