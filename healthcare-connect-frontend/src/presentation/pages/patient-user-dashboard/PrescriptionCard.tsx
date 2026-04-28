interface Prescription {
    id: string;
    date: string;
    doctorName: string;
    specialty: string;
    medicineCount: number;
}

interface PrescriptionCardProps {
    prescription: Prescription;
    onView: (id: string) => void;
}

const PrescriptionCard = ({ prescription, onView }: PrescriptionCardProps) => {
    return (
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💊</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            Đơn thuốc {prescription.date}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        👨‍⚕️ {prescription.doctorName} - {prescription.specialty}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        📋 {prescription.medicineCount} loại thuốc
                    </p>
                </div>
                <button
                    onClick={() => onView(prescription.id)}
                    className="text-sm text-primary hover:text-blue-700 font-medium"
                >
                    Xem chi tiết →
                </button>
            </div>
        </div>
    );
};

export default PrescriptionCard;