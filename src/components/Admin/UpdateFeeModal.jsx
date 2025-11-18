import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UpdateFeeModal = ({ student, isOpen, onClose, onSuccess }) => {
    const [newUpfrontFee, setNewUpfrontFee] = useState(student?.upfrontFee || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !student) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newUpfrontFee === '' || isNaN(newUpfrontFee) || parseFloat(newUpfrontFee) < 0) {
            toast.error('Please enter a valid upfront fee amount');
            return;
        }

        if (parseFloat(newUpfrontFee) > (student.courseFee || 0)) {
            toast.error('Upfront fee cannot exceed course fee');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/students/${student._id}/update-upfront-fee`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ upfrontFee: parseFloat(newUpfrontFee) }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update upfront fee');
            }

            toast.success('Upfront fee updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update upfront fee error:', error);
            toast.error(error.message || 'Failed to update upfront fee');
        } finally {
            setLoading(false);
        }
    };

    const currentBalance = Math.max(0, (student.courseFee || 0) - (student.upfrontFee || 0));
    const newBalance = Math.max(0, (student.courseFee || 0) - parseFloat(newUpfrontFee || 0));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg shadow-xl max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
                    <h2 className="text-xl font-bold" style={{ color: '#2b2520' }}>
                        Record Student Payment
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <IoClose size={24} style={{ color: '#d32f2f' }} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Student Info */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
                        <p className="text-sm text-gray-600">Student</p>
                        <p className="font-semibold" style={{ color: '#2b2520' }}>
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Admission #: {student.admissionNumber}</p>
                    </div>
                    <div className='flex justify-between'>
                        {/* Course Fee (Constant) */}
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Course Fee</p>
                            <p className="text-lg font-bold" style={{ color: '#d4a644' }}>
                                KES {(student.courseFee || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(This is the fixed course fee)</p>
                        </div>

                        {/* Current Upfront Fee */}
                        <div className='text-right'>
                            <p className="text-sm text-gray-600 mb-1">Current Amount Paid (Upfront)</p>
                            <p className="text-lg font-bold" style={{ color: '#2b2520' }}>
                                KES {(student.upfrontFee || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Current Balance Due: <span style={{ color: '#c9952f' }} className="font-semibold">KES {currentBalance.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                    {/* New Upfront Fee Input */}
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>
                            New Amount Paid (Upfront Fee) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 font-semibold" style={{ color: '#d4a644' }}>
                                KES
                            </span>
                            <input
                                type="number"
                                value={newUpfrontFee}
                                onChange={(e) => setNewUpfrontFee(e.target.value)}
                                placeholder="Enter new upfront fee amount"
                                className="w-full pl-12 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                                style={{
                                    borderColor: '#d4a644',
                                }}
                                disabled={loading}
                                step="0.01"
                                min="0"
                                max={student.courseFee || 0}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Maximum: KES {(student.courseFee || 0).toLocaleString()}</p>
                    </div>

                    <div className='flex justify-between'>
                        {/* New Balance Preview */}
                        {newUpfrontFee && !isNaN(newUpfrontFee) && (
                            <div className="py-3 px-4 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
                                <p className="text-sm text-gray-600">New Balance After Recording Payment</p>
                                <p className="text-lg font-bold" style={{ color: '#c9952f' }}>
                                    KES {newBalance.toLocaleString()}
                                </p>
                            </div>
                        )}

                        {/* Fee Payment Difference */}
                        {newUpfrontFee && !isNaN(newUpfrontFee) && parseFloat(newUpfrontFee) !== (student.upfrontFee || 0) && (
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
                                <p className="text-sm text-gray-600">
                                    {parseFloat(newUpfrontFee) > (student.upfrontFee || 0) ? 'Additional Payment' : 'Fee Adjustment'}
                                </p>
                                <p
                                    className="text-lg font-bold"
                                    style={{
                                        color: parseFloat(newUpfrontFee) > (student.upfrontFee || 0) ? '#2b8a3e' : '#d32f2f'
                                    }}
                                >
                                    {parseFloat(newUpfrontFee) > (student.upfrontFee || 0) ? '+' : '-'}KES{' '}
                                    {Math.abs(parseFloat(newUpfrontFee) - (student.upfrontFee || 0)).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border-2"
                            style={{
                                borderColor: '#2b2520',
                                color: '#2b2520',
                                backgroundColor: 'transparent',
                                opacity: loading ? 0.5 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
                            style={{
                                backgroundColor: loading ? '#ccc' : '#d4a644',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateFeeModal;
