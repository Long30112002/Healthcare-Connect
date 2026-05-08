import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { managerApi } from '../../../infrastructure/api/managerApi';
import type { RoomResponse } from '../../../core/types/api.response';
import { RoomStatus } from '../../../core/constants/enums';
import toast from 'react-hot-toast';

interface RoomFormData {
    roomNumber: string;
    floor: number;
    building: string;
}

const ManagerRoomsPage = () => {
    const { t } = useAppTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
    const [formData, setFormData] = useState<RoomFormData>({
        roomNumber: '',
        floor: 0,
        building: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        type: 'delete' | 'maintenance' | 'activate';
        roomId: string;
        roomNumber: string;
    }>({
        open: false,
        type: 'delete',
        roomId: '',
        roomNumber: '',
    });

    // Fetch data
    const fetchRooms = async () => {
        setLoading(true);
        try {
            const data = await managerApi.getRooms();
            setRooms(data);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            toast.error(t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Filter rooms by search term
    const filteredRooms = rooms.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.building?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case RoomStatus.AVAILABLE:
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">🟢 {t('room.status.available')}</span>;
            case RoomStatus.OCCUPIED:
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('room.status.occupied')}</span>;
            case RoomStatus.MAINTENANCE:
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">🔴 {t('room.status.maintenance')}</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.roomNumber.trim()) {
            errors.roomNumber = t('room.validation.roomNumberRequired');
        }
        if (formData.floor < 0) {
            errors.floor = t('room.validation.floorInvalid');
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open create modal
    const handleCreate = () => {
        setEditingRoom(null);
        setFormData({ roomNumber: '', floor: 0, building: '' });
        setFormErrors({});
        setModalOpen(true);
    };

    // Open edit modal
    const handleEdit = (room: RoomResponse) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            floor: room.floor || 0,
            building: room.building || '',
        });
        setFormErrors({});
        setModalOpen(true);
    };

    // Save room (create or update)
    const { execute: saveRoom, loading: saving } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: editingRoom ? t('room.updateSuccess') : t('room.createSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('room.saveError'),
        onSuccess: () => {
            setModalOpen(false);
            fetchRooms();
        },
    });

    const handleSave = async () => {
        if (!validateForm()) return;

        if (editingRoom) {
            await saveRoom(() => managerApi.updateRoom(editingRoom.id, formData));
        } else {
            await saveRoom(() => managerApi.createRoom(formData));
        }
    };

    // Delete room
    const { execute: deleteRoom, loading: deleting } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('room.deleteSuccess'),
        errorMessage: t('room.deleteError'),
        onSuccess: () => fetchRooms(),
    });

    const handleDelete = (roomId: string, roomNumber: string) => {
        setConfirmModal({
            open: true,
            type: 'delete',
            roomId,
            roomNumber,
        });
    };

    // Set maintenance
    const { execute: setMaintenance, loading: maintaining } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('room.maintenanceSuccess'),
        errorMessage: t('room.maintenanceError'),
        onSuccess: () => fetchRooms(),
    });

    const handleSetMaintenance = (roomId: string, roomNumber: string) => {
        setConfirmModal({
            open: true,
            type: 'maintenance',
            roomId,
            roomNumber,
        });
    };

    // Activate room
    const { execute: activateRoom, loading: activating } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('room.activateSuccess'),
        errorMessage: t('room.activateError'),
        onSuccess: () => fetchRooms(),
    });

    const handleActivate = (roomId: string, roomNumber: string) => {
        setConfirmModal({
            open: true,
            type: 'activate',
            roomId,
            roomNumber,
        });
    };

    const onConfirmAction = async () => {
        const { type, roomId } = confirmModal;

        if (type === 'delete') {
            await deleteRoom(() => managerApi.deleteRoom(roomId));
        } else if (type === 'maintenance') {
            await setMaintenance(() => managerApi.setRoomMaintenance(roomId));
        } else if (type === 'activate') {
            await activateRoom(() => managerApi.activateRoom(roomId));
        }

        setConfirmModal({ open: false, type: 'delete', roomId: '', roomNumber: '' });
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header */}
                <DashboardHeader
                    icon="🚪"
                    title={t('room.title')}
                    subtitle={t('room.subtitle')}
                    showHospital={true}
                    hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
                />

                {/* Search and Add Button */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={t('room.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <Button variant="primary" onClick={handleCreate}>
                            ➕ {t('room.addRoom')}
                        </Button>
                    </div>
                </div>

                {/* Rooms List */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            📋 {t('room.list')} ({filteredRooms.length})
                        </h2>
                    </div>

                    <div className="p-4">
                        {filteredRooms.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">{t('room.noRooms')}</p>
                        ) : (
                            <div className="space-y-3">
                                {filteredRooms.map((room) => (
                                    <div key={room.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex justify-between items-start flex-wrap gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-2xl">🚪</span>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('room.roomNumber')}: {room.roomNumber}
                                                    </h3>
                                                    {getStatusBadge(room.status)}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>🏢 {t('room.floor')}: {room.floor ?? '---'}</span>
                                                    <span>🏛️ {t('room.building')}: {room.building || '---'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>
                                                    ✏️ {t('common.edit')}
                                                </Button>

                                                {room.status === RoomStatus.AVAILABLE && (
                                                    <Button size="sm" variant="secondary" onClick={() => handleSetMaintenance(room.id, room.roomNumber)}>
                                                        🔧 {t('room.maintenance')}
                                                    </Button>
                                                )}

                                                {room.status === RoomStatus.MAINTENANCE && (
                                                    <Button size="sm" variant="primary" onClick={() => handleActivate(room.id, room.roomNumber)}>
                                                        ✅ {t('room.activate')}
                                                    </Button>
                                                )}

                                                <Button size="sm" variant="danger" onClick={() => handleDelete(room.id, room.roomNumber)}>
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
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleSave}
                title={editingRoom ? t('room.editTitle') : t('room.createTitle')}
                confirmText={t('common.save')}
                cancelText={t('common.cancel')}
                loading={saving}
            >
                <div className="space-y-4 mt-2">
                    <Input
                        label={t('room.roomNumber')}
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        placeholder={t('room.roomNumberPlaceholder')}
                        error={formErrors.roomNumber}
                        required
                    />

                    <Input
                        label={t('room.floor')}
                        type="number"
                        value={formData.floor.toString()}
                        onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                        placeholder={t('room.floorPlaceholder')}
                        error={formErrors.floor}
                    />

                    <Input
                        label={t('room.building')}
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        placeholder={t('room.buildingPlaceholder')}
                    />
                </div>
            </Modal>

            {/* Confirm Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                onConfirm={onConfirmAction}
                title={confirmModal.type === 'delete' ? t('room.deleteTitle') : confirmModal.type === 'maintenance' ? t('room.maintenanceTitle') : t('room.activateTitle')}
                message={
                    confirmModal.type === 'delete'
                        ? t('room.deleteConfirm', { roomNumber: confirmModal.roomNumber })
                        : confirmModal.type === 'maintenance'
                            ? t('room.maintenanceConfirm', { roomNumber: confirmModal.roomNumber })
                            : t('room.activateConfirm', { roomNumber: confirmModal.roomNumber })
                }
                variant="danger"
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                loading={deleting || maintaining || activating}
            />
        </div>
    );
};

export default ManagerRoomsPage;