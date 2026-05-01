import { useAuth } from '../../../application/context/AuthContext';
import PatientProfile from './PatientProfile';
import DoctorProfile from './DoctorProfile';
import BaseProfile from './BaseProfile';
import BasicInfoForm from './components/BasicInfoForm';
import ChangePasswordForm from './components/ChangePasswordForm';

// Profile đơn giản cho Receptionist, Manager, Admin
const SimpleProfile = () => {
  const { user } = useAuth();
  return (
    <BaseProfile>
      <BasicInfoForm
        userId={user?.id || ''}
        initialFullName={user?.fullName || ''}
        initialPhone={user?.phone || ''}
        initialEmail={user?.email || ''}
        disabledFields={['email']}
      />
      <ChangePasswordForm />
    </BaseProfile>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'PATIENT':
      return <PatientProfile />;
    case 'DOCTOR':
      return <DoctorProfile />;
    case 'RECEPTIONIST':
    case 'HOSPITAL_MANAGER':
    case 'ADMIN':
    default:
      return <SimpleProfile />;
  }
};

export default ProfilePage;