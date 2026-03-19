const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split(/\r?\n/);

let inCodeBlock = false;

lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
    }

    if (!inCodeBlock) {
        const noJapanese = /^[^ぁ-んァ-ン一-龥ｱ-ﾝ]+$/.test(line);
        const hasHtmlTag = /<[^>]+>/.test(line);
        const hasAlert = /> \[![a-zA-Z]+\]/.test(line);
        const isList = /^\s*[-.+]/.test(line);
        const isHeader = /^#+/.test(line);
        const isOnlyLink = /^\s*\[[^\]]+\]\([^)]+\)\s*$/.test(line);

        if (noJapanese && !hasHtmlTag && !hasAlert && !isList && !isHeader && !isOnlyLink) {
            console.log(`${filePath}:${index + 1}:1: 日本語を含まない行`);
        }
    }
});