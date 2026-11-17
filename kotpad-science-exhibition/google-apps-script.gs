/**
 * Google Apps Script for:
 * Block Level Science Exhibition & RRA Exhibition, Kotpad (2026)
 *
 * Setup steps:
 * 1. Open Google Sheets (https://sheets.google.com) and create a new spreadsheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any code in Code.gs and paste this entire file.
 * 4. Click Save, then click Deploy -> New deployment -> Web app.
 * 5. Execute as: "Me" | Who has access: "Anyone".
 * 6. Click Deploy, authorize access, and copy the Web App URL.
 * 7. Paste that URL into `const GOOGLE_SCRIPT_URL = 'YOUR_URL_HERE';` inside index.html.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];

    // Add headers automatically on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Server Timestamp',
        'Ref ID',
        'UDISE Code',
        'School Name',
        'Cluster',
        'GP / NAC',
        'Guide Teacher',
        'Mobile',
        'Email',
        'Theme',
        'Project Title',
        'Project Summary',
        'Student 1 Name',
        'Student 1 Class',
        'Student 1 Gender',
        'Student 1 Photo URL',
        'Student 2 Name',
        'Student 2 Class',
        'Student 2 Gender',
        'Student 2 Photo URL'
      ]);
      sheet.getRange(1, 1, 1, 20).setFontWeight('bold');
    }

    const s1PhotoUrl = saveOptionalPhotoToDrive_(data.s1PhotoData, `${data.udiseCode}_S1_${data.ref}`);
    const s2PhotoUrl = saveOptionalPhotoToDrive_(data.s2PhotoData, `${data.udiseCode}_S2_${data.ref}`);

    sheet.appendRow([
      new Date(),
      data.ref || '',
      "'" + (data.udiseCode || ''), // Leading apostrophe preserves 11-digit UDISE as text
      data.schoolName || '',
      data.cluster || '',
      data.gp || '',
      data.teacherName || '',
      data.teacherPhone || '',
      data.teacherEmail || '',
      data.theme || '',
      data.projectTitle || '',
      data.projectSummary || '',
      data.s1Name || '',
      data.s1Class || '',
      data.s1Gender || '',
      s1PhotoUrl,
      data.s2Name || '',
      data.s2Class || '',
      data.s2Gender || '',
      s2PhotoUrl
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', ref: data.ref }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveOptionalPhotoToDrive_(dataUrl, fileBaseName) {
  if (!dataUrl || dataUrl.indexOf('data:') !== 0) {
    return 'Not Uploaded';
  }
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return 'Not Uploaded';

  const mimeType = match[1];
  const base64Data = match[2];
  const ext = mimeType.split('/')[1] || 'jpg';
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType, `${fileBaseName}.${ext}`);

  const folderName = 'Kotpad_Science_RRA_2026_Photos';
  const folders = DriveApp.getFoldersByName(folderName);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  const file = folder.createFile(blob);
  return file.getUrl();
}
