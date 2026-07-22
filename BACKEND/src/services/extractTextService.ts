import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");
import fs from "fs";
import axios from "axios";

export const estimateTextPageCount = (text: string): number => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 400));
};

export const extractText = async (fileInput: string | Buffer, mimeType: string): Promise<{ text: string; pageCount: number }> => {
    let buffer: Buffer;

    if (Buffer.isBuffer(fileInput)) {
        buffer = fileInput;
    } else if (fileInput.startsWith("http://") || fileInput.startsWith("https://")) {
        const response = await axios.get(fileInput, { responseType: "arraybuffer" });
        buffer = Buffer.from(response.data);
    } else {
        buffer = fs.readFileSync(fileInput);
    }

    const head4 = buffer.subarray(0, 4).toString("latin1");
    const isPdf = head4.startsWith("%PDF");
    const isZip = head4.startsWith("PK");
    const isOle = buffer.subarray(0, 4).toString("hex") === "d0cf11e0";

    let pageCount = 1;
    let text = "";

    if (mimeType === "application/pdf") {
        if (!isPdf) throw new Error("File is not a valid PDF.");
        const data = await pdfParse(buffer);
        text = data.text;
        pageCount = typeof data.numpages === "number" ? data.numpages : 1;
    } else if (
        mimeType === "application/msword" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        if (!isZip && !isOle) throw new Error("File is not a valid Word document.");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        pageCount = estimateTextPageCount(text);
    } else {
        throw new Error("This file is unsupported, please upload PDF/Word");
    }

    return { text, pageCount };
};
