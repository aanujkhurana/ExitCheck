
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function uploadToS3(filePath, key){
  const fileContent = fs.readFileSync(filePath);
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: fileContent, ACL: 'public-read' };
  const data = await s3.upload(params).promise();
  return data.Location;
}

async function generatePdf(report){
  // render html
  const template = fs.readFileSync(path.join(__dirname,'../pdf','template.html'),'utf8');
  const html = template.replace('{{REPORT_JSON}}', JSON.stringify(report));
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = path.join('/tmp',`report-${Date.now()}.pdf`);
  await page.pdf({ path: outPath, format: 'A4', printBackground: true });
  await browser.close();
  // upload to s3
  const key = `pdfs/report-${Date.now()}.pdf`;
  const url = await uploadToS3(outPath, key);
  return url;
}

async function sendEmailWithAttachment(to, pdfUrl){
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Exit Condition Report',
    text: 'Please find attached the report',
    html: `<p>Report is attached</p><a href="${pdfUrl}">Download PDF</a>`
  });
}

module.exports = { uploadToS3, generatePdf, sendEmailWithAttachment };
