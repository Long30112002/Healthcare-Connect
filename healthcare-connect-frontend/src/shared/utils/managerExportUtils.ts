import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TopDoctorResponse } from '../../core/types';
import type { RevenueData, DepartmentStat, TopMedicine } from '../../infrastructure/api/statisticsApi';
import RobotoFont from './fonts/Roboto-Regular-normal';

export interface ManagerReportData {
    revenues: RevenueData[];
    departments: DepartmentStat[];
    topMedicines: TopMedicine[];
    topDoctors: TopDoctorResponse[];
    hospitalName: string;
    period: string;
}

export const exportManagerStatisticsExcel = (data: ManagerReportData) => {
    const workbook = XLSX.utils.book_new();
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    // Sheet 1: Doanh thu theo tháng
    const revenueSheetData = [
        ['BÁO CÁO THỐNG KÊ BỆNH VIỆN'],
        [`Bệnh viện: ${data.hospitalName}`],
        [`Ngày xuất: ${dateStr}`],
        [''],
        ['DOANH THU THEO THÁNG'],
        ['Tháng', 'Năm', 'Doanh thu (VNĐ)'],
        ...data.revenues.map(r => [r.month, r.year, r.revenue.toLocaleString()]),
        ['', 'TỔNG:', data.revenues.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()],
    ];
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');

    // Sheet 2: Thống kê theo khoa
    const deptSheetData = [
        ['THỐNG KÊ THEO KHOA'],
        ['Khoa', 'Số bệnh nhân', 'Doanh thu (VNĐ)'],
        ...data.departments.map(d => [d.departmentName, d.totalPatients, d.totalRevenue.toLocaleString()]),
    ];
    const deptSheet = XLSX.utils.aoa_to_sheet(deptSheetData);
    XLSX.utils.book_append_sheet(workbook, deptSheet, 'Theo khoa');

    // Sheet 3: Top thuốc
    const medicineSheetData = [
        ['TOP THUỐC ĐƯỢC KÊ NHIỀU NHẤT'],
        ['STT', 'Tên thuốc', 'Số đơn'],
        ...data.topMedicines.map((m, i) => [i + 1, m.medicineName, m.prescriptionCount]),
    ];
    const medicineSheet = XLSX.utils.aoa_to_sheet(medicineSheetData);
    XLSX.utils.book_append_sheet(workbook, medicineSheet, 'Top thuốc');

    // Sheet 4: Top bác sĩ
    const doctorSheetData = [
        ['TOP BÁC SĨ'],
        ['STT', 'Bác sĩ', 'Chuyên khoa', 'Số bệnh nhân', 'Doanh thu (VNĐ)'],
        ...data.topDoctors.map((d, i) => [i + 1, d.doctorName, d.specialtyName, d.totalPatients, d.totalRevenue.toLocaleString()]),
    ];
    const doctorSheet = XLSX.utils.aoa_to_sheet(doctorSheetData);
    XLSX.utils.book_append_sheet(workbook, doctorSheet, 'Top bác sĩ');

    // Lưu file
    const fileName = `thong_ke_benh_vien_${dateStr.replace(/\//g, '-')}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
};

export const exportManagerStatisticsPDF = (data: ManagerReportData) => {
    const doc = new jsPDF();
    
    doc.addFileToVFS('Roboto.ttf', RobotoFont);
    doc.addFont('Roboto.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'normal');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.text('BÁO CÁO THỐNG KÊ BỆNH VIỆN', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.text(data.hospitalName, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Doanh thu theo tháng
    doc.setFontSize(12);
    doc.text('Doanh thu theo tháng', marginLeft, y);
    y += 5;
    
    const revenueBody = data.revenues.map(r => [r.month, r.year, r.revenue.toLocaleString()]);
    autoTable(doc, {
        startY: y,
        head: [['Tháng', 'Năm', 'Doanh thu (VNĐ)']],
        body: revenueBody,
        margin: { left: marginLeft },
        styles: { font: 'Roboto', fontSize: 8 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Thống kê theo khoa
    doc.text('Thống kê theo khoa', marginLeft, y);
    y += 5;
    
    const deptBody = data.departments.map(d => [d.departmentName, d.totalPatients, d.totalRevenue.toLocaleString()]);
    autoTable(doc, {
        startY: y,
        head: [['Khoa', 'Số bệnh nhân', 'Doanh thu (VNĐ)']],
        body: deptBody,
        margin: { left: marginLeft },
        styles: { font: 'Roboto', fontSize: 8 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Top thuốc
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    doc.text('Top thuốc được kê nhiều nhất', marginLeft, y);
    y += 5;
    
    const medicineBody = data.topMedicines.map((m, i) => [i + 1, m.medicineName, m.prescriptionCount]);
    autoTable(doc, {
        startY: y,
        head: [['STT', 'Tên thuốc', 'Số đơn']],
        body: medicineBody,
        margin: { left: marginLeft },
        styles: { font: 'Roboto', fontSize: 8 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Top bác sĩ
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    doc.text('Top bác sĩ', marginLeft, y);
    y += 5;
    
    const doctorBody = data.topDoctors.map((d, i) => [i + 1, d.doctorName, d.specialtyName, d.totalPatients, d.totalRevenue.toLocaleString()]);
    autoTable(doc, {
        startY: y,
        head: [['STT', 'Bác sĩ', 'Chuyên khoa', 'Số BN', 'Doanh thu']],
        body: doctorBody,
        margin: { left: marginLeft },
        styles: { font: 'Roboto', fontSize: 8 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });

    // Lưu file
    doc.save(`thong_ke_benh_vien_${new Date().toISOString().split('T')[0]}.pdf`);
};