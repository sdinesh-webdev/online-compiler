const fs = require('fs');
let c = fs.readFileSync('src/components/Compiler.astro', 'utf8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$\{/g, '${');
c = c.replace(/<\\\\\/script>/g, '<\\/script>');
fs.writeFileSync('src/components/Compiler.astro', c);
console.log('Fixed file.');
