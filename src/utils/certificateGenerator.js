import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Helper function to fetch an asset and convert it to an ArrayBuffer.
async function fetchAsset(url) {
    console.log("Fetching asset from URL:", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log("Asset fetched successfully.");
        return arrayBuffer;
    } catch (e) {
        console.error("Error fetching asset:", e);
        throw e;
    }
}


export async function createPdfCertificate(studentName, date) {
    console.log("Starting PDF certificate generation for:", studentName, "Date:", date);
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
        const { width, height } = page.getSize();

        // --- Font Embedding ---
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // --- Page Styling ---
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
        page.drawRectangle({
            x: 20, y: 20,
            width: width - 40, height: height - 40,
            borderColor: rgb(0.27, 0.51, 0.71),
            borderWidth: 3,
        });

        // --- Logo ---
        // NOTE: This URL was for a signature, using a proper logo URL now.
        const logoUrl = "https://raw.githubusercontent.com/Moleboge98/Moleboge98/main/Call%20for%20Application%20for%20the%20Data%20Analytics%20(17).png";
        let logoImageHeight = 0;
        const logoTopMargin = 40;

        try {
            const logoBytes = await fetchAsset(logoUrl);
            const logoImage = await pdfDoc.embedPng(logoBytes);
            const desiredLogoWidth = 200;
            const scale = desiredLogoWidth / logoImage.width;
            logoImageHeight = logoImage.height * scale;

            page.drawImage(logoImage, {
                x: (width - desiredLogoWidth) / 2,
                y: height - logoTopMargin - logoImageHeight,
                width: desiredLogoWidth,
                height: logoImageHeight,
            });
        } catch (e) {
            console.error("Could not load or embed logo image.", e);
            page.drawText('Logo Load Error', {
                x: (width - 100) / 2,
                y: height - logoTopMargin - 20,
                size: 12, font: helveticaFont, color: rgb(0.8, 0.2, 0.2)
            });
            logoImageHeight = 30;
        }

        let currentY = height - logoTopMargin - logoImageHeight - 60;

        // Title
        const titleText = 'Certificate of Completion';
        page.drawText(titleText, {
            x: width / 2 - helveticaBoldFont.widthOfTextAtSize(titleText, 30) / 2,
            y: currentY,
            size: 30, font: helveticaBoldFont, color: rgb(0.1, 0.2, 0.45)
        });
        currentY -= 55;

        // Certifies line
        const certifiesText = 'This certifies that';
        page.drawText(certifiesText, {
            x: width / 2 - helveticaFont.widthOfTextAtSize(certifiesText, 16) / 2,
            y: currentY,
            size: 16, font: helveticaFont, color: rgb(0.2, 0.2, 0.2)
        });
        currentY -= 60;

        // Student Name
        page.drawText(studentName, {
            x: width / 2 - timesRomanFont.widthOfTextAtSize(studentName, 36) / 2,
            y: currentY,
            size: 36, font: timesRomanFont, color: rgb(0, 0, 0)
        });
        currentY -= 50;

        // Course Name
        const courseTextLine1 = "has successfully completed the";
        const courseTextLine2 = "BRICS Astronomy & IDIA Data Analytics Training Course";
        page.drawText(courseTextLine1, {
            x: width / 2 - helveticaFont.widthOfTextAtSize(courseTextLine1, 18) / 2,
            y: currentY,
            size: 18, font: helveticaFont, color: rgb(0.2, 0.2, 0.2)
        });
        currentY -= 26;
        page.drawText(courseTextLine2, {
            x: width / 2 - helveticaBoldFont.widthOfTextAtSize(courseTextLine2, 18) / 2,
            y: currentY,
            size: 18, font: helveticaBoldFont, color: rgb(0.1, 0.2, 0.45)
        });
        currentY -= 70;

        // Date
        const dateText = `Date of Completion: ${date}`;
        page.drawText(dateText, {
            x: width / 2 - helveticaFont.widthOfTextAtSize(dateText, 14) / 2,
            y: currentY,
            size: 14, font: helveticaFont, color: rgb(0.33, 0.33, 0.33)
        });
        currentY -= 20; // Move down for the signature block

        // --- SIGNATURE BLOCK ---
        const signatureBlockX = width / 2;

        // 1. Signature Image
        // CORRECTED: Using a valid PNG URL for the signature.
        const signatureImageUrl = 'https://raw.githubusercontent.com/Moleboge98/Moleboge98/main/Duduzile%20signature.png';
        let signatureImageHeight = 0;
        try {
            const signatureImageBytes = await fetchAsset(signatureImageUrl);
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const signatureWidth = 100;
            const scale = signatureWidth / signatureImage.width;
            signatureImageHeight = signatureImage.height * scale;
            
            page.drawImage(signatureImage, {
                x: signatureBlockX - signatureWidth / 2,
                y: 90,
                width: signatureWidth,
                height: signatureImageHeight
            });
        } catch (e) {
            console.error("Failed to load or embed signature image.", e);
            page.drawText('Signature unavailable', {
                x: signatureBlockX - 60, y: currentY,
                size: 12, font: helveticaFont, color: rgb(0.8, 0.2, 0.2)
            });
            signatureImageHeight = 20; // fallback height
        }

        currentY -= signatureImageHeight; // Move Y position below the signature image

        // 2. Signature Line
        const signatureLineY = currentY;
        page.drawLine({
            start: { x: signatureBlockX - 110, y: signatureLineY },
            end: { x: signatureBlockX + 110, y: signatureLineY },
            thickness: 1.5,
            color: rgb(0.1, 0.1, 0.1)
        });

        currentY -= 15; // Move down for the printed name

        // 3. Printed Name & Title
        const printedNameText = "Duduzile Kubheka";
        page.drawText(printedNameText, {
            x: signatureBlockX - helveticaFont.widthOfTextAtSize(printedNameText, 12) / 2,
            y: currentY,
            size: 12, font: helveticaFont, color: rgb(0.2, 0.2, 0.2)
        });
        currentY -= 12;

        const titleCoordinatorText = "BRICS Astronomy Project Coordinator";
        page.drawText(titleCoordinatorText, {
            x: signatureBlockX - helveticaFont.widthOfTextAtSize(titleCoordinatorText, 11) / 2,
            y: currentY,
            size: 11, font: helveticaFont, color: rgb(0.3, 0.3, 0.3)
        });

        console.log("PDF content drawn. Saving PDF...");
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;

    } catch (e) {
        console.error("Critical error in createPdfCertificate function:", e);
        throw new Error(`Failed to generate certificate: ${e.message}.`);
    }
}

/**
 * Triggers a browser download for the generated PDF bytes.
 * CORRECTED: Changed from "export const" to "export function" for better compatibility.
 * @param {Uint8Array} pdfBytes The raw bytes of the PDF file.
 * @param {string} filename The desired filename for the downloaded file.
 */
export function downloadPdf(pdfBytes, filename) {
    try {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        console.log("PDF download triggered for:", filename);
    } catch (e) {
        console.error("Error in downloadPdf:", e);
        throw new Error(`Failed to trigger PDF download: ${e.message}`);
    }
};
