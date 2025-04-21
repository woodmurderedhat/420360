// test-framework.js
// Minimal vanilla JS test framework for browser

const tests = [];
let currentGroup = null;
let beforeEachFn = null;
let afterEachFn = null;
let htmlReport = [];

export function test(name, fn) {
  tests.push({ name, fn, group: currentGroup });
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

export function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Expected ${a} === ${b}`);
}

export function assertThrows(fn, message) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; }
  if (!threw) throw new Error(message || 'Expected function to throw');
}

export function assertAria(el, attr, expected, message) {
  const val = el.getAttribute(attr);
  if (val !== expected) throw new Error(message || `Expected [${attr}]="${expected}", got "${val}"`);
}

export function assertTabIndex(el, expected, message) {
  const val = el.getAttribute('tabindex');
  if (String(val) !== String(expected)) throw new Error(message || `Expected tabindex="${expected}", got "${val}"`);
}

export function assertFocus(el, message) {
  if (document.activeElement !== el) throw new Error(message || 'Element is not focused');
}

export function beforeEach(fn) {
  beforeEachFn = fn;
}

export function afterEach(fn) {
  afterEachFn = fn;
}

export function describe(group, fn) {
  const prevGroup = currentGroup;
  currentGroup = group;
  fn();
  currentGroup = prevGroup;
}

export async function runTests() {
  let passed = 0, failed = 0;
  htmlReport = [];
  for (const t of tests) {
    if (beforeEachFn) try { await beforeEachFn(); } catch {}
    try {
      // Support async tests: if fn returns a Promise, await it
      const result = t.fn();
      if (result && typeof result.then === 'function') {
        await result;
      }
      console.log(`%c✔ ${t.group ? t.group + ': ' : ''}${t.name}`, 'color:green');
      htmlReport.push(`<div style='color:green'>✔ ${t.group ? t.group + ': ' : ''}${t.name}</div>`);
      passed++;
    } catch (e) {
      console.error(`%c✖ ${t.group ? t.group + ': ' : ''}${t.name}\n   ${e.message}`, 'color:red');
      htmlReport.push(`<div style='color:red'>✖ ${t.group ? t.group + ': ' : ''}${t.name}<br><span style='margin-left:2em'>${e.message}</span></div>`);
      failed++;
    }
    if (afterEachFn) try { await afterEachFn(); } catch {}
  }
  const summary = `Test results: ${passed} passed, ${failed} failed.`;
  console.log(`%c${summary}`, failed ? 'color:red' : 'color:green');
  htmlReport.push(`<div style='font-weight:bold; color:${failed ? 'red' : 'green'};margin-top:1em'>${summary}</div>`);
  if (typeof document !== 'undefined') {
    const div = document.getElementById('test-results');
    if (div) div.innerHTML = htmlReport.join('');
  }
}

// For browser: auto-run if window.runTests is called
if (typeof window !== 'undefined') {
  window.runTests = runTests;
}
