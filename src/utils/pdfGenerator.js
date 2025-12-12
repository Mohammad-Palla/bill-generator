import jsPDF from "jspdf";

// 80mm thermal printer width = 226.77 points (at 72 DPI)
const BILL_WIDTH = 226.77;
const MARGIN = 15; // Increased margin
const CONTENT_WIDTH = BILL_WIDTH - MARGIN * 2; // ~196.77pt available

export function generateBillPDF(billData, restaurant) {
  // Calculate approximate height needed
  const itemsHeight = billData.items.length * 20; // ~20pt per item
  const headerHeight = 140;
  const totalsHeight = 80;
  const footerHeight = 40;
  const estimatedHeight =
    headerHeight + itemsHeight + totalsHeight + footerHeight;

  const doc = new jsPDF({
    unit: "pt",
    format: [BILL_WIDTH, Math.max(estimatedHeight, 400)], // Dynamic height, minimum 400pt
    compress: true,
  });

  let yPos = MARGIN;

  // Helper function to add text with word wrap
  const addText = (
    text,
    x,
    y,
    maxWidth,
    fontSize = 10,
    align = "left",
    bold = false
  ) => {
    if (!text) return 0;
    doc.setFontSize(fontSize);
    if (bold) {
      doc.setFont(undefined, "bold");
    } else {
      doc.setFont(undefined, "normal");
    }

    const lines = doc.splitTextToSize(String(text), maxWidth);
    doc.text(lines, x, y, { align });
    return lines.length * (fontSize * 1.2);
  };

  // Helper function to add line
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, BILL_WIDTH - MARGIN, y);
  };

  // Header with proper spacing
  if (restaurant?.logo) {
    try {
      const logoHeight = 35; // Reduced logo size
      const logoWidth = 50; // Reduced logo width
      doc.addImage(
        restaurant.logo,
        "PNG",
        BILL_WIDTH / 2 - logoWidth / 2,
        yPos,
        logoWidth,
        logoHeight
      );
      yPos += logoHeight + 12; // Add spacing after logo
    } catch (e) {
      console.error("Error adding logo:", e);
    }
  }

  // Restaurant Name
  yPos += addText(
    restaurant?.name || "Restaurant Name",
    BILL_WIDTH / 2,
    yPos,
    CONTENT_WIDTH,
    12,
    "center",
    true
  );
  yPos += 8;

  // Address
  if (restaurant?.address) {
    yPos += addText(
      restaurant.address,
      BILL_WIDTH / 2,
      yPos,
      CONTENT_WIDTH,
      8,
      "center"
    );
    yPos += 6;
  }

  // Phone
  if (restaurant?.phone) {
    yPos += addText(
      restaurant.phone,
      BILL_WIDTH / 2,
      yPos,
      CONTENT_WIDTH,
      8,
      "center"
    );
    yPos += 10;
  }

  addLine(yPos);
  yPos += 12; // More space after line

  // Bill Info
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("en-IN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = currentDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  yPos += addText(
    `Date: ${dateStr} ${timeStr}`,
    MARGIN,
    yPos,
    CONTENT_WIDTH,
    8
  );
  yPos += 8;

  if (billData.billNumber) {
    yPos += addText(
      `Bill #: ${billData.billNumber}`,
      MARGIN,
      yPos,
      CONTENT_WIDTH,
      8
    );
    yPos += 8;
  }

  if (billData.tableNumber) {
    yPos += addText(
      `Table: ${billData.tableNumber}`,
      MARGIN,
      yPos,
      CONTENT_WIDTH,
      8
    );
    yPos += 12; // More space before items section
  }

  addLine(yPos);
  yPos += 12; // More space after line before items header

  // Items Header - with proper column widths that fit
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");

  // Column positions - all within CONTENT_WIDTH, leaving space for amounts
  const itemColStart = MARGIN;
  const itemColWidth = 60; // Further reduced item name column
  const qtyColStart = itemColStart + itemColWidth;
  const qtyColWidth = 15; // Reduced quantity column
  const rateColStart = qtyColStart + qtyColWidth;
  const rateColWidth = 25; // Rate column width
  // Ensure amount has at least 50pt space from rate column
  const minAmountSpace = 50;
  const amountColStart = rateColStart + rateColWidth;

  // Check if we have enough space, if not reduce item width
  let actualItemWidth = itemColWidth;
  let actualQtyStart = qtyColStart;
  let actualRateStart = rateColStart;

  if (amountColStart + minAmountSpace > BILL_WIDTH - MARGIN) {
    // Reduce item width to make room
    actualItemWidth =
      BILL_WIDTH - MARGIN - qtyColWidth - rateColWidth - minAmountSpace - 5;
    actualQtyStart = MARGIN + actualItemWidth;
    actualRateStart = actualQtyStart + qtyColWidth;
  }

  doc.text("Item", MARGIN, yPos);
  doc.text("Qty", actualQtyStart, yPos);
  doc.text("Rate", actualRateStart, yPos);
  // Amount header right-aligned within available space
  doc.text("Amount", BILL_WIDTH - MARGIN, yPos, { align: "right" });
  yPos += 12; // Space after header
  addLine(yPos);
  yPos += 10; // Space before first item

  // Items
  doc.setFont(undefined, "normal");
  doc.setFontSize(8);
  billData.items.forEach((item, index) => {
    const itemName = item.dishName || item.name || "Unknown Item";
    const qty = String(item.quantity || 0);
    const price = parseFloat(item.price || 0);
    const amount = price * (item.quantity || 0);

    // Item name - truncate if too long, ensure it fits
    const nameLines = doc.splitTextToSize(itemName, actualItemWidth - 3);
    const firstLine = nameLines[0];
    doc.text(firstLine, MARGIN, yPos);

    // Qty and Rate - use calculated positions to avoid overlap
    doc.text(qty, actualQtyStart, yPos);
    doc.text(`Rs.${price.toFixed(2)}`, actualRateStart, yPos);

    // Amount - right-aligned, ensuring it doesn't exceed right margin
    const amountText = `Rs.${amount.toFixed(2)}`;
    // Use right margin as the x position for right alignment
    doc.text(amountText, BILL_WIDTH - MARGIN, yPos, { align: "right" });

    // If name wraps, add additional lines below
    if (nameLines.length > 1) {
      yPos += 10;
      nameLines.slice(1).forEach((line) => {
        doc.text(line, MARGIN, yPos);
        yPos += 10;
      });
    } else {
      yPos += 10;
    }

    // Add spacing between items (except after last item)
    if (index < billData.items.length - 1) {
      yPos += 3; // Extra spacing between items
    }
  });

  yPos += 8; // Space before totals line
  addLine(yPos);
  yPos += 12; // Space after line before totals

  // Totals - ensure they fit within margins
  doc.setFontSize(8);
  const subtotal = billData.subtotal || 0;
  const cgst = billData.cgst || 0;
  const sgst = billData.sgst || 0;
  const total = billData.total || 0;

  // All totals right-aligned to the right margin
  doc.text(`Subtotal:`, MARGIN, yPos);
  doc.text(`Rs.${subtotal.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 10;

  doc.text(`CGST (${restaurant?.cgstRate || 2.5}%):`, MARGIN, yPos);
  doc.text(`Rs.${cgst.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 10;

  doc.text(`SGST (${restaurant?.sgstRate || 2.5}%):`, MARGIN, yPos);
  doc.text(`Rs.${sgst.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 12;

  addLine(yPos);
  yPos += 12; // Space after line before total

  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text(`Total:`, MARGIN, yPos);
  doc.text(`Rs.${total.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 15; // Space after total

  // GST Number
  if (restaurant?.gstNumber) {
    yPos += 5;
    doc.setFont(undefined, "normal");
    doc.setFontSize(7);
    yPos += addText(
      `GST Number: ${restaurant.gstNumber}`,
      BILL_WIDTH / 2,
      yPos,
      CONTENT_WIDTH,
      7,
      "center"
    );
    yPos += 10;
  }

  // Footer
  if (restaurant?.billFooter) {
    yPos += 5;
    doc.setFontSize(8);
    yPos += addText(
      restaurant.billFooter,
      BILL_WIDTH / 2,
      yPos,
      CONTENT_WIDTH,
      8,
      "center"
    );
  }

  // Set final page height dynamically
  const finalHeight = yPos + 20;
  if (finalHeight > doc.internal.pageSize.getHeight()) {
    doc.internal.pageSize.setHeight(finalHeight);
  }

  // Save PDF
  const fileName = `Bill-${billData.billNumber || Date.now()}.pdf`;
  doc.save(fileName);
}
