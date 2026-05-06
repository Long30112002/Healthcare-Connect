import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MedicalRecordResponse } from '../../core/types/api.response';
import RobotoFont from './fonts/Roboto-Regular-normal.js';

export interface HospitalInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}

// ==================== NỘI DUNG TIẾNG VIỆT ====================
const viContent = {
    id: 'MÃ SỐ:',
    date: 'TP. Hồ Chí Minh,',
    title: 'PHIẾU KHÁM BỆNH',
    patientInfo: 'THÔNG TIN BỆNH NHÂN',
    fullName: 'Họ và tên:',
    birthYear: 'Năm sinh:',
    phone: 'Điện thoại:',
    email: 'Email:',
    address: 'Địa chỉ:',
    treatmentTable: 'BẢNG ĐIỀU TRỊ',
    dateCol: 'Ngày',
    treatmentCol: 'Thuốc / Điều trị',
    dosageCol: 'Liều dùng',
    quantityCol: 'Số lượng',
    priceCol: 'Thành tiền',
    totalAmount: 'TỔNG TIỀN:',
    footer: 'Cảm ơn quý khách đã sử dụng dịch vụ!',
    prescription: 'ĐƠN THUỐC',
    doctorAdvice: 'LỜI DẶN CỦA BÁC SĨ',
    signatureCustomer: 'KHÁCH HÀNG',
    signatureCustomerNote: '(Ký và ghi rõ họ tên)',
    signatureAccountant: 'KẾ TOÁN',
    signatureAccountantNote: '(Ký và ghi rõ họ tên)',
    signatureDoctor: 'BÁC SĨ',
    signatureDoctorNote: '(Ký và ghi rõ họ tên)'
};

// ==================== NỘI DUNG TIẾNG ANH ====================
const enContent = {
    id: 'ID:',
    date: 'Hanoi,',
    title: 'MEDICAL EXAMINATION RECORD',
    patientInfo: 'PATIENT INFORMATION',
    fullName: 'Full name:',
    birthYear: 'Year of birth:',
    phone: 'Phone:',
    email: 'Email:',
    address: 'Address:',
    treatmentTable: 'TREATMENT TABLE',
    dateCol: 'Date',
    treatmentCol: 'Medicine / Treatment',
    dosageCol: 'Dosage',
    quantityCol: 'Quantity',
    priceCol: 'Amount',
    totalAmount: 'TOTAL AMOUNT:',
    footer: 'Thank you for using our service!',
    prescription: 'PRESCRIPTION',
    doctorAdvice: 'DOCTOR\'S ADVICE',
    signatureCustomer: 'CUSTOMER',
    signatureCustomerNote: '(Sign and print name)',
    signatureAccountant: 'ACCOUNTANT',
    signatureAccountantNote: '(Sign and print name)',
    signatureDoctor: 'DOCTOR',
    signatureDoctorNote: '(Sign and print name)'
};

const fallbackHospital: HospitalInfo = {
    name: 'HEALTHCARE CONNECT MEDICAL SYSTEM',
    address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    phone: '1900 1234',
    email: 'info@healthcareconnect.vn',
    website: 'https://healthcareconnect.vn'
};

// Format date helper
const formatDateVI = (date: Date) =>
    `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

const formatDateEN = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const formatDateFromArray = (arr?: number[], lang: 'vi' | 'en' = 'vi') => {
    if (!arr || arr.length < 3) return '---';
    const date = new Date(arr[0], arr[1] - 1, arr[2]);
    return lang === 'vi' ? formatDateVI(date) : formatDateEN(date);
};

const formatPrice = (price: number) =>
    price?.toLocaleString('vi-VN') + 'đ' || '0đ';

// Hàm tạo tên file
const generateFileName = (record: MedicalRecordResponse, language: 'vi' | 'en' = 'vi') => {
    const patientName = (record.patientName || 'unknown')
        .replace(/\s/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    
    const recordId = record.id?.substring(0, 8) || 'unknown';
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    const dateStr = `${year}-${month}-${day}_${hour}-${minute}`;
    const prefix = language === 'vi' ? 'benh_an' : 'medical_record';
    
    return `${prefix}_${patientName}_${recordId}_${dateStr}.pdf`;
};

export const exportMedicalRecordPDF = async (
    record: MedicalRecordResponse,
    hospitalInfo?: HospitalInfo,
    language: 'vi' | 'en' = 'vi'
) => {
    const doc = new jsPDF();
    const info = hospitalInfo || fallbackHospital;
    const content = language === 'vi' ? viContent : enContent;
    
    const titleFontSize = language === 'vi' ? 18 : 14;
    const headerFontSize = language === 'vi' ? 16 : 14;

    // LOAD FONT
    doc.addFileToVFS('Roboto.ttf', RobotoFont);
    doc.addFont('Roboto.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = pageWidth - 15;
    let y: number = 20;

    // ===== HEADER =====
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(headerFontSize);
    doc.text(info.name, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(info.address, pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.text(
        `Tel: ${info.phone} - Email: ${info.email}`,
        pageWidth / 2,
        y,
        { align: 'center' }
    );
    y += 5;

    doc.text(info.website, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // ===== ĐƯỜNG KẺ NGANG =====
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, y, marginRight, y);
    y += 8;

    // ===== ID + DATE =====
    const now = new Date();
    doc.setFontSize(9);
    doc.text(`${content.id} ${record.id?.substring(0, 8).toUpperCase() || '---'}`, marginLeft, y);
    
    const dateStr = language === 'vi' 
        ? `${content.date} ${formatDateVI(now)}`
        : `${formatDateEN(now)}`;
    doc.text(dateStr, marginRight, y, { align: 'right' });
    y += 12;

    // ===== TITLE =====
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(titleFontSize);
    doc.text(content.title, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // ===== PATIENT INFO =====
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.text(content.patientInfo, marginLeft, y);
    y += 6;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(`${content.fullName} ${record.patientName || '---'}`, marginLeft + 5, y); y += 5;
    doc.text(`${content.birthYear} ${record.patientBirthYear || '---'}`, marginLeft + 5, y); y += 5;
    doc.text(`${content.phone} ${record.patientPhone || '---'}`, marginLeft + 5, y); y += 5;
    doc.text(`${content.email} ${record.patientEmail || '---'}`, marginLeft + 5, y); y += 5;
    doc.text(`${content.address} ${record.patientAddress || info.address || '---'}`, marginLeft + 5, y); y += 12;

    // ===== TREATMENT TABLE =====
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.text(content.treatmentTable, marginLeft, y);
    y += 6;

    const tableData: any[] = [];

    record.prescriptions?.forEach(p => {
        const date = formatDateFromArray(p.prescriptionDate, language);
        p.items.forEach(i => {
            tableData.push([
                date,
                i.medicineName || '---',
                `${i.dosage || '---'} - ${i.frequency || '---'}`,
                i.quantity || 0,
                formatPrice(i.totalPrice)
            ]);
        });
    });

    autoTable(doc, {
        startY: y,
        head: [[
            content.dateCol,
            content.treatmentCol,
            content.dosageCol,
            content.quantityCol,
            content.priceCol
        ]],
        body: tableData.length ? tableData : [['---', '---', '---', '---', '---']],
        styles: {
            font: 'Roboto',
            fontStyle: 'normal',
            fontSize: 8
        },
        headStyles: {
            font: 'Roboto',
            fontStyle: 'bold',
            fontSize: 9,
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            halign: 'center'
        },
        bodyStyles: {
            font: 'Roboto',
            fontStyle: 'normal'
        },
        columnStyles: {
            0: { cellWidth: 30, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 45 },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: marginLeft, right: marginLeft }
    });

    const lastY = (doc as any).lastAutoTable?.finalY;
    y = (typeof lastY === 'number' && !isNaN(lastY)) ? lastY + 12 : y + 50;

    // ===== TOTAL AMOUNT =====
    const total = record.prescriptions?.reduce((s, p) => s + (p.totalAmount || 0), 0) || 0;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text(content.totalAmount, marginLeft, y);
    doc.text(formatPrice(total), marginRight, y, { align: 'right' });
    y += 20;

    // ===== SIGNATURE SECTION =====
    // Kiểm tra y hợp lệ
    if (typeof y !== 'number' || isNaN(y)) {
        y = (doc as any).internal.pageSize.getHeight() - 80;
    }

    const signatureWidth = 55;
    const signatureStart1 = 20;
    const signatureStart2 = 78;
    const signatureStart3 = 136;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(signatureStart1, y, signatureStart1 + signatureWidth, y);
    doc.line(signatureStart2, y, signatureStart2 + signatureWidth, y);
    doc.line(signatureStart3, y, signatureStart3 + signatureWidth, y);
    y += 5;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.text(content.signatureCustomer, signatureStart1 + signatureWidth / 2, y, { align: 'center' });
    doc.text(content.signatureAccountant, signatureStart2 + signatureWidth / 2, y, { align: 'center' });
    doc.text(content.signatureDoctor, signatureStart3 + signatureWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(content.signatureCustomerNote, signatureStart1 + signatureWidth / 2, y, { align: 'center' });
    doc.text(content.signatureAccountantNote, signatureStart2 + signatureWidth / 2, y, { align: 'center' });
    doc.text(content.signatureDoctorNote, signatureStart3 + signatureWidth / 2, y, { align: 'center' });

    y += 15;

    // ===== FOOTER =====
    if (typeof y === 'number' && !isNaN(y)) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(content.footer, pageWidth / 2, y, { align: 'center' });
    }

    // ===== LƯU FILE =====
    const fileName = generateFileName(record, language);
    doc.save(fileName);
};