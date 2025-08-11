import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, query } = await request.json();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASSWORD, // your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'limchewyew@gmail.com',
      subject: `New Analytics Query from ${name}`,
      html: `
        <h2>New Query Submitted</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Query:</strong></p>
        <p>${query}</p>
        <p>---</p>
        <p>This is an automated message from your Analytics Dashboard.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Query submitted successfully' });
  } catch (error) {
    console.error('Error submitting query:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit query' },
      { status: 500 }
    );
  }
}
