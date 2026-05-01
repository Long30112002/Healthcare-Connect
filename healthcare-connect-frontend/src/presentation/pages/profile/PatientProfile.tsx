import { useAuth } from '../../../application/context/AuthContext';
import BaseProfile from './BaseProfile';
import BasicInfoForm from './components/BasicInfoForm';
import ChangePasswordForm from './components/ChangePasswordForm';

const PatientProfile = () => {
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

export default PatientProfile;