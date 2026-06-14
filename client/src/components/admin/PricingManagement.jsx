import PublishPricesForm from './PublishPricesForm';
import { useState, useEffect } from 'react';
import API from '../../services/api';

const PricingManagement = () => {
    const [prices, setPrices] = useState([]);

    const fetchPrices = async () => {
        try {
            const { data } = await API.get('/admin/prices');
            setPrices(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchPrices(); }, []);

    return (
        <div>
            <h2 className="text-xl font-bold text-green-800 mb-4">Approved Service Prices</h2>
            {prices.length === 0 ? <p>No prices published yet.</p> :
                <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="p-2 text-left">Service</th>
                            <th className="p-2 text-left">Standard</th>
                            <th className="p-2 text-left">Min</th>
                            <th className="p-2 text-left">Max</th>
                            <th className="p-2 text-left">District</th>
                            <th className="p-2 text-left">Village</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.map(p => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{p.service_name}</td>
                                <td className="p-2">₹{p.standard_price}</td>
                                <td className="p-2">₹{p.min_price}</td>
                                <td className="p-2">₹{p.max_price}</td>
                                <td className="p-2">{p.district || 'All'}</td>
                                <td className="p-2">{p.village || 'All'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
            <hr className="my-4" />
            <PublishPricesForm onPublished={fetchPrices} />
        </div>
    );
};

export default PricingManagement;