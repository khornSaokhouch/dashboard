'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ItemDetail = () => {
    const { id } = useParams();
    const router = useRouter();
    const { item, loading, error, fetchItemById } = useItemStore();

    useEffect(() => {
        if (id) {
            fetchItemById(id);
        }
    }, [id, fetchItemById]);

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading item details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
    }

    if (!item) {
        return <div className="p-8 text-center text-gray-600">No item found.</div>;
    }

    const formatPrice = (item) => {
        if (!item) return '—';
    
        if (item.price !== undefined && item.price !== null && item.price !== '') {
          const raw = parseFloat(item.price);
          if (Number.isFinite(raw)) {
            const cents = Math.round(raw);
            return (cents / 100).toFixed(2);
          }
          return String(item.price);
        }
    
        if (
          item.price_cents !== undefined &&
          item.price_cents !== null &&
          String(item.price_cents).trim() !== ''
        ) {
          const cents = Number(item.price_cents);
          return Number.isFinite(cents) ? (cents / 100).toFixed(2) : String(item.price_cents);
        }
    
        return '—';
      };


    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Items Management
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Item Detail</h1>

            <div className="bg-white shadow-md rounded-lg p-6">
                {item.image_url && (
                    <div className="mb-6">
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            width={400}
                            height={300}
                            layout="responsive"
                            className="rounded-lg object-cover"
                            unoptimized={true}
                        />
                    </div>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{item.name}</h2>
                <p className="text-xl text-gray-700 mb-4">${formatPrice(item)}</p>
                
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Description:</h3>
                <p className="text-gray-600 mb-6">{item.description || 'No description available.'}</p>

                <div className="border-t pt-4 text-sm text-gray-500">
                    <p><strong>Category:</strong> {item.category?.name || 'N/A'}</p>
                    <p><strong>Shop:</strong> {item.shop_id || 'N/A'}</p>
                    <p><strong>Available:</strong> {item.is_available ? 'Yes' : 'No'}</p>
                    <p><strong>Display Order:</strong> {item.display_order || 'N/A'}</p>
                    <p><strong>Created At:</strong> {new Date(item.created_at).toLocaleString() || 'N/A'}</p>
                    <p><strong>Updated At:</strong> {new Date(item.updated_at).toLocaleString() || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;