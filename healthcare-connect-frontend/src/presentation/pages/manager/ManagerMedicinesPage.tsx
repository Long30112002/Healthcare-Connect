import { useEffect, useState } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import Select from '../../components/shared/Select';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { medicineApi } from '../../../infrastructure/api/medicineApi';
import { DosageForm, MedicineCategory, Unit } from '../../../core/constants/enums';
import type { MedicineResponse } from '../../../core/types/api.response';
import toast from 'react-hot-toast';
import type { MedicineRequest } from '../../../core/types/api.request';
import { formatExpiryDate } from '../../../shared/utils/dateUtils';

interface MedicineFormData {
    code: string;
    name: string;
    activeIngredient: string;
    category: string;
    unit: string;
    price: number;
    stockQuantity: number;
    minStock: number;
    expiryDate: string;
    manufacturer: string;
    requiresPrescription: boolean;
    description: string;
    usageInstructions: string;
    contraindications: string;
    sideEffects: string;
    maxStock?: number;
    manufacturerCountry?: string;
    dosageForm?: string;
}

const ManagerMedicinesPage = () => {
    const { t } = useAppTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<MedicineResponse | null>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<MedicineResponse | null>(null);
    const [stockQuantity, setStockQuantity] = useState(0);
    const [formData, setFormData] = useState<MedicineFormData>({
        code: '',
        name: '',
        activeIngredient: '',
        category: '',
        unit: '',
        price: 0,
        stockQuantity: 0,
        minStock: 10,
        expiryDate: '',
        manufacturer: '',
        requiresPrescription: true,
        description: '',
        usageInstructions: '',
        contraindications: '',
        sideEffects: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch medicines
    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const data = await medicineApi.getAll(0, 100);
            setMedicines(data.content);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
            toast.error(t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    // Filter medicines
    const filteredMedicines = medicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            medicine.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || medicine.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get expiry status
    const getExpiryStatus = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysLeft < 0) return { text: t('medicine.expired'), color: 'text-red-600' };
        if (daysLeft < 30) return { text: t('medicine.expiringSoon'), color: 'text-yellow-600' };
        return { text: t('medicine.valid'), color: 'text-green-600' };
    };

    // Get stock status
    const getStockStatus = (stock: number, minStock: number) => {
        if (stock <= 0) return { text: t('medicine.outOfStock'), color: 'text-red-600' };
        if (stock <= minStock) return { text: t('medicine.lowStock'), color: 'text-yellow-600' };
        return { text: t('medicine.inStock'), color: 'text-green-600' };
    };

    // Format price
    const formatPrice = (price: number) => {
        return price?.toLocaleString('vi-VN') + 'đ' || '0đ';
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.code.trim()) errors.code = t('medicine.validation.codeRequired');
        if (!formData.name.trim()) errors.name = t('medicine.validation.nameRequired');
        if (!formData.activeIngredient.trim()) errors.activeIngredient = t('medicine.validation.activeIngredientRequired');
        if (!formData.category) errors.category = t('medicine.validation.categoryRequired');
        if (!formData.unit) errors.unit = t('medicine.validation.unitRequired');
        if (formData.price <= 0) errors.price = t('medicine.validation.priceInvalid');
        if (formData.stockQuantity < 0) errors.stockQuantity = t('medicine.validation.stockInvalid');
        if (formData.minStock < 0) errors.minStock = t('medicine.validation.minStockInvalid');
        if (!formData.expiryDate) errors.expiryDate = t('medicine.validation.expiryDateRequired');
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open create modal
    const handleCreate = () => {
        setEditingMedicine(null);
        setFormData({
            code: '',
            name: '',
            activeIngredient: '',
            category: '',
            unit: '',
            price: 0,
            stockQuantity: 0,
            minStock: 10,
            expiryDate: '',
            manufacturer: '',
            requiresPrescription: true,
            description: '',
            usageInstructions: '',
            contraindications: '',
            sideEffects: '',
        });
        setFormErrors({});
        setModalOpen(true);
    };

    // Open edit modal
    const handleEdit = (medicine: MedicineResponse) => {
        setEditingMedicine(medicine);
        setFormData({
            code: medicine.code,
            name: medicine.name,
            activeIngredient: medicine.activeIngredient || '',
            category: medicine.category,
            unit: medicine.unit || 'Hộp',
            price: medicine.price,
            stockQuantity: medicine.stockQuantity,
            minStock: medicine.minStock || 10,
            expiryDate: formatExpiryDate(medicine.expiryDate),
            manufacturer: medicine.manufacturer || '',
            requiresPrescription: medicine.requiresPrescription,
            description: medicine.description || '',
            usageInstructions: medicine.usageInstructions || '',
            contraindications: medicine.contraindications || '',
            sideEffects: medicine.sideEffects || '',
            maxStock: medicine.maxStock,
            manufacturerCountry: medicine.manufacturerCountry,
            dosageForm: medicine.dosageForm,
        });
        setFormErrors({});
        setModalOpen(true);
    };

    // Open stock update modal
    const handleOpenStockModal = (medicine: MedicineResponse) => {
        setSelectedMedicine(medicine);
        setStockQuantity(0);
        setStockModalOpen(true);
    };

    // Save medicine
    const { execute: saveMedicine, loading: saving } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: editingMedicine ? t('medicine.updateSuccess') : t('medicine.createSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('medicine.saveError'),
        onSuccess: () => {
            setModalOpen(false);
            fetchMedicines();
        },
    });

    const handleSave = async () => {
        if (!validateForm()) return;

        const submitData: MedicineRequest = {
            code: formData.code,
            name: formData.name,
            activeIngredient: formData.activeIngredient,
            category: formData.category as MedicineCategory,
            unit: formData.unit as Unit,
            price: formData.price,
            stockQuantity: formData.stockQuantity,
            minStock: formData.minStock,
            expiryDate: formData.expiryDate,
            manufacturer: formData.manufacturer,
            requiresPrescription: formData.requiresPrescription,
            description: formData.description,
            usageInstructions: formData.usageInstructions,
            contraindications: formData.contraindications,
            sideEffects: formData.sideEffects,
            maxStock: formData.maxStock,                    
            manufacturerCountry: formData.manufacturerCountry, 
            dosageForm: formData.dosageForm,
        };

        if (editingMedicine) {
            await saveMedicine(() => medicineApi.update(editingMedicine.id, submitData));
        } else {
            await saveMedicine(() => medicineApi.create(submitData));
        }
    };

    // Update stock
    const { execute: updateStock, loading: updatingStock } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('medicine.stockUpdateSuccess'),
        errorMessage: t('medicine.stockUpdateError'),
        onSuccess: () => {
            setStockModalOpen(false);
            fetchMedicines();
        },
    });

    const handleUpdateStock = async () => {
        if (!selectedMedicine) return;
        await updateStock(() => medicineApi.updateStock(selectedMedicine.id, stockQuantity));
    };

    // Delete medicine
    const { execute: deleteMedicine, loading: deleting } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('medicine.deleteSuccess'),
        errorMessage: t('medicine.deleteError'),
        onSuccess: () => fetchMedicines(),
    });

    const handleDelete = (medicineId: string, medicineName: string) => {
        if (window.confirm(t('medicine.deleteConfirm', { name: medicineName }))) {
            deleteMedicine(() => medicineApi.delete(medicineId));
        }
    };

    // const categories = Object.values(MedicineCategory).map(cat => ({
    //     value: cat,
    //     label: t(`medicine.medicine.categoryList.${cat.toLowerCase()}`) || cat,
    // }));

    const categoryOptions = Object.values(MedicineCategory).map(cat => ({
        value: cat,
        label: t(`medicine.medicine.categoryList.${cat.toLowerCase()}`) || cat,
    }));

    const unitOptions = Object.values(Unit).map(unit => ({
        value: unit,
        label: t(`medicine.medicine.unitList.${unit.toLowerCase()}`) || unit,
    }));

    const dosageFormOptions = Object.values(DosageForm).map(form => ({
        value: form,
        label: t(`medicine.medicine.dosageFormList.${form.toLowerCase()}`) || form,
    }));

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header */}
                <DashboardHeader
                    icon="💊"
                    title={t('medicine.title')}
                    subtitle={t('medicine.subtitle')}
                    showHospital={true}
                    hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
                />

                {/* Search and Filters */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={t('medicine.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">{t('medicine.allCategories')}</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <Button variant="primary" onClick={handleCreate}>
                            ➕ {t('medicine.addMedicine')}
                        </Button>
                    </div>
                </div>

                {/* Medicines Table */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.code')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.name')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.category')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.unit')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.price')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.stock')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('medicine.expiryDate')}
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredMedicines.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                            {t('medicine.noMedicines')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMedicines.map((medicine) => {
                                        const expiryStatus = getExpiryStatus(medicine.expiryDate);
                                        const stockStatus = getStockStatus(medicine.stockQuantity, medicine.minStock);
                                        return (
                                            <tr key={medicine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                                                    {medicine.code}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                    {medicine.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {t(`medicine.medicine.categoryList.${medicine.category.toLowerCase()}`)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    {t(`medicine.medicine.unitList.${medicine.unit.toLowerCase()}`)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                                                    {formatPrice(medicine.price)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={stockStatus.color}>
                                                        {medicine.stockQuantity} {medicine.unit} ({stockStatus.text})
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={expiryStatus.color}>
                                                        {formatDate(medicine.expiryDate)} ({expiryStatus.text})
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(medicine)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                            title={t('common.edit')}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenStockModal(medicine)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                            title={t('medicine.updateStock')}
                                                        >
                                                            📦
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(medicine.id, medicine.name)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                            title={t('common.delete')}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Medicine Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleSave}
                title={editingMedicine ? t('medicine.editTitle') : t('medicine.createTitle')}
                confirmText={t('common.save')}
                cancelText={t('common.cancel')}
                loading={saving}
                size="lg"
            >
                <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
                    {/* Hàng 1: Mã thuốc + Tên thuốc */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.code')}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="PAR-001"
                            error={formErrors.code}
                            required
                        />
                        <Input
                            label={t('medicine.name')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Paracetamol"
                            error={formErrors.name}
                            required
                        />
                    </div>

                    {/* Hàng 2: Hoạt chất + Danh mục */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.activeIngredient')}
                            value={formData.activeIngredient}
                            onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                            placeholder="Paracetamol"
                            error={formErrors.activeIngredient}
                            required
                        />
                        <Select
                            label={t('medicine.category')}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as MedicineCategory })}
                            options={categoryOptions}
                            error={formErrors.category}
                            required
                        />
                    </div>

                    {/* Hàng 3: Đơn vị + Giá */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label={t('medicine.unit')}
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            options={unitOptions}
                            error={formErrors.unit}
                            required
                        />
                        <Input
                            label={t('medicine.price')}
                            type="number"
                            value={formData.price.toString()}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            error={formErrors.price}
                            required
                        />
                    </div>

                    {/* Hàng 4: Tồn kho + Tồn kho tối thiểu */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.stockQuantity')}
                            type="number"
                            value={formData.stockQuantity.toString()}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                            error={formErrors.stockQuantity}
                        />
                        <Input
                            label={t('medicine.minStock')}
                            type="number"
                            value={formData.minStock.toString()}
                            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })}
                            error={formErrors.minStock}
                        />
                    </div>

                    {/* Hàng 5: Tồn kho tối đa + Dạng bào chế */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.maxStock')}
                            type="number"
                            value={formData.maxStock?.toString() || ''}
                            onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || undefined })}
                            placeholder={t('medicine.medicine.maxStockPlaceholder')}
                        />
                        <Select
                            label={t('medicine.dosageForm')}
                            value={formData.dosageForm || ''}
                            onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                            options={dosageFormOptions}
                            placeholder={t('medicine.medicine.dosageFormPlaceholder')}
                        />
                    </div>

                    {/* Hàng 6: Hạn sử dụng + Nhà sản xuất */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.expiryDate')}
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            error={formErrors.expiryDate}
                            required
                        />
                        <Input
                            label={t('medicine.manufacturer')}
                            value={formData.manufacturer}
                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                            placeholder="Công ty ABC"
                        />
                    </div>

                    {/* Hàng 7: Nước sản xuất + (trống) */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.manufacturerCountry')}
                            value={formData.manufacturerCountry || ''}
                            onChange={(e) => setFormData({ ...formData, manufacturerCountry: e.target.value })}
                            placeholder={t('medicine.medicine.manufacturerCountryPlaceholder')}
                        />
                        <div></div>
                    </div>

                    {/* Checkbox: Thuốc kê đơn */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="requiresPrescription"
                            checked={formData.requiresPrescription}
                            onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="requiresPrescription" className="text-sm text-gray-700 dark:text-gray-300">
                            {t('medicine.requiresPrescription')}
                        </label>
                    </div>

                    {/* Mô tả */}
                    <Input
                        label={t('medicine.description')}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('medicine.descriptionPlaceholder')}
                    />

                    {/* Hướng dẫn sử dụng */}
                    <Input
                        label={t('medicine.usageInstructions')}
                        value={formData.usageInstructions}
                        onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
                        placeholder={t('medicine.usageInstructionsPlaceholder')}
                    />

                    {/* Hàng cuối: Chống chỉ định + Tác dụng phụ */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('medicine.contraindications')}
                            value={formData.contraindications}
                            onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                            placeholder={t('medicine.contraindicationsPlaceholder')}
                        />
                        <Input
                            label={t('medicine.sideEffects')}
                            value={formData.sideEffects}
                            onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                            placeholder={t('medicine.sideEffectsPlaceholder')}
                        />
                    </div>
                </div>
            </Modal>

            {/* Stock Update Modal */}
            <Modal
                isOpen={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                onConfirm={handleUpdateStock}
                title={t('medicine.updateStockTitle')}
                confirmText={t('common.update')}
                cancelText={t('common.cancel')}
                loading={updatingStock}
            >
                <div className="space-y-4 mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('medicine.currentStock')}: <strong>{selectedMedicine?.stockQuantity} {selectedMedicine?.unit}</strong>
                    </p>
                    <Input
                        label={t('medicine.stockChange')}
                        type="number"
                        value={stockQuantity.toString()}
                        onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                        placeholder={t('medicine.stockChangePlaceholder')}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        💡 {t('medicine.stockChangeNote')}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default ManagerMedicinesPage;