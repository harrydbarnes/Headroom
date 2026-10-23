import {expect, it} from 'vitest';
import {motion, releaseSheetDrag} from '../src/lib/presentation';
import {todayCopy} from '../src/strings/today';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

it('keeps the example guide directly above the Today hero, outside disclosures', () => {
  const source = ts.createSourceFile('Today.tsx', readFileSync('src/screens/Today.tsx', 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = (root: ts.Node, name: string) => {
    const matches: (ts.JsxElement | ts.JsxSelfClosingElement)[] = [];
    function visit(node: ts.Node) {
      if ((ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === name) ||
          (ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === name)) {
        matches.push(node as ts.JsxElement | ts.JsxSelfClosingElement);
      }
      ts.forEachChild(node, visit);
    }
    visit(root);
    return matches;
  };
  const overview = source.statements.find((node): node is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(node) && node.name?.text === 'TodayOverview');
  const details = source.statements.find((node): node is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(node) && node.name?.text === 'TodayDetails');
  expect(overview).toBeDefined(); expect(details).toBeDefined();
  expect(elements(source, 'ExampleGuide')).toHaveLength(1);
  const [guide] = elements(overview!, 'ExampleGuide');
  const [hero] = elements(overview!, 'TodayHero');
  expect(guide).toBeDefined(); expect(hero).toBeDefined();
  expect(ts.isJsxElement(guide.parent)).toBe(true);
  const page = guide.parent as ts.JsxElement;
  expect(page.openingElement.tagName.getText(source)).toBe('Page');
  expect(hero.parent).toBe(page);
  expect(guide.getStart(source)).toBeLessThan(hero.getStart(source));
  expect(elements(details!, 'ExampleGuide')).toHaveLength(0);
});

it('restores a dragged sheet even when the close request keeps it open for confirmation', () => {
  let offset = motion.sheet.dismissDistance + 20;
  const requests: number[] = [];
  releaseSheetDrag(offset, () => {offset = 0;}, () => {requests.push(offset);});
  // Cancelling the confirmation leaves visibility unchanged and the sheet settled.
  expect(offset).toBe(0);
  expect(requests).toEqual([0]);
});

it('settles a short drag without requesting dismissal', () => {
  let settled = false;
  let requested = false;
  releaseSheetDrag(motion.sheet.dismissDistance, () => {settled = true;}, () => {requested = true;});
  expect(settled).toBe(true);
  expect(requested).toBe(false);
});

it('names every outstanding check in the collapsed attention summary', () => {
  expect(todayCopy.attentionSummary(2, true, 1)).toBe('2 transactions to review · Bank permission expired · Setup checks incomplete');
  expect(todayCopy.attentionSummary(1, false, 0)).toBe('1 transaction to review');
  expect(todayCopy.attentionSummary(0, true, 0)).toBe('Bank permission expired');
  expect(todayCopy.attentionSummary(0, false, 0)).toBe('');
});
