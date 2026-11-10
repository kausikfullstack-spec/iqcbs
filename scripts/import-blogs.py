"""Refresh the static blog pages from IQCBS's public WordPress API.
Run from the website root: python scripts/import-blogs.py
Requires requests and beautifulsoup4.
"""
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
import html
import json
import re
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://iqcbs.com'
posts = []
page = 1
while True:
    response = requests.get(BASE + '/wp-json/wp/v2/posts', params={'per_page': 100, 'page': page, '_embed': 1}, timeout=45)
    response.raise_for_status()
    posts.extend(response.json())
    if page >= int(response.headers.get('X-WP-TotalPages', 1)):
        break
    page += 1
(ROOT / 'data/blogs-source.json').write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding='utf-8')

def text(markup):
    return BeautifulSoup(markup, 'html.parser').get_text(' ', strip=True)

def esc(value):
    return html.escape(str(value), quote=True)

image_dir = ROOT / 'assets/blogs'
image_dir.mkdir(exist_ok=True)
def download(post):
    media = post.get('_embedded', {}).get('wp:featuredmedia', [{}])[0]
    url = media.get('source_url')
    if not url:
        return post['id'], None
    extension = Path(urlparse(url).path).suffix or '.jpg'
    target = image_dir / (str(post['id']) + extension)
    r = requests.get(url, timeout=45)
    r.raise_for_status()
    target.write_bytes(r.content)
    return post['id'], target.relative_to(ROOT).as_posix()
with ThreadPoolExecutor(max_workers=6) as pool:
    images = dict(pool.map(download, posts))

for path in ROOT.glob('*.html'):
    s = path.read_text(encoding='utf-8')
    s = s.replace('href="index.html#journal"', 'href="blogs.html"').replace('href="#journal"', 'href="blogs.html"').replace('>Journal<', '>Blogs<')
    path.write_text(s, encoding='utf-8')
template = (ROOT / 'index.html').read_text(encoding='utf-8')
prefix = template[:template.index('<main')]
prefix = re.sub(r'href="#(programmes|dates|trainers|organisations|contact|webinar|reviews)"', r'href="index.html#\1"', prefix)
footer = template[template.index('<!-- Footer -->'):template.index('<script>', template.index('<!-- Footer -->'))]
footer = re.sub(r'href="#([^"]+)"', r'href="index.html#\1"', footer)
css = '''
.blog-wrap{max-width:1200px;margin:auto;padding:64px 24px 80px}.blog-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(310px,100%),1fr));gap:28px}.blog-card{display:flex;flex-direction:column;background:white;border:1px solid #E6D9CB;border-radius:20px;overflow:hidden}.blog-card img{width:100%;aspect-ratio:16/10;object-fit:cover}.blog-card-body{padding:24px;display:flex;flex-direction:column;gap:12px;flex:1}.blog-card h2{font-size:23px;line-height:1.25;margin:0}.blog-card p{margin:0;color:#5E534A}.blog-card a{color:inherit;text-decoration:none}.blog-card a:hover{text-decoration:underline}.blog-meta{font-size:14px;color:#5E534A}.blog-title{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(2.3rem,5vw,4rem);line-height:1.1;letter-spacing:-.025em;margin:20px 0}.blog-article{max-width:780px;margin:auto;font-size:19px;line-height:1.85;overflow-wrap:anywhere}.blog-article h2,.blog-article h3{line-height:1.3;margin-top:36px}.blog-article img{height:auto;max-width:100%;border-radius:16px}.blog-article table{display:block;overflow:auto;border-collapse:collapse;max-width:100%;font-size:16px}.blog-article td,.blog-article th{border:1px solid #E6D9CB;padding:10px}.blog-article blockquote{border-left:4px solid #F78E1D;margin:24px 0;padding:8px 24px;background:#FFF3E5}.blog-hero{width:100%;max-height:520px;object-fit:cover;border-radius:24px;margin:24px 0 40px}.blog-tools{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:32px 0}.blog-tools input{box-sizing:border-box;width:min(100%,440px);padding:14px 18px;border:1px solid #9A8877;border-radius:12px;background:white} .blog-card:focus-within{outline:2px solid #A85A0F;outline-offset:3px}
'''
menu = '''<script>
(function(){var b=document.getElementById('menu-btn'),m=document.getElementById('mobile-menu');if(!b||!m)return;function set(open){m.hidden=!open;b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close menu':'Open menu');var o=b.querySelector('.icon-open'),c=b.querySelector('.icon-close');if(o)o.hidden=open;if(c)c.hidden=!open;}b.addEventListener('click',function(){set(m.hidden)});document.addEventListener('keydown',function(e){if(e.key==='Escape'){set(false);b.focus()}});})();
</script>'''
# Retain the actual menu button ID used by the existing site.
button = BeautifulSoup(prefix, 'html.parser').select_one('header button')
if button:
    menu = menu.replace("getElementById('menu-btn')", "getElementById('" + button.get('id', '') + "')")

def document(title, description, body, script=''):
    head = re.sub(r'<title>.*?</title>', '<title>' + esc(title) + ' | IQCBS</title>', prefix)
    head = re.sub(r'<meta (?:name="description"|property="og:description") content="[^"]*">', '<meta name="description" content="' + esc(description) + '">', head, count=1)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + esc(title) + ' | IQCBS">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + esc(description) + '">', head)
    head = head.replace('</style>', css + '</style>', 1)
    return head + '<main id="main">' + body + '</main>' + footer + menu + script + '<script src="assets/webinar-modal.js" defer></script><script src="assets/whatsapp-widget.js" defer></script></body></html>'

records = []
for post in posts:
    title = text(post['title']['rendered'])
    content = BeautifulSoup(post['content']['rendered'], 'html.parser')
    for node in content.select('script,style,iframe,form,object,embed'):
        node.decompose()
    for node in content.find_all(True):
        for key in list(node.attrs):
            if key.startswith('on') or key in ('style', 'class', 'id'):
                del node[key]
        for attr in ('href', 'src'):
            if node.get(attr, '').lower().startswith('javascript:'):
                del node[attr]
    excerpt = text(post['excerpt']['rendered'])
    excerpt = re.sub(r'\s*(?:\[.*?\]|Read More).*$', '', excerpt)
    if len(excerpt) > 180:
        excerpt = excerpt[:177].rsplit(' ', 1)[0] + '…'
    records.append(dict(id=post['id'], slug=post['slug'], title=title, date=post['date'][:10], display_date=datetime.fromisoformat(post['date']).strftime('%d %B %Y').lstrip('0'), excerpt=excerpt, content=str(content), image=images[post['id']], source=post['link'], url='blog-' + post['slug'] + '.html'))

def card(p):
    image = '<a tabindex="-1" aria-hidden="true" href="' + p['url'] + '"><img src="' + p['image'] + '" alt="" loading="lazy" width="640" height="400"></a>' if p['image'] else ''
    return '<article class="blog-card" data-blog data-search="' + esc(p['title'] + ' ' + p['excerpt']) + '">' + image + '<div class="blog-card-body"><time class="blog-meta" datetime="' + p['date'] + '">' + p['display_date'] + '</time><h2><a href="' + p['url'] + '">' + esc(p['title']) + '</a></h2><p>' + esc(p['excerpt']) + '</p><a style="margin-top:auto;padding-top:12px;font-weight:700;color:#A85A0F" href="' + p['url'] + '">Read article <span aria-hidden="true">→</span></a></div></article>'

listing = '<section class="blog-wrap"><a href="index.html">Home</a><h1 class="blog-title">Blogs</h1><p style="max-width:640px;color:#5E534A;font-size:20px">Ideas and insights from IQCBS on NLP, language, personal growth and the practice of change.</p><div class="blog-tools"><label for="blog-search">Search articles</label><input type="search" id="blog-search" placeholder="Search by title or topic"><span id="blog-count" role="status">' + str(len(records)) + ' articles</span></div><div class="blog-grid">' + ''.join(map(card, records)) + '</div><p id="blog-empty" hidden>No articles match your search. Try another topic.</p></section>'
search = '''<script>document.getElementById('blog-search').addEventListener('input',function(){var q=this.value.trim().toLowerCase(),n=0;document.querySelectorAll('[data-blog]').forEach(function(c){c.hidden=!c.dataset.search.toLowerCase().includes(q);if(!c.hidden)n++});document.getElementById('blog-count').textContent=n+' article'+(n===1?'':'s');document.getElementById('blog-empty').hidden=n>0;});</script>'''
(ROOT / 'blogs.html').write_text(document('Blogs', 'Read the latest IQCBS articles on NLP, coaching, language and personal growth.', listing, search), encoding='utf-8')
for p in records:
    words = len(text(p['content']).split())
    body = '<div class="blog-wrap"><nav aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="blogs.html">Blogs</a></nav><header style="max-width:900px;margin:32px auto"><p class="blog-meta"><time datetime="' + p['date'] + '">' + p['display_date'] + '</time> · IQCBS · ' + str(max(1, round(words/200))) + ' min read</p><h1 class="blog-title">' + esc(p['title']) + '</h1></header>'
    if p['image']:
        body += '<img class="blog-hero" src="' + p['image'] + '" alt="' + esc(p['title']) + '">'
    body += '<article class="blog-article">' + p['content'] + '<p class="blog-meta">Originally published on <a href="' + esc(p['source']) + '">iqcbs.com</a>.</p><p><a href="blogs.html">← All blogs</a></p></article><section style="margin-top:64px"><h2>More to explore</h2><div class="blog-grid">' + ''.join(card(other) for other in [r for r in records if r != p][:3]) + '</div></section></div>'
    (ROOT / p['url']).write_text(document(p['title'], p['excerpt'], body), encoding='utf-8')

home = template
start = home.index('<!-- Journal -->') if '<!-- Journal -->' in home else home.index('<!-- Blogs -->')
end = home.index('<!-- Webinar + contact -->', start)
section = '<!-- Blogs --><section id="blogs" style="padding:96px 0"><div style="max-width:1200px;margin:auto;padding:0 24px"><div style="display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:32px"><h2 style="font-size:clamp(2rem,3.4vw,3rem);margin:0">Latest blogs</h2><a href="blogs.html" style="font-weight:700">All blogs →</a></div><div class="blog-grid">' + ''.join(map(card, records[:3])) + '</div></div></section>\n\n'
home = home[:start] + section + home[end:]
if '.blog-wrap{' not in home:
    home = home.replace('</style>', css + '</style>', 1)
(ROOT / 'index.html').write_text(home, encoding='utf-8')
(ROOT / 'data/blogs.json').write_text(json.dumps([{k:v for k,v in p.items() if k != 'content'} for p in records], ensure_ascii=False, indent=2), encoding='utf-8')
print('Imported', len(records), 'posts and images; generated listing, article pages, and homepage preview.')
