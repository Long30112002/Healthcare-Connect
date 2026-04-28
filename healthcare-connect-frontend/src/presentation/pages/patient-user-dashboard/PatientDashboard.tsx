import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../application/context/AuthContext";
import { useAppTranslation } from "../../../application/hooks/useAppTranslation";
import useFetch from "../../../application/hooks/useFetch";
import { AppointmentStatus } from "../../../core/constants/enums";
import type { Appointment, VisitedDoctor } from "../../../core/types";
import AISuggestionCard from "./AISuggestionCard";
import DoctorVisitedCard from "./DoctorVisitedCard";
import SectionHeader from "./SectionHeader";
import StatCard from "./StatCard";
import UpcomingAppointmentCard from "./UpcomingAppointmentCard";
import DataWrapper from "../../components/shared/DataWrapper";


const PatientDashboard = () => {
    const { user } = useAuth();
    const { t } = useAppTranslation();
    const navigate = useNavigate();

    const { 
        data: appointmentsData, 
        loading: appointmentsLoading, 
        error: appointmentsError,
        execute: refreshAppointments 
    } = useFetch<{ content: Appointment[]; totalElements: number }>(
        '/appointments/my-bookings', 
        'GET', 
        { immediate: true }
    );

    const { 
        data: visitedDoctors, 
        loading: doctorsLoading, 
        error: doctorsError,
        execute: refreshDoctors 
    } = useFetch<VisitedDoctor[]>(
        '/patients/visited-doctors', 
        'GET', 
        { immediate: true }
    );

    const appointments = appointmentsData?.content || [];
    const upcomingAppointments = appointments
        .filter(apt => apt.status !== AppointmentStatus.CANCELLED && apt.status !== AppointmentStatus.COMPLETED)
        .slice(0, 3);

    const stats = {
        totalAppointments: appointmentsData?.totalElements || 0,
        totalDoctors: visitedDoctors?.length || 0,
        totalPrescriptions: 0,
    };

    const handlePay = (appointmentId: string) => {
        navigate(`/payment/${appointmentId}`);
    };

    const handleCancel = (appointmentId: string) => {
        console.log('Cancel appointment:', appointmentId);
    };

    const handleViewAppointment = (appointmentId: string) => {
        navigate(`/appointments/${appointmentId}`);
    };

    const handleBookAgain = (doctorId: string) => {
        navigate(`/doctors/${doctorId}/book`);
    };

    const handleAISuggestion = (suggestion: string) => {
        navigate('/doctors', { state: { suggestedSpecialty: suggestion } });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 ' + t('dashboard.morning');
        if (hour < 18) return '☀️ ' + t('dashboard.afternoon');
        return '🌙 ' + t('dashboard.evening');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6 space-y-8">
                
                {/* Welcome Section - Đẹp hơn */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl">
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="w-64 h-64" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                        </svg>
                    </div>
                    <div className="relative z-10 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl md:text-4xl shadow-lg">
                                    {user?.fullName?.charAt(0) || '👤'}
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">{getGreeting()}</p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        {user?.fullName}!
                                    </h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        {t('dashboard.welcomeMessage')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                                    🎖️ {t(`role.${user?.role}`)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Wave decoration */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-8">
                            <path fill="#f0f9ff" fillOpacity="1" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21C1120,21,1280,43,1360,53.3L1440,64L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Stats Cards - Gradient màu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <StatCard
                        icon="📋"
                        title={t('dashboard.statAppointments')}
                        count={stats.totalAppointments}
                        linkTo="/appointments"
                        detailText={t('dashboard.viewAll')}
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon="👨‍⚕️"
                        title={t('dashboard.statDoctors')}
                        count={stats.totalDoctors}
                        linkTo="/doctors/visited"
                        detailText={t('dashboard.viewAll')}
                        gradient="from-green-500 to-teal-500"
                    />
                    <StatCard
                        icon="💊"
                        title={t('dashboard.statPrescriptions')}
                        count={stats.totalPrescriptions}
                        linkTo="/prescriptions"
                        detailText={t('dashboard.viewAll')}
                        gradient="from-purple-500 to-pink-500"
                    />
                </div>

                {/* Upcoming Appointments Section */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                    <SectionHeader
                        title={t('dashboard.upcomingAppointments')}
                        icon="📋"
                        viewAllLink="/appointments"
                        viewAllText={t('dashboard.viewAll')}
                    />
                    <DataWrapper
                        loading={appointmentsLoading}
                        error={appointmentsError}
                        data={upcomingAppointments}
                        onRetry={refreshAppointments}
                        emptyMessage={t('dashboard.emptyAppointments')}
                        emptyDescription={t('dashboard.emptyAppointmentsDesc')}
                        emptyActionText={t('dashboard.bookNow')}
                        onEmptyAction={() => navigate('/doctors')}
                    >
                        {(data) => (
                            <div className="space-y-3">
                                {data.map((appointment) => (
                                    <UpcomingAppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        onPay={handlePay}
                                        onCancel={handleCancel}
                                        onView={handleViewAppointment}
                                        payText={t('dashboard.pay')}
                                        cancelText={t('dashboard.cancel')}
                                        detailText={t('dashboard.details')}
                                        paidText={t('dashboard.paid')}
                                        unpaidText={t('dashboard.unpaid')}
                                    />
                                ))}
                            </div>
                        )}
                    </DataWrapper>
                </div>

                {/* Visited Doctors Section */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                    <SectionHeader
                        title={t('dashboard.visitedDoctors')}
                        icon="👨‍⚕️"
                        viewAllLink="/doctors/visited"
                        viewAllText={t('dashboard.viewAll')}
                    />
                    <DataWrapper
                        loading={doctorsLoading}
                        error={doctorsError}
                        data={visitedDoctors}
                        onRetry={refreshDoctors}
                        emptyMessage={t('dashboard.emptyDoctors')}
                        emptyDescription={t('dashboard.emptyDoctorsDesc')}
                        emptyActionText={t('dashboard.findDoctor')}
                        onEmptyAction={() => navigate('/doctors')}
                    >
                        {(data) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data.map((doctor) => (
                                    <DoctorVisitedCard
                                        key={doctor.id}
                                        doctor={doctor}
                                        onBookAgain={handleBookAgain}
                                        bookAgainText={t('dashboard.bookAgain')}
                                        yearsText={t('dashboard.yearsExperience')}
                                    />
                                ))}
                            </div>
                        )}
                    </DataWrapper>
                </div>

                {/* AI Suggestion Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 shadow-sm">
                    <AISuggestionCard
                        onBookSuggestion={handleAISuggestion}
                        title={t('aiSuggestion.title')}
                        symptomLabel={t('aiSuggestion.symptomLabel')}
                        symptomPlaceholder={t('aiSuggestion.symptomPlaceholder')}
                        analyzeButton={t('aiSuggestion.analyzeButton')}
                        analyzingText={t('aiSuggestion.analyzing')}
                        defaultSuggestion={t('aiSuggestion.defaultSuggestion')}
                        bookNowText={t('dashboard.bookNow')}
                    />
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;