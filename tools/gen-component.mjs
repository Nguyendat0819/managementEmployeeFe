// Sinh component bằng Angular CLI rồi tự tạo barrel index.ts cạnh nó.
// Dùng: npm run gen:component -- features/foo/components/bar
import { execSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Thiếu path. Vd: npm run gen:component -- features/foo/components/bar');
  process.exit(1);
}

// 1) Sinh component (Angular 19 mặc định standalone)
execSync(`npx ng generate component ${target} --skip-tests`, { stdio: 'inherit' });

// 2) Tạo barrel index.ts cạnh component để import ngắn gọn qua alias @features/*
const name = basename(target);
const dir = join('src', 'app', target);
const indexPath = join(dir, 'index.ts');
if (existsSync(indexPath)) {
  console.log(`• index.ts đã tồn tại: ${indexPath}`);
} else {
  writeFileSync(indexPath, `export * from './${name}.component';\n`);
  console.log(`✓ Đã tạo ${indexPath}`);
}
