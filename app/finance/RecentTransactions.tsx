import React from 'react';

interface RecentTransactionsProps {
    transactions: any[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                    {tx.date}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {tx.description}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {tx.category}
                                </td>
                                <td className={`px-6 py-4 text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}LKR {tx.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${tx.type === 'income'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {tx.type === 'income' ? 'Income' : 'Expense'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                    No recent transactions found.
                </div>
            )}
        </div>
    );
};
