import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import toast from 'react-hot-toast';
import type { Department, Specialty } from '../../../core/types';
import { departmentSpecialtyApi } from '../../../infrastructure/api/departmentSpecialtyApi';
import { MedicalCategory } from '../../../core/constants/enums';
import { t } from 'i18next';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';

// Category options for dropdown
const getCategoryOptions = () => [
    { value: MedicalCategory.INTERNAL_MEDICINE, label: t('medicalCategory.INTERNAL_MEDICINE') },
    { value: MedicalCategory.SURGERY, label: t('medicalCategory.SURGERY') },
    { value: MedicalCategory.PEDIATRICS, label: t('medicalCategory.PEDIATRICS') },
    { value: MedicalCategory.ENT, label: t('medicalCategory.ENT') },
    { value: MedicalCategory.DIAGNOSTIC_IMAGING, label: t('medicalCategory.DIAGNOSTIC_IMAGING') },
    { value: MedicalCategory.GENERAL, label: t('medicalCategory.GENERAL') },
    { value: MedicalCategory.DERMATOLOGY, label: t('medicalCategory.DERMATOLOGY') },
    { value: MedicalCategory.OBSTETRICS, label: t('medicalCategory.OBSTETRICS') },
    { value: MedicalCategory.LABORATORY, label: t('medicalCategory.LABORATORY') },
    { value: MedicalCategory.OPHTHALMOLOGY, label: t('medicalCategory.OPHTHALMOLOGY') },
];
type TabType = 'departments' | 'specialties';

const ManagerDepartmentsSpecialtiesPage = () => {
    const { t } = useAppTranslation();
    const { user } = useAuth();

    const { activeTab, setActiveTab } = useTabWithUrl<TabType>({
        paramName: 'tab',
        validValues: ['departments', 'specialties'],
        defaultValue: 'departments',
        includePage: false,  // Không cần page parameter
    });
    const [loading, setLoading] = useState(true);
    const categoryOptions = getCategoryOptions();


    // Departments
    const [departments, setDepartments] = useState<Department[]>([]);
    const [deptModalOpen, setDeptModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [deptForm, setDeptForm] = useState<{
        name: string;
        code: string;
        description: string;
        category: MedicalCategory;
    }>({
        name: '',
        code: '',
        description: '',
        category: MedicalCategory.INTERNAL_MEDICINE
    });

    // Specialties
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [specModalOpen, setSpecModalOpen] = useState(false);
    const [editingSpec, setEditingSpec] = useState<Specialty | null>(null);
    const [specForm, setSpecForm] = useState<{
        name: string;
        description: string;
        departmentId: string;
        category: MedicalCategory;
    }>({
        name: '',
        description: '',
        departmentId: '',
        category: MedicalCategory.INTERNAL_MEDICINE
    });
    const [departmentsForSelect, setDepartmentsForSelect] = useState<Department[]>([]);

    // Delete modal
    const [deleteModal, setDeleteModal] = useState({ open: false, id: '', name: '', type: 'departments' as TabType });

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const data = await departmentSpecialtyApi.getDepartments();
            const mappedDepartments: Department[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                code: item.code,
                description: item.description || '',
                category: item.category
            }));
            setDepartments(mappedDepartments);
            setDepartmentsForSelect(mappedDepartments);
        } catch (error) {
            toast.error(t('common.loadError'));
        }
    };

    // Fetch specialties
    const fetchSpecialties = async () => {
        try {
            const data = await departmentSpecialtyApi.getSpecialties();
            const mappedSpecialties: Specialty[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                code: item.code,
                description: item.description || '',
                departmentId: item.department?.id || '',
                departmentName: item.department?.name || '',
                department: item.department,
                category: item.category || item.department?.category,
            }));
            setSpecialties(mappedSpecialties);
        } catch (error) {
            toast.error(t('common.loadError'));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchDepartments(), fetchSpecialties()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Save Department
    const { execute: saveDept, loading: savingDept } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: editingDept ? t('department.updateSuccess') : t('department.createSuccess'),
        errorMessage: t('department.saveError'),
        onSuccess: () => {
            setDeptModalOpen(false);
            fetchDepartments();
        }
    });

    const handleSaveDept = async () => {
        console.log('deptForm.category before send:', deptForm.category);

        if (!deptForm.name.trim()) {
            toast.error(t('department.nameRequired'));
            return;
        }
        if (!deptForm.code.trim()) {
            toast.error(t('department.codeRequired'));
            return;
        }

        const codeRegex = /^[A-Z0-9_]+$/;
        if (!codeRegex.test(deptForm.code)) {
            toast.error(t('department.codeInvalidFormat'));
            return;
        }

        console.log('Sending department data:', {
            name: deptForm.name,
            code: deptForm.code,
            description: deptForm.description,
            category: deptForm.category
        });

        const departmentData = {
            name: deptForm.name,
            code: deptForm.code,
            description: deptForm.description,
            category: deptForm.category
        };

        if (editingDept) {
            await saveDept(() => departmentSpecialtyApi.updateDepartment(editingDept.id, departmentData));
        } else {
            await saveDept(() => departmentSpecialtyApi.createDepartment(departmentData));
        }
    };

    // Save Specialty
    const { execute: saveSpec, loading: savingSpec } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: editingSpec ? t('specialty.updateSuccess') : t('specialty.createSuccess'),
        errorMessage: t('specialty.saveError'),
        onSuccess: () => {
            setSpecModalOpen(false);
            fetchSpecialties();
        }
    });

    const handleSaveSpec = async () => {
        console.log('specForm.category before send:', specForm.category);

        if (!specForm.name.trim()) {
            toast.error(t('specialty.nameRequired'));
            return;
        }
        if (!specForm.departmentId) {
            toast.error(t('specialty.departmentRequired'));
            return;
        }

        const dataToSend = {
            name: specForm.name,
            description: specForm.description,
            departmentId: specForm.departmentId,
            category: specForm.category
        };

        console.log('Sending specialty data:', dataToSend);

        if (editingSpec) {
            await saveSpec(() => departmentSpecialtyApi.updateSpecialty(editingSpec.id, dataToSend));
        } else {
            await saveSpec(() => departmentSpecialtyApi.createSpecialty(dataToSend));
        }
    };

    // Delete
    const { execute: deleteItem, loading: deleting } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('common.deleteSuccess'),
        // errorMessage: t('common.deleteError'),
        onSuccess: () => {
            setDeleteModal({ open: false, id: '', name: '', type: 'departments' });
            if (deleteModal.type === 'departments') {
                fetchDepartments();
            } else {
                fetchSpecialties();
            }
        }
    });

    const handleDelete = () => {
        if (deleteModal.type === 'departments') {
            deleteItem(() => departmentSpecialtyApi.deleteDepartment(deleteModal.id));
        } else {
            deleteItem(() => departmentSpecialtyApi.deleteSpecialty(deleteModal.id));
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                <DashboardHeader
                    icon="📋"
                    title={t('departmentsSpecialties.title')}
                    subtitle={t('departmentsSpecialties.subtitle')}
                    showHospital={true}
                    hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
                />

                {/* Tabs */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-2 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'departments'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            🏛️ {t('departmentsSpecialties.departments')}
                        </button>
                        <button
                            onClick={() => setActiveTab('specialties')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'specialties'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            📚 {t('departmentsSpecialties.specialties')}
                        </button>
                    </div>
                </div>

                {/* Departments Tab */}
                {activeTab === 'departments' && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                📋 {t('departmentsSpecialties.departmentsList')} ({departments.length})
                            </h2>
                            <Button variant="primary" size="sm" onClick={() => {
                                setEditingDept(null);
                                setDeptForm({ name: '', code: '', description: '', category: MedicalCategory.INTERNAL_MEDICINE });
                                setDeptModalOpen(true);
                            }}>
                                ➕ {t('common.add')}
                            </Button>
                        </div>
                        <div className="p-4">
                            {departments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t('departmentsSpecialties.noDepartments')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {departments.map((dept) => (
                                        <div key={dept.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                                                            {dept.code}
                                                        </span>
                                                    </div>
                                                    {dept.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dept.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingDept(dept);
                                                        setDeptForm({
                                                            name: dept.name,
                                                            code: dept.code,
                                                            description: dept.description || '',
                                                            category: dept.category || MedicalCategory.INTERNAL_MEDICINE
                                                        });
                                                        setDeptModalOpen(true);
                                                    }}>
                                                        ✏️ {t('common.edit')}
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => {
                                                        setDeleteModal({ open: true, id: dept.id, name: dept.name, type: 'departments' });
                                                    }}>
                                                        🗑️ {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Specialties Tab */}
                {activeTab === 'specialties' && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                📋 {t('departmentsSpecialties.specialtiesList')} ({specialties.length})
                            </h2>
                            <Button variant="primary" size="sm" onClick={() => {
                                setEditingSpec(null);
                                setSpecForm({
                                    name: '',
                                    description: '',
                                    departmentId: '',
                                    category: MedicalCategory.INTERNAL_MEDICINE
                                });
                                setSpecModalOpen(true);
                            }}>
                                ➕ {t('common.add')}
                            </Button>
                        </div>
                        <div className="p-4">
                            {specialties.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t('departmentsSpecialties.noSpecialties')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {specialties.map((spec) => (
                                        <div key={spec.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{spec.name}</h3>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                                                            {spec.code}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{t('specialty.department')}: {spec.department?.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {/* {t('specialty.category')}: {categoryOptions.find(c => c.value === spec.category)?.label || spec.category || 'Chưa có'} */}
                                                        {t('specialty.category')}: {categoryOptions.find(c => c.value === spec.department?.category)?.label || spec.department?.category || 'Chưa có'}
                                                    </p>
                                                    {spec.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{spec.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingSpec(spec);
                                                        setSpecForm({
                                                            name: spec.name,
                                                            description: spec.description || '',
                                                            departmentId: spec.departmentId,
                                                            // category: spec.category as MedicalCategory || MedicalCategory.INTERNAL_MEDICINE,
                                                            category: (spec.category || spec.department?.category) as MedicalCategory || MedicalCategory.INTERNAL_MEDICINE
                                                        });
                                                        setSpecModalOpen(true);
                                                    }}>
                                                        ✏️ {t('common.edit')}
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => {
                                                        setDeleteModal({ open: true, id: spec.id, name: spec.name, type: 'specialties' });
                                                    }}>
                                                        🗑️ {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Department Modal */}
                <Modal
                    isOpen={deptModalOpen}
                    onClose={() => setDeptModalOpen(false)}
                    onConfirm={handleSaveDept}
                    title={editingDept ? t('department.editTitle') : t('department.createTitle')}
                    confirmText={t('common.save')}
                    cancelText={t('common.cancel')}
                    loading={savingDept}
                >
                    <div className="space-y-4 mt-2">
                        <Input
                            label={t('department.name')}
                            value={deptForm.name}
                            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('department.category')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={deptForm.category}
                                onChange={(e) => setDeptForm({ ...deptForm, category: e.target.value as MedicalCategory })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label={t('department.code')}
                            value={deptForm.code}
                            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                            placeholder="VD: KNOI"
                            required
                        />
                        <Input
                            label={t('department.description')}
                            value={deptForm.description}
                            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                        />
                    </div>
                </Modal>

                {/* Specialty Modal */}
                <Modal
                    isOpen={specModalOpen}
                    onClose={() => setSpecModalOpen(false)}
                    onConfirm={handleSaveSpec}
                    title={editingSpec ? t('specialty.editTitle') : t('specialty.createTitle')}
                    confirmText={t('common.save')}
                    cancelText={t('common.cancel')}
                    loading={savingSpec}
                >
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('specialty.department')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={specForm.departmentId}
                                onChange={(e) => {
                                    const deptId = e.target.value;
                                    const selectedDept = departmentsForSelect.find(dept => dept.id === deptId);
                                    setSpecForm({
                                        ...specForm,
                                        departmentId: deptId,
                                        category: (selectedDept?.category as MedicalCategory) || MedicalCategory.INTERNAL_MEDICINE
                                    });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                                <option value="">{t('specialty.selectDepartment')}</option>
                                {departmentsForSelect.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Hiển thị category (chỉ đọc) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('specialty.category')} <span className="text-red-500">*</span>
                            </label>
                            <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {categoryOptions.find(c => c.value === specForm.category)?.label || 'Chưa có'}
                            </div>
                        </div>
                        <Input
                            label={t('specialty.name')}
                            value={specForm.name}
                            onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                            required
                        />
                        <Input
                            label={t('specialty.description')}
                            value={specForm.description}
                            onChange={(e) => setSpecForm({ ...specForm, description: e.target.value })}
                        />
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModal.open}
                    onClose={() => setDeleteModal({ ...deleteModal, open: false })}
                    onConfirm={handleDelete}
                    title={t('common.deleteConfirm')}
                    message={t('common.deleteConfirmMessage', { name: deleteModal.name })}
                    variant="danger"
                    confirmText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    loading={deleting}
                />
            </div>
        </div>
    );
};

export default ManagerDepartmentsSpecialtiesPage;