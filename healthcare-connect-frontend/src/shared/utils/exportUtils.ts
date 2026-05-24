import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoFont from './fonts/Roboto-Regular-normal.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ==================== FORMAT FUNCTIONS ====================

export const formatPrice = (price: number): string => {
  if (!price && price !== 0) return '0đ';
  return price.toLocaleString('vi-VN') + 'đ';
};

export const formatDateVI = (date: Date): string => {
  return `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
};

export const formatDateForFilename = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==================== EXPORT DOCTOR STATISTICS PDF ====================

interface DoctorStatsData {
  summary: {
    totalPatients: number;
    totalPatientsChange: number;
    revenue: number;
    revenueChange: number;
    averageRating: number;
    averageRatingChange: number;
    totalPrescriptions: number;
    totalPrescriptionsChange: number;
  };
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  topMedicines: Array<{ medicineName: string; count: number }>;
  ratingDistribution: Array<{ stars: number; count: number; percentage: number }>;
  doctorRanking: Array<{ name: string; totalPatients: number; revenue: number; rating: number; rank: number }>;
}

export const exportDoctorStatisticsPDF = (
  stats: DoctorStatsData,
  doctorName: string,
  hospitalName: string,
  period: string,
  specialtyName?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = pageWidth - 15;
  let y = 20;

  // Load font Roboto
  doc.addFileToVFS('Roboto.ttf', RobotoFont);
  doc.addFont('Roboto.ttf', 'Roboto', 'normal');
  doc.addFont('Roboto.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');

  // ===== HEADER =====
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(16);
  doc.text('HEALTHCARE CONNECT', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(12);
  doc.text('BÁO CÁO THỐNG KÊ BÁC SĨ', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, y, marginRight, y);
  y += 10;

  // ===== THÔNG TIN BÁC SĨ =====
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.text(`Bác sĩ: ${doctorName}`, marginLeft, y);
  y += 6;
  doc.text(`Bệnh viện: ${hospitalName}`, marginLeft, y);
  y += 6;
  if (specialtyName) {
    doc.text(`Chuyên khoa: ${specialtyName}`, marginLeft, y);
    y += 6;
  }
  
  const periodText: Record<string, string> = {
    week: 'Tuần này',
    month: 'Tháng này',
    year: 'Năm nay',
  };
  doc.text(`Thời gian: ${periodText[period] || 'Tháng này'}`, marginLeft, y);
  y += 6;
  doc.text(`Ngày xuất: ${formatDateVI(new Date())}`, marginLeft, y);
  y += 15;

  // ===== 4 STAT CARDS =====
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(11);
  doc.text('TỔNG QUAN', marginLeft, y);
  y += 6;

  const cardWidth = 45;
  const cardHeight = 30;
  const cardX = [marginLeft, marginLeft + cardWidth + 5, marginLeft + (cardWidth + 5) * 2, marginLeft + (cardWidth + 5) * 3];

  const cards = [
    { icon: '👥', label: 'Bệnh nhân', value: stats.summary.totalPatients.toString(), change: stats.summary.totalPatientsChange },
    { icon: '💰', label: 'Doanh thu', value: formatPrice(stats.summary.revenue), change: stats.summary.revenueChange },
    { icon: '⭐', label: 'Đánh giá', value: stats.summary.averageRating.toFixed(1) + '/5', change: stats.summary.averageRatingChange },
    { icon: '📋', label: 'Đơn thuốc', value: stats.summary.totalPrescriptions.toString(), change: stats.summary.totalPrescriptionsChange },
  ];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const x = cardX[i];
    
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.rect(x, y, cardWidth, cardHeight, 'F');
    
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.text(`${card.icon} ${card.label}`, x + 3, y + 8);
    
    doc.setFontSize(12);
    doc.text(card.value, x + 3, y + 20);
    
    doc.setFontSize(7);
    const changeColor = card.change >= 0 ? [0, 150, 0] : [200, 0, 0];
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(`${card.change >= 0 ? '▲' : '▼'} ${Math.abs(card.change)}% so với kỳ trước`, x + 3, y + 27);
    doc.setTextColor(0, 0, 0);
  }

  y += cardHeight + 10;

  // ===== TOP CHẨN ĐOÁN & TOP THUỐC =====
  const colWidth = (pageWidth - marginLeft * 2 - 10) / 2;

  // Cột trái: Top chẩn đoán
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.text('🏥 TOP CHẨN ĐOÁN', marginLeft, y);
  
  const diagnosisData = stats.topDiagnoses.map((item, idx) => [`${idx + 1}. ${item.diagnosis}`, `${item.count} lần`]);
  autoTable(doc, {
    startY: y + 3,
    head: [['Chẩn đoán', 'Số lần']],
    body: diagnosisData,
    margin: { left: marginLeft, right: pageWidth - marginLeft - colWidth - 5 },
    styles: { font: 'Roboto', fontSize: 8 },
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 30, halign: 'center' } },
  });

  // Cột phải: Top thuốc
  const medicineData = stats.topMedicines.map((item, idx) => [`${idx + 1}. ${item.medicineName}`, `${item.count} đơn`]);
  autoTable(doc, {
    startY: y + 3,
    head: [['Thuốc', 'Số đơn']],
    body: medicineData,
    margin: { left: marginLeft + colWidth + 5, right: marginRight },
    styles: { font: 'Roboto', fontSize: 8 },
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 30, halign: 'center' } },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== PHÂN BỐ ĐÁNH GIÁ =====
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.text('⭐ PHÂN BỐ ĐÁNH GIÁ', marginLeft, y);
  y += 6;

  const ratingData = stats.ratingDistribution.map(item => [`${item.stars} ★`, `${item.percentage}%`, `${item.count} đánh giá`]);
  autoTable(doc, {
    startY: y,
    head: [['Số sao', 'Tỷ lệ', 'Số lượng']],
    body: ratingData,
    margin: { left: marginLeft, right: marginRight },
    styles: { font: 'Roboto', fontSize: 8 },
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 8 },
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 40, halign: 'center' }, 2: { cellWidth: 50, halign: 'center' } },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== BẢNG XẾP HẠNG ĐỒNG NGHIỆP (ĐÃ SỬA) =====
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.text('👥 SO SÁNH VỚI ĐỒNG NGHIỆP', marginLeft, y);
  y += 6;

  // Xử lý dữ liệu bảng xếp hạng
  const rankingData = stats.doctorRanking.map(doctor => {
    let displayName = doctor.name;
    if (doctor.rank === 1) displayName = `🥇 ${displayName}`;
    else if (doctor.rank === 2) displayName = `🥈 ${displayName}`;
    else if (doctor.rank === 3) displayName = `🥉 ${displayName}`;
    
    // Giới hạn tên bác sĩ tối đa 30 ký tự
    if (displayName.length > 30) {
      displayName = displayName.substring(0, 27) + '...';
    }
    
    return [
      displayName,
      `${doctor.totalPatients}`,
      formatPrice(doctor.revenue),
      `${doctor.rating.toFixed(1)}`
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Bác sĩ', 'Số BN', 'Doanh thu', 'ĐG']],
    body: rankingData,
    margin: { left: marginLeft, right: marginRight },
    styles: { 
      font: 'Roboto', 
      fontSize: 8,
      cellWidth: 'wrap',
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [0, 102, 204], 
      textColor: [255, 255, 255], 
      fontSize: 8,
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 65 },      // Bác sĩ
      1: { cellWidth: 25, halign: 'center' },   // Số BN
      2: { cellWidth: 45, halign: 'right' },    // Doanh thu
      3: { cellWidth: 20, halign: 'center' },   // Đánh giá
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ===== FOOTER =====
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Healthcare Connect - Hệ thống y tế thông minh', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(`Báo cáo được tạo lúc: ${new Date().toLocaleString('vi-VN')}`, pageWidth / 2, y, { align: 'center' });

  // ===== LƯU FILE =====
  const fileName = `thongke_bacsi_${doctorName.replace(/\s/g, '_')}_${formatDateForFilename(new Date())}.pdf`;
  doc.save(fileName);
};

// ==================== FORMAT EXCEL ====================

interface DoctorStatsForExcel {
  summary: {
    totalPatients: number;
    totalPatientsChange: number;
    revenue: number;
    revenueChange: number;
    averageRating: number;
    averageRatingChange: number;
    totalPrescriptions: number;
    totalPrescriptionsChange: number;
  };
  monthlyTrend: Array<{ month: number; year: number; count: number }>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  topMedicines: Array<{ medicineName: string; count: number }>;
  ratingDistribution: Array<{ stars: number; count: number; percentage: number }>;
  doctorRanking: Array<{ doctorId: string; name: string; totalPatients: number; revenue: number; rating: number; rank: number }>;
}

export const exportDoctorStatisticsExcel = (
  stats: DoctorStatsForExcel,
  doctorName: string,
  hospitalName: string,
  _period: string,
  periodText: string,
  specialtyName?: string
) => {
  const workbook = XLSX.utils.book_new();
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  // ===== SHEET 1: THÔNG TIN CHUNG =====
  const infoData = [
    ['THỐNG KÊ BÁC SĨ - HEALTHCARE CONNECT', ''],
    ['', ''],
    ['Thông tin bác sĩ', ''],
    ['Họ tên', doctorName],
    ['Bệnh viện', hospitalName],
    ['Chuyên khoa', specialtyName || '---'],
    ['Kỳ thống kê', periodText],
    ['Ngày xuất báo cáo', dateStr],
    ['', ''],
    ['TỔNG QUAN', ''],
    ['Chỉ tiêu', 'Giá trị', 'Thay đổi'],
    ['Tổng số bệnh nhân', stats.summary.totalPatients, `${stats.summary.totalPatientsChange >= 0 ? '+' : ''}${stats.summary.totalPatientsChange}%`],
    ['Doanh thu', stats.summary.revenue.toLocaleString() + 'đ', `${stats.summary.revenueChange >= 0 ? '+' : ''}${stats.summary.revenueChange}%`],
    ['Đánh giá trung bình', `${stats.summary.averageRating.toFixed(1)}/5`, `${stats.summary.averageRatingChange >= 0 ? '+' : ''}${stats.summary.averageRatingChange}`],
    ['Tổng đơn thuốc', stats.summary.totalPrescriptions, `${stats.summary.totalPrescriptionsChange >= 0 ? '+' : ''}${stats.summary.totalPrescriptionsChange}%`],
  ];
  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  infoSheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Tổng quan');

  // ===== SHEET 2: XU HƯỚNG THEO THÁNG =====
  const trendData = [
    ['XU HƯỚNG SỐ BỆNH NHÂN THEO THÁNG'],
    ['Tháng', 'Số bệnh nhân'],
    ...stats.monthlyTrend.map(item => [`Tháng ${item.month}/${item.year}`, item.count]),
    ['', ''],
    ['Tổng cả năm', stats.monthlyTrend.reduce((sum, item) => sum + item.count, 0)],
  ];
  const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
  trendSheet['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, trendSheet, 'Xu hướng');

  // ===== SHEET 3: TOP CHẨN ĐOÁN =====
  const diagnosisData = [
    ['TOP CHẨN ĐOÁN PHỔ BIẾN NHẤT'],
    ['STT', 'Chẩn đoán', 'Số lần'],
    ...stats.topDiagnoses.map((item, idx) => [idx + 1, item.diagnosis, item.count]),
  ];
  const diagnosisSheet = XLSX.utils.aoa_to_sheet(diagnosisData);
  diagnosisSheet['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, diagnosisSheet, 'Top chẩn đoán');

  // ===== SHEET 4: TOP THUỐC =====
  const medicineData = [
    ['TOP THUỐC ĐÃ KÊ NHIỀU NHẤT'],
    ['STT', 'Tên thuốc', 'Số đơn'],
    ...stats.topMedicines.map((item, idx) => [idx + 1, item.medicineName, item.count]),
  ];
  const medicineSheet = XLSX.utils.aoa_to_sheet(medicineData);
  medicineSheet['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, medicineSheet, 'Top thuốc');

  // ===== SHEET 5: PHÂN BỐ ĐÁNH GIÁ =====
  const ratingData = [
    ['PHÂN BỐ ĐÁNH GIÁ TỪ BỆNH NHÂN'],
    ['Số sao', 'Số lượng', 'Tỷ lệ'],
    ...stats.ratingDistribution.map(item => [`${item.stars} ★`, item.count, `${item.percentage}%`]),
    ['', '', ''],
    ['Tổng số đánh giá', stats.ratingDistribution.reduce((sum, item) => sum + item.count, 0), '100%'],
  ];
  const ratingSheet = XLSX.utils.aoa_to_sheet(ratingData);
  ratingSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, ratingSheet, 'Đánh giá');

  // ===== SHEET 6: XẾP HẠNG ĐỒNG NGHIỆP =====
  const rankingData = [
    ['SO SÁNH VỚI ĐỒNG NGHIỆP TRONG BỆNH VIỆN'],
    ['Hạng', 'Bác sĩ', 'Số bệnh nhân', 'Doanh thu', 'Đánh giá'],
    ...stats.doctorRanking.map(doctor => {
      let rankDisplay = `#${doctor.rank}`;
      if (doctor.rank === 1) rankDisplay = '🥇 #1';
      else if (doctor.rank === 2) rankDisplay = '🥈 #2';
      else if (doctor.rank === 3) rankDisplay = '🥉 #3';
      return [
        rankDisplay,
        doctor.name,
        doctor.totalPatients,
        doctor.revenue.toLocaleString() + 'đ',
        `${doctor.rating.toFixed(1)} ★`
      ];
    }),
  ];
  const rankingSheet = XLSX.utils.aoa_to_sheet(rankingData);
  rankingSheet['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Xếp hạng');

  // ===== LƯU FILE =====
  const fileName = `thongke_bacsi_${doctorName.replace(/\s/g, '_')}_${dateStr.replace(/\//g, '-')}.xlsx`;
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
};