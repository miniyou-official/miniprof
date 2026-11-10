// Run with: node --test --experimental-default-type=module tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanLink, cleanLabel, sanitizeLinkList, openableHref } from '../src/lib/linkSafety.js';

const ok = (raw, platform = 'custom') => assert.equal(cleanLink(raw, platform).ok, true, `should allow: ${raw}`);
const no = (raw, platform = 'custom') => assert.equal(cleanLink(raw, platform).ok, false, `should refuse: ${raw}`);

test('normal profile and website links are accepted', () => {
  ok('https://instagram.com/mdayaan', 'instagram');
  ok('instagram.com/mdayaan', 'instagram');
  ok('https://www.linkedin.com/in/some-person-123/', 'linkedin');
  ok('https://youtu.be/dQw4w9WgXcQ', 'youtube');
  ok('https://x.com/someone', 'twitter');
  ok('https://t.me/someone', 'telegram');
  ok('https://my-portfolio.vercel.app/work?tab=projects', 'custom');
  ok('https://example.com/path/with-dashes_and_underscores?id=42#top');
  ok('https://example.com:443/ok');
});

test('dangerous schemes are refused', () => {
  for (const s of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', 'file:///etc/passwd', 'vbscript:x', 'mailto:a@b.com', 'ftp://example.com/x', 'http://example.com', 'blob:https://example.com/x']) no(s);
});

test('another site pretending to be an app is refused', () => {
  no('https://instagram.com.evil.com/x', 'instagram');
  no('https://evilinstagram.com/x', 'instagram');
  no('https://instagram.com@evil.com/x', 'instagram');
  no('https://evil.com/instagram.com', 'instagram');
  no('https://github.com/x', 'instagram');
  no('https://user:pass@example.com/');
});

test('cloudflare tunnels, serverless hosts and gateways are refused', () => {
  for (const h of ['abc-def.trycloudflare.com', 'x.workers.dev', 'x.pages.dev', 'pub-123.r2.dev', 'cloudflare-ipfs.com', 'team.cloudflareaccess.com', 'a.ngrok-free.app', 'a.ngrok.io', 'a.loca.lt', 'ipfs.io']) no(`https://${h}/page`);
  no('https://example.com/cdn-cgi/l/email-protection');
  no('https://example.com/cdn-cgi/challenge-platform/x');
});

test('short links and look-alike domains are refused on websites', () => {
  for (const h of ['bit.ly/abc', 'tinyurl.com/x', 't.co/abc', 'rebrand.ly/x', 'goo.gl/x']) no(`https://${h}`);
  no('https://xn--pple-43d.com/');
  no('https://аpple.com/');
});

test('IP addresses, local and odd hosts are refused', () => {
  for (const h of ['127.0.0.1', '10.0.0.5', '192.168.1.1', '169.254.169.254', '2130706433', '0x7f000001', '0177.0.0.1', '[::1]', 'localhost', 'router.local', 'intranet.internal', 'files.zip', 'example.com.', 'exa_mple.com', '-bad.com', 'a..com']) no(`https://${h}/x`);
  no('https://example.com:8080/x');
  no('https://example.com:22/x');
});

test('quotes, tags, backticks, braces, spaces and invisible characters are refused', () => {
  for (const s of ['https://example.com/<script>', 'https://example.com/"x', "https://example.com/'x", 'https://example.com/`x', 'https://example.com/{x}', 'https://example.com/a b', 'https://example.com/a\nb', 'https://example.com/a​b', 'https://example.com/‮evil', 'https://example.com/a\\b', 'https://example.com/a|b', 'https://example.com/a^b', 'https://example.com/\u0000']) no(s);
});

test('sql and script text, even when encoded, is refused', () => {
  for (const s of [
    "https://example.com/?q=1' OR '1'='1", 'https://example.com/?q=1%27%20OR%20%271%27=%271', 'https://example.com/?id=1;DROP TABLE users',
    'https://example.com/?id=1%3BDROP%20TABLE%20users', 'https://example.com/?q=UNION%20SELECT%20password%20FROM%20users', 'https://example.com/?q=union+select+1,2',
    'https://example.com/?q=1+or+1=1', 'https://example.com/?x=--%20', 'https://example.com/?x=/*', 'https://example.com/?q=%3Cscript%3Ealert(1)%3C/script%3E',
    'https://example.com/?q=%253Cscript%253E', 'https://example.com/?onerror=alert(1)', 'https://example.com/?x=javascript:alert(1)', 'https://example.com/?x=%6Aavascript:alert(1)',
    'https://example.com/?q=pg_sleep(5)', 'https://example.com/?q=%00', 'https://example.com/?q=%zz', 'https://example.com/?q=&#x3C;',
  ]) no(s);
});

test('links that redirect somewhere else are refused', () => {
  no('https://example.com/go?url=https://evil.com');
  no('https://example.com/go?next=//evil.com');
  no('https://example.com/go?u=https%3A%2F%2Fevil.com');
  no('https://www.youtube.com/redirect?q=https%3A%2F%2Fevil.com', 'youtube');
});

test('ordinary words that look like attacks stay allowed', () => {
  ok('https://example.com/?online=1&one=2&only=3');
  ok('https://example.com/european-union-select-committee');
  ok('https://example.com/my--post');
});

test('very long links are refused', () => {
  no(`https://example.com/${'a'.repeat(500)}`);
});

test('labels are cleaned', () => {
  assert.equal(cleanLabel('  <b>My</b>   site‮  '), 'bMy/b site'); // angle brackets and invisible characters dropped, spacing tidied
  assert.equal(cleanLabel(''), 'Link');
  assert.equal(cleanLabel('x'.repeat(100)).length, 40);
  assert.equal(cleanLabel(123, 'Fallback'), 'Fallback');
});

test('a whole list is cleaned or refused', () => {
  const good = sanitizeLinkList([{ platform: 'instagram', url: 'instagram.com/a', label: 'Insta', evil: 'x', clickAction: 'pwn' }]);
  assert.equal(good.ok, true);
  assert.deepEqual(Object.keys(good.links[0]).sort(), ['clickAction', 'label', 'platform', 'url']);
  assert.equal(good.links[0].clickAction, 'direct');
  assert.equal(sanitizeLinkList([{ platform: 'instagram', url: 'https://evil.com' }]).ok, false);
  assert.equal(sanitizeLinkList('nope').ok, false);
  assert.equal(sanitizeLinkList(Array.from({ length: 31 }, () => ({ platform: 'custom', url: 'https://example.com/' }))).ok, false);
});

test('opening a stored link applies the same rules', () => {
  assert.equal(openableHref('javascript:alert(1)'), null);
  assert.equal(openableHref('https://a.trycloudflare.com/'), null);
  assert.equal(openableHref('mailto:a@example.com'), 'mailto:a@example.com');
  assert.equal(openableHref('mailto:a@example.com?subject=<x>'), null);
  assert.equal(openableHref('tel:+911234567890'), 'tel:+911234567890');
  assert.ok(openableHref('https://example.com/a'));
});

test('a link to only the front page of an app is refused', () => {
    assert.equal(cleanLink('https://instagram.com/', 'instagram').ok, false);
    assert.equal(cleanLink('instagram.com', 'instagram').ok, false);
    assert.equal(cleanLink('https://instagram.com/yourname', 'instagram').ok, true);
});
