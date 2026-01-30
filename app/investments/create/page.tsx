'use client';


import { InvestmentCreate } from '@/components/investment/InvestmentCreate';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvestmentCreatePage() {
    return (
        <>
            <InvestmentCreate />
            <ToastContainer />
        </>
    );
}
