import { PaymentMethod, type AppointmentStatus } from "../../core/constants/enums";
import type { Appointment } from "../../core/types";
import type { DashboardStatistics, PageResponse } from "../../core/types/api.response";

// ===== MOCK DATA =====
const mockPatients = [
    { name: 'Nguyễn Văn An', phone: '0901234561' },
    { name: 'Trần Thị Bình', phone: '0901234562' },
    { name: 'Lê Văn Cường', phone: '0901234563' },
    { name: 'Phạm Thị Dung', phone: '0901234564' },
    { name: 'Hoàng Văn Em', phone: '0901234565' },
];

const mockDoctors = [
    { name: 'BS. Nguyễn Văn An', room: '201', floor: 2 },
    { name: 'BS. Trần Thị Bình', room: '202', floor: 2 },
    { name: 'BS. Lê Văn Cường', room: '203', floor: 2 },
];

// ===== CACHE (GLOBAL STATE GIỐNG BACKEND) =====
const mockDataCache = new Map<string, Appointment[]>();

// ===== GENERATE APPOINTMENT =====
const generateAppointment = (
    id: number,
    date: number[],
    filter: string
): Appointment => {
    const patient = mockPatients[Math.floor(Math.random() * mockPatients.length)];
    const doctor = mockDoctors[Math.floor(Math.random() * mockDoctors.length)];

    const now = new Date();

    const appointmentDate = new Date(
        date[0],
        date[1] - 1,
        date[2],
        8 + (id % 10),
        0
    );

    const isToday =
        appointmentDate.toDateString() === now.toDateString();

    const isPast = appointmentDate < now;

    let status: AppointmentStatus;

    // ===== LOGIC STATUS =====
    if (filter === 'tomorrow') {
        status = 'CONFIRMED';
    } else if (filter === 'today') {
        const rand = Math.random();

        if (rand < 0.5) status = 'CONFIRMED';
        else if (rand < 0.8) status = 'IN_PROGRESS';
        else status = 'COMPLETED';
    } else {
        // week / all
        const rand = Math.random();

        if (isPast) {
            if (rand < 0.1) status = 'CANCELLED';
            else if (rand < 0.2) status = 'NO_SHOW';
            else if (rand < 0.6) status = 'COMPLETED';
            else status = 'IN_PROGRESS';
        } else if (isToday) {
            if (rand < 0.5) status = 'CONFIRMED';
            else if (rand < 0.8) status = 'IN_PROGRESS';
            else status = 'COMPLETED';
        } else {
            status = 'CONFIRMED'; // future => upcoming
        }
    }

    // ===== CHECK-IN TIME =====
    let checkInTime: number[] | undefined;

    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
        const checkIn = new Date(appointmentDate);
        checkIn.setMinutes(checkIn.getMinutes() - 15);

        checkInTime = [
            checkIn.getFullYear(),
            checkIn.getMonth() + 1,
            checkIn.getDate(),
            checkIn.getHours(),
            checkIn.getMinutes(),
        ];
    }

    // ===== PAID =====
    const paid =
        status === 'COMPLETED' ||
        status === 'IN_PROGRESS' ||
        (status === 'CONFIRMED' && Math.random() > 0.5);

    const paymentMethod =
        Math.random() > 0.5 ? PaymentMethod.MOMO : PaymentMethod.CASH;

    return {
        id: `mock-${id}`,
        patientName: patient.name,
        doctorName: doctor.name,
        doctorId: `doctor-${id}`,
        hospitalName: 'Bệnh viện Đa khoa Quốc tế',

        startTime: [
            appointmentDate.getFullYear(),
            appointmentDate.getMonth() + 1,
            appointmentDate.getDate(),
            appointmentDate.getHours(),
            appointmentDate.getMinutes(),
        ],

        endTime: [
            appointmentDate.getFullYear(),
            appointmentDate.getMonth() + 1,
            appointmentDate.getDate(),
            appointmentDate.getHours() + 1,
            appointmentDate.getMinutes(),
        ],

        symptoms: 'Khám tổng quát',
        status,

        price: 500000,
        paid,
        paymentMethod, 

        phone: patient.phone,
        roomNumber: doctor.room,
        roomFloor: doctor.floor,

        checkInTime,
    };
};

// ===== GET MASTER DATA (ONLY GENERATE ONCE) =====
const getMasterData = (filter: string): Appointment[] => {
    if (mockDataCache.has(filter)) {
        return mockDataCache.get(filter)!;
    }

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();

    let total = 0;

    switch (filter) {
        case 'today':
            total = 38;
            break;
        case 'tomorrow':
            total = 40;
            break;
        case 'week':
            total = 120;
            break;
        default:
            total = 200;
    }

    const data: Appointment[] = [];

    for (let i = 1; i <= total; i++) {
        data.push(generateAppointment(i, [y, m, d], filter));
    }

    // 👉 SORT giống backend thật
    data.sort((a, b) => {
        const t1 = a.startTime[3] * 60 + a.startTime[4];
        const t2 = b.startTime[3] * 60 + b.startTime[4];
        return t1 - t2;
    });

    mockDataCache.set(filter, data);

    return data;
};

// ===== PAGINATION =====
export const getMockAppointments = (
    filter: string,
    page: number,
    size: number
): PageResponse<Appointment> => {
    const all = getMasterData(filter);

    const start = page * size;
    const end = start + size;

    const content = all.slice(start, end);
    const totalElements = all.length;
    const totalPages = Math.ceil(totalElements / size);

    const sort = {
        empty: true,
        sorted: false,
        unsorted: true,
    };

    return {
        content,

        pageable: {
            pageNumber: page,
            pageSize: size,
            sort,
            offset: page * size,
            paged: true,
            unpaged: false,
        },

        sort,

        totalPages,
        totalElements,

        last: page + 1 >= totalPages,
        first: page === 0,

        size,
        number: page,
        numberOfElements: content.length,
        empty: content.length === 0,
    };
};

// ===== STATISTICS =====
export const getMockStatisticsByFilter = (
    filter: string
): DashboardStatistics => {
    const all = getMasterData(filter);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSameDay = (dateArr: number[]) => {
        const d = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };

    let waiting = 0;
    let upcoming = 0;
    let checkedIn = 0;
    let completed = 0;
    let cancelled = 0;
    let noShow = 0;

    all.forEach(a => {
        switch (a.status) {
            case 'CONFIRMED':
                if (isSameDay(a.startTime)) {
                    waiting++; // hôm nay → chờ check-in
                } else {
                    upcoming++; // tương lai
                }
                break;

            case 'IN_PROGRESS':
                checkedIn++;
                break;

            case 'COMPLETED':
                completed++;
                break;

            case 'CANCELLED':
                cancelled++;
                break;

            default:
                break;
        }
    });

    return {
        upcoming,
        waiting,
        checkedIn,
        completed,
        cancelled,
        noShow,
        total: all.length,
    };
};

// ===== CHECK-IN (UPDATE STATE LIKE REAL BACKEND) =====
export const mockCheckIn = (
    filter: string,
    appointmentId: string
): void => {
    const all = getMasterData(filter);

    const target = all.find(a => a.id === appointmentId);

    if (!target) return;

    if (target.status !== 'CONFIRMED') return;

    target.status = 'IN_PROGRESS';

    const now = new Date();

    target.checkInTime = [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
    ];
};