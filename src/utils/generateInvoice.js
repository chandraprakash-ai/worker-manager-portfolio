import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (worker, transactions, balance) => {
  try {
    const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26); // Brand color
  doc.text('AMRUT FASHION', 15, 20);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('INDUSTRIAL TEXTILE MANUFACTURERS', 15, 25);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 150, 25);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(26, 26, 26);
  doc.line(15, 30, 195, 30);
  
  // Payee Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('PAYEE DETAILS', 15, 45);
  
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(worker.name, 15, 52);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Contact: ${worker.phone}`, 15, 58);
  doc.text(worker.address || 'No address provided', 15, 63);
  
  // Voucher Info
  const voucherId = Math.random().toString(36).substr(2, 9).toUpperCase();
  doc.text('VOUCHER ID', 150, 45);
  doc.setTextColor(26, 26, 26);
  doc.text(`#${voucherId}`, 150, 52);

  console.log('Generating PDF for:', worker.name);
  console.log('Transactions count:', transactions.length);

  // Separate and sort transactions
  const workTxs = transactions.filter(tx => tx.type === 'work').sort((a, b) => new Date(a.date) - new Date(b.date));
  const advanceTxs = transactions.filter(tx => tx.type === 'advance').sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalAmount = workTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalAdvance = advanceTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const tableRows = [
    ...workTxs.map(tx => [
      tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '-',
      tx.pieces || 0,
      `Rs.${(tx.rate || 0)}`,
      `Rs.${(tx.amount || 0).toLocaleString()}`,
      '-'
    ]),
    ...advanceTxs.map(tx => [
      tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : '-',
      '-',
      '-',
      '-',
      `Rs.${(tx.amount || 0).toLocaleString()}`
    ]),
    // Totals Row
    [
      { content: 'TOTALS', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
      { content: `Rs.${totalAmount.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
      { content: `Rs.${totalAdvance.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
    ]
  ];

  // Table
  autoTable(doc, {
    startY: 75,
    head: [['Date', 'Pcs', 'Rate', 'Amount', 'Advance']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [26, 26, 26], 
      fontSize: 8, 
      fontStyle: 'bold', 
      halign: 'center' 
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right', textColor: [200, 0, 0] }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  const finalY = (doc).lastAutoTable.finalY + 10;

  // Summary Card
  doc.setFillColor(245, 245, 245);
  doc.rect(110, finalY, 85, 45, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Amount (Work):', 115, finalY + 10);
  doc.setTextColor(26, 26, 26);
  doc.text(`Rs. ${totalAmount.toLocaleString()}`, 190, finalY + 10, { align: 'right' });
  
  doc.setTextColor(100, 100, 100);
  doc.text('Total Advances:', 115, finalY + 18);
  doc.setTextColor(200, 0, 0);
  doc.text(`- Rs. ${totalAdvance.toLocaleString()}`, 190, finalY + 18, { align: 'right' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(115, finalY + 23, 190, finalY + 23);
  
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.setFont(undefined, 'bold');
  doc.text('GRAND TOTAL:', 115, finalY + 32);
  doc.setFontSize(14);
  doc.text(`Rs. ${balance.toLocaleString()}`, 190, finalY + 32, { align: 'right' });
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 150, 0);
  doc.text('BALANCE SETTLED SUCCESSFULLY', 115, finalY + 40);

  // Signatures
  const sigY = finalY + 65;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, sigY, 70, sigY);
  doc.line(130, sigY, 185, sigY);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('RECIPIENT SIGNATURE', 15, sigY + 5);
  doc.text('AUTHORIZED SIGNATORY', 130, sigY + 5);

  // Footer
  doc.setFontSize(7);
  doc.text('Computer generated voucher. No physical stamp required.', 105, 285, { align: 'center' });

  // Save/Download
  doc.save(`Invoice_${worker.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Failed to generate PDF. Please check console for details.');
  }
};
