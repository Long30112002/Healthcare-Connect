import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import Button from '../../../presentation/components/shared/Button';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import Input from '../../../presentation/components/shared/Input';
import Modal from '../../../presentation/components/shared/Modal';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import { medicalRecordApi } from '../../../infrastructure/api/medicalRecordApi';
import { formatDateShort, formatDateTime } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import type { PatientResponse, WalkInAppointmentItem } from '../../../core/types/api.response';

interface PatientSummaryWithUI {
    id: string;
    patientId: string | null;
    patientName: string;
    patientPhone: string;
    patientEmail?: string | null;
    lastVisitDate: number[];
    totalVisits: number;
    lastDiagnosis: string;
    isWalkIn: boolean;
}

const MyPatientsPage = () => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useAppTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<PatientSummaryWithUI[]>([]);
    const [, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // State cho Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPatient, ] = useState<PatientSummaryWithUI | null>(null);
    const [medicalRecordStatus, setMedicalRecordStatus] = useState<Record<string, boolean>>({});
    const [showAppointmentSelectModal, setShowAppointmentSelectModal] = useState(false);
    const [appointmentList, setAppointmentList] = useState<WalkInAppointmentItem[]>([]);
    const [selectedWalkInPhone, setSelectedWalkInPhone] = useState<string>('');
    const [showConfirmCreateModal, setShowConfirmCreateModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<WalkInAppointmentItem | null>(null);

    const { activeTab, setActiveTab } = useTabWithUrl({
        paramName: 'filter',
        validValues: ['all', 'recent', 'oldest'],
        defaultValue: 'all'
    });

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const patientsData = await appointmentApi.getMyPatients();

            const transformedPatients: PatientSummaryWithUI[] = patientsData.map((item: PatientResponse) => ({
                id: item.id,
                patientId: item.patientId,
                patientName: item.patientName,
                patientPhone: item.patientPhone,
                patientEmail: item.patientEmail,
                lastVisitDate: item.lastVisitDate,
                totalVisits: item.totalVisits,
                lastDiagnosis: item.lastDiagnosis,
                isWalkIn: item.isWalkIn
            }));

            setPatients(transformedPatients);
            setTotalElements(transformedPatients.length);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            toast.error(t('common.loadError'));
            setPatients([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [activeTab]);

    useEffect(() => {
        const checkMedicalRecords = async () => {
            const status: Record<string, boolean> = {};
            for (const patient of patients) {
                if (patient.isWalkIn) {
                    try {
                        await medicalRecordApi.getByAppointmentId(patient.id);
                        status[patient.id] = true;
                    } catch {
                        status[patient.id] = false;
                    }
                }
            }
            setMedicalRecordStatus(status);
        };
        if (patients.length > 0) {
            checkMedicalRecords();
        }
    }, [patients]);

    const handleWalkInPatientClick = async (phone: string) => {
        try {
            const appointments = await appointmentApi.getWalkInAppointments(phone);
            if (appointments && appointments.length > 0) {
                setAppointmentList(appointments);
                setSelectedWalkInPhone(phone);
                setShowAppointmentSelectModal(true);
            } else {
                toast.error(t('myPatients.noWalkInHistory'));
            }
        } catch (error) {
            console.error("Failed to fetch walk-in appointments:", error);
            toast.error(t('myPatients.loadWalkInHistoryError'));
        }
    };

    // Xử lý click view detail
    const handleViewPatient = (patient: PatientSummaryWithUI) => {
        if (!patient.id) {
            toast.error(t('myPatients.cannotViewDetail'));
            return;
        }
        if (patient.isWalkIn) {
            handleWalkInPatientClick(patient.patientPhone);
        } else {
            navigate(`/my-patients/${patient.id}`);
        }
    };

    const handleSelectAppointment = (appointment: WalkInAppointmentItem) => {
        if (appointment.hasMedicalRecord) {
            setShowAppointmentSelectModal(false);
            navigate(`/doctor/medical-records/view/${appointment.id}`);
        } else {
            // Đóng modal chọn lịch hẹn, mở modal xác nhận tạo
            setShowAppointmentSelectModal(false);
            setSelectedAppointment(appointment);
            setShowConfirmCreateModal(true);
        }
    };

    const handleCloseConfirmCreateModal = () => {
        setShowConfirmCreateModal(false);
        setSelectedAppointment(null);
        setShowAppointmentSelectModal(true);
    };

    const handleConfirmCreateMedicalRecord = () => {
        if (selectedAppointment) {
            setShowConfirmCreateModal(false);
            setSelectedAppointment(null);
            navigate(`/doctor/medical-records/create/${selectedAppointment.id}`);
        }
    };

    const closeAppointmentModal = () => {
        setShowAppointmentSelectModal(false);
        setAppointmentList([]);
        setSelectedWalkInPhone('');
    };

    // Tạo bệnh án mới
    const handleCreateMedicalRecord = () => {
        if (selectedPatient) {
            setShowCreateModal(false);
            navigate(`/doctor/medical-records/create/${selectedPatient.id}`);
        }
    };

    const formatLastVisitDate = (date: number[]): string => {
        if (!date || date.length < 3) return '---';
        return formatDateShort(date);
    };

    const filteredPatients = patients.filter(p =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientPhone.includes(searchTerm) ||
        (p.patientEmail && p.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedPatients = [...filteredPatients];
    if (activeTab === 'recent') {
        sortedPatients.sort((a, b) => {
            const getTime = (date: number[]): number => {
                if (date && date.length >= 3) {
                    return new Date(date[0], date[1] - 1, date[2]).getTime();
                }
                return 0;
            };
            return getTime(b.lastVisitDate) - getTime(a.lastVisitDate);
        });
    } else if (activeTab === 'oldest') {
        sortedPatients.sort((a, b) => {
            const getTime = (date: number[]): number => {
                if (date && date.length >= 3) {
                    return new Date(date[0], date[1] - 1, date[2]).getTime();
                }
                return 0;
            };
            return getTime(a.lastVisitDate) - getTime(b.lastVisitDate);
        });
    }

    const totalPages = Math.ceil(sortedPatients.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPatients = sortedPatients.slice(startIndex, startIndex + pageSize);

    const tabOptions = [
        { key: 'all' as const, label: t('myPatients.filterAll'), icon: '📋' },
        { key: 'recent' as const, label: t('myPatients.filterRecent'), icon: '🕐' },
        { key: 'oldest' as const, label: t('myPatients.filterOldest'), icon: '📅' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">👥</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {t('myPatients.title')}
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {t('myPatients.subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <span className="text-white text-sm">
                                📊 {totalElements} {t('myPatients.totalPatients')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    {/* Filter Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 pt-4">
                        <div className="flex flex-wrap gap-2">
                            {tabOptions.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.key
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-1">
                                        {tab.icon} {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Input
                            placeholder={t('myPatients.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                            fullWidth
                        />
                    </div>

                    {/* Patient List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedPatients.length === 0 ? (
                            <EmptyState
                                title={t('myPatients.noPatients')}
                                description={t('myPatients.noPatientsDesc')}
                                icon="👥"
                                actionText={t('myPatients.goToDashboard')}
                                onAction={() => navigate('/doctor/dashboard')}
                            />
                        ) : (
                            paginatedPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                                    onClick={() => handleViewPatient(patient)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {patient.patientName}
                                            </h3>
                                            {patient.isWalkIn && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    🚶 {t('myPatients.walkIn')}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                {t('myPatients.totalVisits')}: {patient.totalVisits}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <span>📞</span>
                                                <span>{patient.patientPhone}</span>
                                            </div>
                                            {patient.patientEmail && (
                                                <div className="flex items-center gap-1">
                                                    <span>✉️</span>
                                                    <span className="truncate max-w-[200px]">{patient.patientEmail}</span>
                                                </div>
                                            )}
                                        </div>

                                        {patient.lastVisitDate && (
                                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                <span>🕐</span>
                                                <span>{t('myPatients.lastVisit')}: {formatLastVisitDate(patient.lastVisitDate)}</span>
                                            </div>
                                        )}


                                    </div>

                                    {/* Warning + Button cùng hàng */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex flex-wrap gap-2">
                                            {patient.lastDiagnosis && (
                                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                                        <span className="font-medium">📝 {t('myPatients.lastDiagnosis')}:</span> {patient.lastDiagnosis}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {patient.isWalkIn && (
                                                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                                    🚶 {t('myPatients.warningWalkIn')}
                                                </div>
                                            )}

                                            {!patient.isWalkIn && patient.totalVisits === 0 && (
                                                <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                                    👤 {t('myPatients.warningNoVisit')}
                                                </div>
                                            )}

                                            {patient.lastVisitDate && (() => {
                                                const lastDate = new Date(patient.lastVisitDate[0], patient.lastVisitDate[1] - 1, patient.lastVisitDate[2]);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const diffDays = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                                                if (diffDays > 180) {
                                                    return (
                                                        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                                            ⏰ {t('myPatients.warningLongTimeNoVisit', { days: diffDays })}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Thêm warning nếu chưa có bệnh án cho walk-in */}
                                            {patient.isWalkIn && !medicalRecordStatus[patient.id] && (
                                                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                                    📝 {t('myPatients.warningNoMedicalRecord')}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewPatient(patient);
                                            }}
                                        >
                                            🔍 {t('common.viewDetail')}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                showJumpToPage={true}
                                showFirstLast={true}
                                showPrevNext={true}
                                size="md"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xác nhận tạo bệnh án từ patient list */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onConfirm={handleCreateMedicalRecord}
                title={t('myPatients.createMedicalRecordTitle')}
                message={currentLanguage === 'vi'
                    ? `Bệnh nhân ${selectedPatient?.patientName || ''} chưa có bệnh án. Bạn có muốn tạo bệnh án mới không?`
                    : `Patient ${selectedPatient?.patientName || ''} has no medical record. Do you want to create one?`
                }
                variant="primary"
                confirmText={t('myPatients.createNow')}
                cancelText={t('common.cancel')}
            />

            {/* Modal chọn lần khám cho walk-in patient */}
            <Modal
                isOpen={showAppointmentSelectModal}
                onClose={closeAppointmentModal}
                title={currentLanguage === 'vi'
                    ? `Chọn lần khám cho số điện thoại ${selectedWalkInPhone}`
                    : `Select appointment for phone ${selectedWalkInPhone}`
                }
                showConfirm={false}
                size="lg"
            >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {appointmentList.map((apt) => (
                        <div
                            key={apt.id}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            onClick={() => handleSelectAppointment(apt)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        📅 {formatDateTime(apt.appointmentDate, 'dd/mm/yyyy')}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        👨‍⚕️ {apt.doctorName}
                                    </p>
                                    {apt.symptoms && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            💬 {apt.symptoms.length > 50 ? apt.symptoms.substring(0, 50) + '...' : apt.symptoms}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {apt.hasMedicalRecord ? (
                                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                            ✅ {t('myPatients.hasMedicalRecord')}
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full">
                                            ⚠️ {t('myPatients.noMedicalRecord')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Modal xác nhận tạo bệnh án từ danh sách lịch hẹn */}
            <Modal
                isOpen={showConfirmCreateModal}
                onClose={handleCloseConfirmCreateModal}  // 🟢 Dùng handler riêng
                onConfirm={handleConfirmCreateMedicalRecord}
                title={t('myPatients.createMedicalRecordTitle')}
                message={selectedAppointment ? (
                    currentLanguage === 'vi'
                        ? `Bệnh nhân ${selectedAppointment.patientName} (ngày ${formatDateTime(selectedAppointment.appointmentDate, 'dd/mm/yyyy')}) chưa có bệnh án. Bạn có muốn tạo mới không?`
                        : `Patient ${selectedAppointment.patientName} (date ${formatDateTime(selectedAppointment.appointmentDate, 'dd/mm/yyyy')}) has no medical record. Do you want to create one?`
                ) : ''}
                variant="primary"
                confirmText={t('myPatients.createNow')}
                cancelText={t('common.cancel')}
            />
        </div>
    );
};

export default MyPatientsPage;