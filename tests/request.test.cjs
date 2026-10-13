const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const root = resolve(__dirname, '..');
const sandbox = vm.createContext({});
vm.runInContext(readFileSync(resolve(root, 'dist/prompt-v0.4.js'), 'utf8'), sandbox);
vm.runInContext(readFileSync(resolve(root, 'dist/app.js'), 'utf8'), sandbox);
const { buildRequest } = sandbox.Mousou;
const template = sandbox.MOUSOU_PROMPT;
const marker = '（Webサイトで入力・選択された希望条件をここに挿入）';
const [prefix, suffix] = template.split(marker);

test('全未指定・空白だけでは発行しない', () => {
  assert.equal(buildRequest({}), '');
  assert.equal(buildRequest({ dream: ' \n\t　', world: '', basement: '' }), '');
});
test('自由記入だけで発行し、日本語長文・改行・空白・置換記号を保持', () => {
  const dream = '  森の図書館。\n\n地下に秘密の部屋。\n'.repeat(400) + '$& $` $\' <script>文字として保持</script>\n　';
  const result = buildRequest({ dream });
  assert.ok(result.includes(`理想の家・こだわり（自由記入）：\n${dream}\n\n`));
  assert.ok(!result.includes('世界観：'));
  assert.ok(!result.includes(marker));
});
test('選択のみで発行、地上階数と地下室を独立して保持、未指定を省略', () => {
  const result = buildRequest({ floors: '3階建て', basement: 'あり', location: '湖畔', world: '' });
  const customer = result.slice(prefix.length, -suffix.length);
  assert.ok(customer.includes('階数：3階建て'));
  assert.ok(customer.includes('地下室：あり'));
  assert.ok(customer.includes('立地・周辺環境：湖畔'));
  for (const omitted of ['世界観：', '建物の種類：', '広さ：', '自由記入）：', '指定なし']) {
    assert.ok(!customer.includes(omitted));
  }
});
test('地下室なしも有効な指定として扱う', () => {
  assert.ok(buildRequest({ basement: 'なし' }).includes('地下室：なし'));
});
test('自由記入優先を明示し、正式本文の前後すべてをそのまま保つ', () => {
  const result = buildRequest({ dream: '平屋', floors: '4階以上' });
  assert.ok(result.startsWith(prefix));
  assert.ok(result.endsWith(suffix));
  assert.ok(result.includes('自由記入と選択条件に矛盾がある場合は、自由記入の具体的な希望を優先してください。'));
  assert.equal((template.match(/^## \d+\./gm) || []).length, 10);
});
test('正式本文が欠けた場合は仮文面を生成しない', () => {
  assert.throws(() => buildRequest({ dream: '家' }, ''), /正式なプロンプト/);
});
test('選択条件を変更した場合、生成結果に旧条件を残さない', () => {
  const before = buildRequest({ location: '海辺' });
  const after = buildRequest({ location: '山・森' });
  assert.notEqual(before, after);
  assert.ok(after.includes('立地・周辺環境：山・森'));
  assert.ok(!after.includes('立地・周辺環境：海辺'));
});
