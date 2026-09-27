import fs from 'node:fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const env = {};
fs.readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const geminiKey = (env.GEMINI_API_KEYS || '').split(',')[0].trim().replace(/^['"]+|['"]+$/g, '');
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

const imgBuffer = fs.readFileSync('../mobile/assets/icon.png');
const part = {
  inlineData: {
    data: imgBuffer.toString('base64'),
    mimeType: 'image/png'
  }
};

async function test() {
  console.log('Testing image analysis with gemini-3.8-flash...');
  const res = await model.generateContent([
    'You are a fridge food ingredient detector. Return a JSON array of ingredients: [{"name":"Eggs","quantity":1,"unit":"pcs"}].',
    part
  ]);
  console.log('Result:', (await res.response).text());
}
test();
