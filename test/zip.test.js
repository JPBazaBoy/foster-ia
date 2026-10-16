import test from 'node:test';
import assert from 'node:assert/strict';
import {createZip} from '../generator/zip.js';
import {readZip} from './helpers.js';

test('o ZIP leva pastas explícitas, nomes UTF-8 e o conteúdo intacto', () => {
  const text = 'Instruções com acentuação: ação, opção, café.\n'.repeat(40);
  const zip = createZip([{name: 'minha-skill/SKILL.md', data: text}, {name: 'minha-skill/referencias/exemplo-ção.md', data: 'curto'}]);
  const entries = readZip(zip);
  assert.deepEqual(entries.map(entry => entry.name), ['minha-skill/', 'minha-skill/referencias/', 'minha-skill/SKILL.md', 'minha-skill/referencias/exemplo-ção.md']);
  assert.equal(entries[2].data.toString('utf8'), text);
  assert.equal(entries[2].method, 8, 'texto repetido é comprimido');
  assert.equal(entries[3].method, 0, 'arquivo pequeno fica sem compressão quando ela não ajuda');
  assert.ok(entries.every(entry => entry.flags & 0x0800), 'nomes marcados como UTF-8');
});

test('o ZIP é reproduzível: mesma entrada e mesma data geram os mesmos bytes', () => {
  const files = [{name: 'a/SKILL.md', data: 'x'}, {name: 'a/b.md', data: 'y'}];
  const date = new Date('2026-10-16T12:00:00Z');
  assert.deepEqual(createZip(files, {date}), createZip([...files].reverse(), {date}));
});
