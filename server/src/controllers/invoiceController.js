const pool = require('../config/db');
const PDFDocument = require('pdfkit');

exports.getInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const [invoices] = await pool.query(
      `SELECT i.*, b.land_area, b.service_type_id, st.name AS service_name,
              d.name AS driver_name, f.name AS farmer_name,
              b.preferred_date, b.created_at AS booking_date
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN service_types st ON b.service_type_id = st.id
       JOIN drivers d ON b.driver_id = d.user_id
       JOIN farmers f ON b.farmer_id = f.user_id
       WHERE i.id = ?`,
      [invoiceId]
    );
    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const inv = invoices[0];

    // If PDF already generated, send it
    if (inv.invoice_pdf) {
      return res.download(inv.invoice_pdf);
    }

    // Generate PDF on the fly
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `invoice_${inv.invoice_number}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Invoice content
    doc.fontSize(20).text('KisanSeva', { align: 'center' });
    doc.fontSize(12).text('Agricultural Service Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Invoice No: ${inv.invoice_number}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Booking Date: ${new Date(inv.booking_date).toLocaleDateString()}`);
    doc.text(`Service Date: ${new Date(inv.preferred_date).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Parties', { underline: true });
    doc.fontSize(10);
    doc.text(`Farmer: ${inv.farmer_name}`);
    doc.text(`Driver: ${inv.driver_name}`);
    doc.moveDown();

    doc.fontSize(12).text('Service Details', { underline: true });
    doc.fontSize(10);
    doc.text(`Service: ${inv.service_name}`);
    doc.text(`Land Area: ${inv.land_area} acres`);
    doc.moveDown();

    doc.fontSize(12).text('Amount', { underline: true });
    doc.fontSize(10);
    doc.text(`Service Charge: Rs. ${inv.amount}`);
    doc.text(`Tax (18%): Rs. ${inv.tax_amount}`);
    doc.text(`Total: Rs. ${inv.total_amount}`);
    doc.moveDown();
    doc.text(`Payment Status: ${inv.payment_status.toUpperCase()}`);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Invoice generation failed', error: error.message });
  }
};

exports.listFarmerInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.query(
      `SELECT i.*, b.service_type_id, st.name AS service_name
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN service_types st ON b.service_type_id = st.id
       WHERE b.farmer_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: error.message });
  }
};