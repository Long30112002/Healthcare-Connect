import { useState } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import toast from 'react-hot-toast';
import { PaymentMethod, RefundMethod } from '../../../core/constants/enums';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';

interface CancelAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { reason: string; refundMethod: RefundMethod; refundAmount?: number }) => void;
    appointmentPrice: number;
    paymentMethod: PaymentMethod;
    patientName: string;
    isPaid: boolean; 
    loading?: boolean;
}

const CancelAppointmentModal = ({
    isOpen,
    onClose,
    onConfirm,
    appointmentPrice,
    paymentMethod,
    patientName,
    isPaid, 
    loading = false
}: CancelAppointmentModalProps) => {
    const { t } = useAppTranslation();
    
    const [reason, setReason] = useState('CUSTOMER_CANCELLED');
    const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
    const [isPartialRefund, setIsPartialRefund] = useState(false);
    
    const isMomo = paymentMethod === PaymentMethod.MOMO;
    const refundMethod = isMomo ? RefundMethod.MOMO : RefundMethod.CASH;
    
    const handleConfirm = () => {
        if (!reason) {
            toast.error(t('cancel.requiredReason'));
            return;
        }
        
        const data: { reason: string; refundMethod: RefundMethod; refundAmount?: number } = {
            reason,
            refundMethod,
        };
        
        // Chỉ gửi refundAmount nếu là CASH và chọn hoàn một phần VÀ ĐÃ THANH TOÁN
        if (isPaid && !isMomo && isPartialRefund && refundAmount && refundAmount > 0) {
            if (refundAmount > appointmentPrice) {
                toast.error(t('cancel.amountExceeds'));
                return;
            }
            data.refundAmount = refundAmount;
        }
        
        onConfirm(data);
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={isMomo ? t('cancel.momoTitle') : t('cancel.cashTitle')}
            message={`${t('cancel.message')} ${patientName}?`}
            variant="danger"
            confirmText={t('common.confirm')}
            cancelText={t('common.cancel')}
            loading={loading}
        >
            <div className="space-y-5 mt-2">
                {/* Thông tin thanh toán */}
                <div className={`p-4 rounded-xl ${isMomo ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{isMomo ? '🟣' : '💵'}</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t('receptionist.paymentMethod')}
                                </p>
                                <p className={`text-lg font-bold ${isMomo ? 'text-purple-600' : 'text-green-600'}`}>
                                    {isMomo ? t('cancel.momo') : t('cancel.cash')}
                                </p>
                                {/* HIỂN THỊ TRẠNG THÁI THANH TOÁN */}
                                <p className={`text-xs mt-1 ${isPaid ? 'text-green-600' : 'text-red-500'}`}>
                                    {isPaid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{t('receptionist.amount')}</p>
                            <p className="text-xl font-bold text-primary">{appointmentPrice.toLocaleString()}đ</p>
                        </div>
                    </div>
                </div>
                
                {/* Lý do hủy */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('cancel.reason')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white transition"
                    >
                        <option value="CUSTOMER_CANCELLED">📋 {t('cancel.reasonCustomerCancelled')}</option>
                        <option value="WRONG_APPOINTMENT">❌ {t('cancel.reasonWrongAppointment')}</option>
                        <option value="DOCTOR_UNAVAILABLE">👨‍⚕️ {t('cancel.reasonDoctorUnavailable')}</option>
                        <option value="DUPLICATE_BOOKING">🔄 {t('cancel.reasonDuplicateBooking')}</option>
                        <option value="TECHNICAL_ISSUE">🔧 {t('cancel.reasonTechnicalIssue')}</option>
                        <option value="OTHER">📝 {t('cancel.reasonOther')}</option>
                    </select>
                </div>
                
                {/* ========== PHẦN HOÀN TIỀN ========== */}
                {isPaid ? (
                    // ĐÃ THANH TOÁN - Hiển thị phần hoàn tiền
                    isMomo ? (
                        // MOMO đã thanh toán
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💡</span>
                                <div>
                                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                                        {t('cancel.momoRefundTitle')}
                                    </p>
                                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                        {t('cancel.momoRefundNote')}
                                    </p>
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-2">
                                        {t('cancel.refundAmount')}: <span className="font-bold">{appointmentPrice.toLocaleString()}đ</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // CASH đã thanh toán
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="refundType"
                                        checked={!isPartialRefund}
                                        onChange={() => {
                                            setIsPartialRefund(false);
                                            setRefundAmount(undefined);
                                        }}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        💰 {t('cancel.fullRefund')}
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="refundType"
                                        checked={isPartialRefund}
                                        onChange={() => setIsPartialRefund(true)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        🔄 {t('cancel.partialRefund')}
                                    </span>
                                </label>
                            </div>
                            
                            {isPartialRefund ? (
                                <div>
                                    <Input
                                        type="number"
                                        value={refundAmount?.toString() || ''}
                                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                                        placeholder={t('cancel.enterAmount')}
                                        className="text-center"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {t('cancel.maxRefund')}: {appointmentPrice.toLocaleString()}đ
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('cancel.fullRefundAmount')}
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        {appointmentPrice.toLocaleString()}đ
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    // ========== CHƯA THANH TOÁN ==========
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ℹ️ {t('cancel.notPaidYet')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('cancel.noRefundNeeded')}
                        </p>
                    </div>
                )}
                
                {/* Cảnh báo khi hủy */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                        ⚠️ {t('cancel.warning')}
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default CancelAppointmentModal;