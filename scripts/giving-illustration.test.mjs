import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
import * as editions from '../lib/geography-editions.mjs';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const compiled=ts.transpileModule(read('components/GivingIllustration.tsx'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true,
});
assert.equal(compiled.diagnostics?.length,0);
const module={exports:{}},require=createRequire(import.meta.url);
vm.runInNewContext('(function(module,exports,require){'+compiled.outputText+'})')(
  module,module.exports,id=>id==='@/lib/geography-editions.mjs'?editions:require(id),
);
const render=index=>renderToStaticMarkup(React.createElement(module.exports.default,{index,label:'Original illustration'}));

test('generic city asset replaces the SF panel without sprite cropping or layout changes',async()=>{
  const html=render(0);
  assert.match(html,/src="[^"]*\/images\/givebetter-city.webp"/);
  assert.match(html,/alt="Illustration of a city neighborhood and park"/);
  assert.match(html,/width="200" height="200" style="width:200px"/);
  assert.doesNotMatch(html,/translateX|givebetter-principles.png|San Francisco Bay/);
  const metadata=await sharp(new URL('../public/images/givebetter-city.webp',import.meta.url).pathname).metadata();
  assert.equal(metadata.format,'webp');
  assert.equal(metadata.width,600);assert.equal(metadata.height,600);
  assert.ok(fs.statSync(new URL('../public/images/givebetter-city.webp',import.meta.url)).size<100000);
});
test('books and charity-choice panels retain their exact source and crop',()=>{
  for(const index of [1,2]){
    const html=render(index);
    assert.match(html,/\/images\/givebetter-principles.png/);
    assert.ok(html.includes(`translateX(-${index*100/3}%)`));
    assert.match(html,/width="600" height="200"/);
  }
});
test('all eight Top 4 pages share the same illustration component',()=>{
  const sf=read('app/san-francisco/page.tsx'),edition=read('components/EditionDonorHome.tsx');
  for(const source of [sf,edition])assert.match(source,/import GivingIllustration from '@\/components\/GivingIllustration'/);
  assert.match(sf,/<GivingIllustration index=\{0\}/);
  assert.match(edition,/<GivingIllustration index=\{i\}/);
  assert.doesNotMatch(sf,/Illustration of San Francisco Bay/);
});
