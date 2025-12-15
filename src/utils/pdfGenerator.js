import jsPDF from "jspdf";

// 80mm thermal printer width = 226.77 points (at 72 DPI)
const BILL_WIDTH = 226.77;
const MARGIN = 15;
const CONTENT_WIDTH = BILL_WIDTH - MARGIN * 2; // ~196.77pt available

export function generateBillPDF(billData, restaurant) {
  // Calculate approximate height needed
  const itemsHeight = billData.items.length * 20;
  const headerHeight = 140;
  const totalsHeight = 80;
  const footerHeight = 40;
  const estimatedHeight =
    headerHeight + itemsHeight + totalsHeight + footerHeight;

  const doc = new jsPDF({
    unit: "pt",
    format: [BILL_WIDTH, Math.max(estimatedHeight, 400)],
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
      const logoHeight = 35;
      const logoWidth = 50;
      doc.addImage(
        restaurant.logo,
        "PNG",
        BILL_WIDTH / 2 - logoWidth / 2,
        yPos,
        logoWidth,
        logoHeight
      );
      yPos += logoHeight + 12;
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
      "center",
      true
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

  // Date and Time - Centered (as per image format)
  if (billData.date || billData.time) {
    const dateTimeStr = `${billData.date || ""} ${billData.time || ""}`.trim();
    if (dateTimeStr) {
      yPos += addText(
        dateTimeStr,
        BILL_WIDTH / 2,
        yPos,
        CONTENT_WIDTH,
        8,
        "center"
      );
      yPos += 10;
    }
  }

  // Table Number, Bill Number, Waiter Name - All on same line, aligned with columns
  // Calculate column positions first (same as items)
  // Use equal spacing: Item column (left), Quantity column (center), Price column (right)
  const itemColStart = MARGIN;
  const availableWidth = BILL_WIDTH - MARGIN * 2; // Total available width
  const columnWidth = availableWidth / 3; // Equal width for each column
  const itemColWidth = columnWidth;
  const qtyColStart = itemColStart + itemColWidth;
  const rightMargin = BILL_WIDTH - MARGIN; // Right edge for alignment

  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.setFont;
  // Table, Bill #, Waiter on same line - aligned with columns
  if (billData.tableNumber || billData.billNumber || billData.waiterName) {
    // Table number in first column (left, like Dish)
    if (billData.tableNumber) {
      doc.text(`Table ${billData.tableNumber}`, itemColStart, yPos);
    }
    // Bill number in second column (center, like Quantity)
    if (billData.billNumber) {
      doc.text(billData.billNumber, qtyColStart, yPos);
    }
    // Waiter name in third column (right-aligned, like Price)
    if (billData.waiterName) {
      doc.text(billData.waiterName, rightMargin, yPos, { align: "right" });
    }
    yPos += 12;
  }

  // Service Type - **** DINE IN **** or **** TAKE AWAY ****
  if (billData.serviceType) {
    yPos += addText(
      `**** ${billData.serviceType} ****`,
      BILL_WIDTH / 2,
      yPos + 2,
      CONTENT_WIDTH,
      8,
      "center",
      true
    );
    yPos += 12;
  }

  addLine(yPos);
  yPos += 12;

  // Items Header - Dish, Quantity, Price (as per image)
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");

  doc.text("Dish", itemColStart, yPos);
  doc.text("Quantity", qtyColStart, yPos);
  // Price header right-aligned at right margin
  doc.text("Price", rightMargin, yPos, { align: "right" });
  yPos += 12;

  // Items
  doc.setFont(undefined, "normal");
  doc.setFontSize(8);
  billData.items.forEach((item, index) => {
    const itemName = item.dishName || item.name || "Unknown Item";
    const qty = String(item.quantity || 0);
    const price = parseFloat(item.price || 0);

    // Item name - truncate if too long, ensure it fits
    const nameLines = doc.splitTextToSize(itemName, itemColWidth - 3);
    const firstLine = nameLines[0];
    doc.text(firstLine, itemColStart, yPos);

    // Quantity in center column
    doc.text(qty, qtyColStart, yPos);
    // Price right-aligned at right margin (like Price header)
    const priceText = `Rs.${price.toFixed(2)}`;
    doc.text(priceText, rightMargin, yPos, { align: "right" });

    // If name wraps, add additional lines below
    if (nameLines.length > 1) {
      yPos += 10;
      nameLines.slice(1).forEach((line) => {
        doc.text(line, itemColStart, yPos);
        yPos += 10;
      });
    } else {
      yPos += 10;
    }

    // Add spacing between items (except after last item)
    if (index < billData.items.length - 1) {
      yPos += 3;
    }
  });

  yPos += 8;
  addLine(yPos);
  yPos += 12;

  // Totals - Match image format: Amount, SGST, CGST, Total Amount
  doc.setFontSize(8);
  const subtotal = billData.subtotal || 0;
  const cgst = billData.cgst || 0;
  const sgst = billData.sgst || 0;
  const total = billData.total || 0;

  // Amount (Subtotal)
  doc.text(`Amount:`, MARGIN, yPos);
  doc.text(`Rs.${subtotal.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 10;

  // SGST
  doc.text(`SGST (${restaurant?.sgstRate || 2.5}%):`, MARGIN, yPos);
  doc.text(`Rs.${sgst.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 10;

  // CGST
  doc.text(`CGST (${restaurant?.cgstRate || 2.5}%):`, MARGIN, yPos);
  doc.text(`Rs.${cgst.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 12;

  addLine(yPos);
  yPos += 12;

  // Total Amount
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  doc.text(`Total Amount:`, MARGIN, yPos);
  doc.text(`Rs.${total.toFixed(2)}`, BILL_WIDTH - MARGIN, yPos, {
    align: "right",
  });
  yPos += 15;

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
      "center",
      true
    );
    yPos += 8;
  }

  // SAC CODE
  if (restaurant?.sacCode) {
    doc.setFont(undefined, "normal");
    doc.setFontSize(7);
    yPos += addText(
      `SAC CODE: ${restaurant.sacCode}`,
      BILL_WIDTH / 2,
      yPos,
      CONTENT_WIDTH,
      7,
      "center",
      true
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
      "center",
      true
    );
  }

  // Set final page height dynamically
  const finalHeight = yPos + 8;
  if (finalHeight > doc.internal.pageSize.getHeight()) {
    doc.internal.pageSize.setHeight(finalHeight);
  }

  // Save PDF
  const fileName = `Bill-${billData.billNumber || Date.now()}.pdf`;
  doc.save(fileName);
}
