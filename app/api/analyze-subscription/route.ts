import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // DÜZELTME BURADA: Model ismini en kararlı versiyonla değiştirdik.
    // "gemini-1.5-flash" şu an v1beta için en geçerli isimdir.
    // Eğer hata alırsan "gemini-pro-vision" kullanabilirsin ama Flash daha iyidir.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create the prompt
    const prompt = `Analyze this image. Identify if it's a subscription invoice, payment receipt, or loan/credit payment screen.

Extract the following information and return ONLY valid JSON (no markdown, no explanation):

{
  "name": "Service/Company name (string)",
  "amount": "Payment amount as number (without currency symbols)",
  "currency": "Currency code (TRY, USD, EUR, etc.)",
  "billing_cycle": "monthly or yearly",
  "payment_date": "Day of month for payment (1-31 as number)",
  "linked_card_details": "Last 4 digits of card if visible, format: 'Bank **** 1234'",
  "type": "subscription or loan",
  "total_installments": "If loan, total number of installments (null if subscription)",
  "paid_installments": "If loan, number of paid installments (null if subscription)",
  "color": "Brand color in hex format if identifiable (e.g., #E50914 for Netflix)"
}

Important:
- Return ONLY the JSON object, no other text
- Use null for fields that cannot be determined
- For payment_date, extract the day of month (1-31)
- Identify the brand/service name accurately
- For Turkish lira, use "TRY"`;

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    let jsonData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
    });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', details: error.message },
      { status: 500 }
    );
  }
}