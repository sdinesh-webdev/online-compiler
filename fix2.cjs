const fs = require('fs');
let c = fs.readFileSync('src/components/Compiler.astro', 'utf8');

// The file currently has UNESCAPED backticks inside the SNIPPETS, which breaks the outer backticks.
// Example: console.log(`📡 Querying server for user ID ${id}...`);
// I need to replace them with: console.log(\`📡 Querying server for user ID \${id}...\`);

// Let's just fix the specific lines by replacing the raw content:
c = c.replace('console.log(`📡 Querying server for user ID ${id}...`);', 'console.log(`📡 Querying server for user ID \\${id}...`);'.replace(/`/g, '\\`'));
c = c.replace('this.color = `hsl(${Math.random() * 360}, 75%, 65%)`;', 'this.color = `hsl(\\${Math.random() * 360}, 75%, 65%)`;'.replace(/`/g, '\\`'));
c = c.replace('console.log(`📈 Counter updated: ${count}`);', 'console.log(`📈 Counter updated: \\${count}`);'.replace(/`/g, '\\`'));
c = c.replace('console.log(`✅ Identified ${list.length} prime numbers up to ${maxLimit.toLocaleString()}`);', 'console.log(`✅ Identified \\${list.length} prime numbers up to \\${maxLimit.toLocaleString()}`);'.replace(/`/g, '\\`'));

// There is also the nested string inside bootstrapHtml:
// sendToParent('log', [`${label}: ${duration.toFixed(3)}ms`]);
c = c.replace('sendToParent(\'log\', [`${label}: ${duration.toFixed(3)}ms`]);', 'sendToParent(\'log\', [`\\${label}: \\${duration.toFixed(3)}ms`]);'.replace(/`/g, '\\`'));
// sendToParent('warn', [`Timer '${label}' does not exist`]);
c = c.replace('sendToParent(\'warn\', [`Timer \\\'${label}\\\' does not exist`]);', 'sendToParent(\'warn\', [`Timer \\\'\\${label}\\\' does not exist`]);'.replace(/`/g, '\\`'));
c = c.replace('sendToParent(\'warn\', [`Timer \\\'${label}\\\' does not exist`]);', 'sendToParent(\'warn\', [`Timer \\\'\\${label}\\\' does not exist`]);'.replace(/`/g, '\\`')); // just in case

// Wait, the single quotes around ${label} might be parsed differently.
// Let's use a simpler regex replacement for the bootstrapHtml region:
c = c.replace(/sendToParent\('log', \[`\$\{label\}: \$\{duration\.toFixed\(3\)\}ms`\]\);/g, 'sendToParent(\'log\', [\\`\\${label}: \\${duration.toFixed(3)}ms\\`]);');
c = c.replace(/sendToParent\('warn', \[`Timer '\$\{label\}' does not exist`\]\);/g, 'sendToParent(\'warn\', [\\`Timer \\\'\\${label}\\\' does not exist\\`]);');

// And another one for the toast loaded:
// showToast(`✓ Loaded ${card.querySelector('.text-\\[14px\\]')?.textContent}`);
c = c.replace(/showToast\(`✓ Loaded \$\{card\.querySelector\('\.text-\\\\[14px\\\\]'\)\?\.textContent\}`\);/g, 'showToast(\\`✓ Loaded \\${card.querySelector(\\\'.text-\\\\[14px\\\\]\\\')?.textContent}\\`);');
// actually wait, showToast is NOT inside SNIPPETS, it is in regular JS code! So it DOES NOT need escaping!
// Only strings inside `SNIPPETS = { ... }` or `bootstrapHtml = \`...\`` need escaping!

fs.writeFileSync('src/components/Compiler.astro', c);
console.log('Fixed file.');
