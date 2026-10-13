"""Collect short structured recommendations from public publisher pages.
No article bodies are saved; source gaps stay explicit. Not run during app builds.
"""
import concurrent.futures
import html
import json
import re
import sys
import urllib.request
from pathlib import Path
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[1]
CHECKED = '2026-10-12'

class Node:
    def __init__(self, tag='', attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs or []), parent, []
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children).strip()
    def all(self, tags):
        for c in self.children:
            if isinstance(c, Node):
                if c.tag in tags: yield c
                yield from c.all(tags)

class DOM(HTMLParser):
    def __init__(self, body):
        super().__init__(); self.root = Node(); self.node = self.root; self.feed(body)
    def handle_starttag(self, tag, attrs):
        child = Node(tag, attrs, self.node); self.node.children.append(child)
        if tag not in ['br','hr','img','input','meta','link','source','wbr','area','embed']: self.node = child
    def handle_endtag(self, tag):
        cursor = self.node
        while cursor.parent:
            if cursor.tag == tag:
                self.node = cursor.parent; return
            cursor = cursor.parent
    def handle_data(self, data):
        if self.node.tag not in ['script','style']: self.node.children.append(data)

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=25) as response:
        return DOM(response.read().decode('utf-8', errors='replace')).root

catalog = (ROOT / 'src/catalog.js').read_text(encoding='utf-8')
if '--inspect-english' in sys.argv:
    page=fetch('https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/624119')
    print(json.dumps({'headings':[n.text()[:150] for n in page.all(['h1','h2','h3'])], 'tables':[n.text()[:400] for n in page.all(['table'])], 'sample':page.text()[:1500]},ensure_ascii=False))
    sys.exit(0)
names = re.search(r"const names='([^']+)'", catalog).group(1).split('|')
slug = lambda s: s.lower().replace(' ', '-')
if '--encyclopedia' in sys.argv:
    file=ROOT / 'research/collected-guide-coverage.json'
    archive=json.loads(file.read_text(encoding='utf-8'))
    for row in archive['characters']:
        row['entries']=[e for e in row['entries'] if e['source']!='encyclopedia']
    def encyclopedia(name):
        cid=slug(name); url='https://fire-emblem-fortunes-weave.turam.dev/en/entry/'+cid+'/'
        try:
            page=fetch(url); active=False
            for n in page.all(['h2','ol']):
                if n.tag=='h2': active='training guide' in n.text().lower()
                elif active:
                    route=[a.text().strip() for a in n.all(['a']) if '/entry/' in a.attrs.get('href','')]
                    if route:return {'character':cid,'source':'encyclopedia','url':url,'route':route,'checked':CHECKED,'aiGenerated':'AI-generated' in page.text(),'scope':'Selected training direction · source aggregation'}
            return None
        except Exception:return None
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for entry in pool.map(encyclopedia,names):
            if entry:
                next(r for r in archive['characters'] if r['character']==entry['character'])['entries'].append(entry)
                print('Encyclopedia',entry['character'],flush=True)
    file.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    sys.exit(0)
rows, failures = [], []
def collect(name):
    cid, entries = slug(name), []
    url = 'https://fortunesweave.co.uk/characters/' + cid
    try:
        dom = fetch(url)
        for heading in dom.all(['h2','h3','h4']):
            if heading.text().strip().lower() == 'recommended class path':
                siblings = heading.parent.children
                index = siblings.index(heading)
                following = []
                for item in siblings[index+1:]:
                    if isinstance(item,Node) and item.tag in ['h2','h3','h4']: break
                    following.append(item.text() if isinstance(item,Node) else item)
                text = ' '.join(following).strip()
                path = [s.strip() for s in re.split('[→➜]', text)]
                links = [a.text().strip() for a in heading.parent.all(['a']) if a.attrs.get('href','').startswith('/classes/')]
                if links: path = links
                if 1 <= len(path) <= 8 and all(0 < len(s) < 45 for s in path):
                    entries.append({'character':cid,'source':'compilation','url':url,'route':path,'scope':'Published character route','checked':CHECKED})
        jpname = re.search(r'Japanese name\s+(\S+)', dom.text())
        jp = []
        # Find the individual character page by its title, not index order.
        for candidate in jp:
            try:
                page = fetch(candidate)
                title = next((n.text() for n in page.all(['h1'])), '')
                if '育成おすすめと兵種' not in title: continue
                # Class names are links in each recommended tier table, before rating section.
                route = []
                active = False
                for n in page.all(['h2','h3','table']):
                    if n.tag == 'h2':
                        if '育成おすすめ' in n.text(): active = True
                        elif active: break
                    if active and n.tag == 'h3' and 'おすすめ' in n.text() and '育成する' not in n.text(): break
                    if active and n.tag == 'table':
                        for tr in n.all(['tr']):
                            if '兵種おすすめ' in tr.text():
                                continue
                            for a in tr.all(['a']):
                                label = a.text().strip()
                                if label and not label.startswith('▶') and len(label)<25 and 'game8.jp/fe-banshisenko/' in a.attrs.get('href',''):
                                    if label not in route: route.append(label)
                if route:
                    entries.append({'character':cid,'source':'game8jp','url':candidate,'routeJapanese':route[:8],'scope':'Individual Japanese recommendation','checked':CHECKED})
                break
            except Exception: continue
        return {'character':cid,'entries':entries,'access':'checked','japaneseName':jpname.group(1) if jpname else None}
    except Exception as error:
        return {'character':cid,'entries':[], 'access':'unavailable', 'error':str(error)}

if '--resume' in sys.argv:
    rows = json.loads((ROOT / 'research/collected-guide-coverage.json').read_text(encoding='utf-8'))['characters']
else:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(collect,names):
            rows.append(result)
            print(result['character'], len(result['entries']), result['access'], flush=True)

out = {'checkedOn':CHECKED,'purpose':'Short recommendation records only; not article mirrors. Review aliases before importing.', 'characters':rows}
out['publisherChecks'] = []
by_jp = {r['japaneseName'].rstrip(';'):r for r in rows if r.get('japaneseName')}
by_jp['レダ'] = next(r for r in rows if r['character']=='leda')
for jpname,cid in {'ボナパルテ':'bonaventure','バッカニア':'buccar','ゲイツ':'gaitz','ダイトウ':'dadao','リリアン':'lilian','ナジャ':'nezha','ジェスター':'jester','セテス':'seteth','マジーデ':'majide','ペペ':'peppe','ルルディア':'ludia','ウーシュラ':'ursula','セントリオン':'centurio','クラプカ':'klapka','主人公（イシュマール）':'eshmel'}.items():
    by_jp[jpname]=next(r for r in rows if r['character']==cid)
index_url = 'https://game8.jp/fe-banshisenko/816464'
index = fetch(index_url)
candidate_urls = list(dict.fromkeys(a.attrs.get('href','') for a in index.all(['a']) if re.match(r'https://game8.jp/fe-banshisenko/\d+', a.attrs.get('href',''))))
if '--missing' in sys.argv:
    candidate_urls=list(dict.fromkeys(a.attrs.get('href','') for a in index.all(['a']) if a.text().strip() in by_jp and not any(e['source']=='game8jp' for e in by_jp[a.text().strip()]['entries'])))
print('Japanese index links:',len(candidate_urls),flush=True)
def japanese(url):
    try:
        page = fetch(url)
        title = next((n.text() for n in page.all(['h1']) if '育成おすすめと兵種' in n.text()), '')
        found = re.search(r'[】〗]\s*(.+?)の育成おすすめと兵種',title)
        if '育成おすすめと兵種' in title: print('Character page',title[:70],flush=True)
        if not found or found.group(1) not in by_jp: return None
        route, active = [], False
        for n in page.all(['h2','h3','table']):
            if n.tag == 'h2':
                if '育成おすすめ' in n.text(): active = True
                elif active: break
            if active and n.tag == 'h3' and '育成する' not in n.text(): break
            if active and n.tag == 'table':
                for a in n.all(['a']):
                    label = a.text().strip()
                    if label and not label.startswith('▶') and len(label)<25 and re.match(r'https://game8.jp/fe-banshisenko/\d+',a.attrs.get('href','')):
                        if label not in route: route.append(label)
        if route:
            return {'character':by_jp[found.group(1)]['character'],'source':'game8jp','url':url,'routeJapanese':route,'scope':'Individual Japanese recommendation','checked':CHECKED}
    except Exception: return None
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for entry in pool.map(japanese,candidate_urls):
        if entry:
            next(r for r in rows if r['character']==entry['character'])['entries'].append(entry)
            print('JP',entry['character'], '|'.join(entry['routeJapanese']),flush=True)

keen = 'https://www.keengamer.com/articles/guides/fire-emblem-fortunes-weave-best-class-for-every-character/'
try:
    page = fetch(keen)
    for tr in page.all(['tr']):
        cells = [n.text() for n in tr.children if isinstance(n,Node) and n.tag in ['td','th']]
        if cells and cells[0] in names and len(cells)>=4:
            next(r for r in rows if r['character']==slug(cells[0]))['entries'].append({'character':slug(cells[0]),'source':'keengamer','url':keen,'target':cells[1],'alternative':cells[3],'scope':'Endgame target only; no invented intermediate stages','checked':CHECKED})
    out['publisherChecks'].append({'source':'keengamer','url':keen,'status':'table checked'})
except Exception as error: out['publisherChecks'].append({'source':'keengamer','url':keen,'status':str(error)})

for source,url in [('game8','https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/624119'),('allthingshow','https://allthings.how/fire-emblem-fortune-s-weave-best-build-for-esmeralda/'),('mobalytics','https://mobalytics.gg/gamebase/guides/fire-emblem-fortunes-weave-cai-tier-list')]:
    try:
        page = fetch(url)
        if source=='game8':
            for table in page.all(['table']):
                text=table.text()
                if 'Preferred Class Progression' not in text: continue
                for tr in table.all(['tr']):
                    cells = [n.text() for n in tr.children if isinstance(n,Node) and n.tag in ['td','th']]
                    if not cells: continue
                    character = next((name for name in names if re.search(r'\b'+re.escape(name)+r'\b',cells[0])),None)
                    if character:
                        groups=[re.split(r'\s+or\s+',re.sub(r'\s+',' ',s).strip()) for s in cells[1].split('▼')]
                        next(r for r in rows if r['character']==slug(character))['entries'].append({'character':slug(character),'source':'game8','url':url,'routeGroups':groups,'scope':'Published class direction; alternatives retained','checked':CHECKED})
        links = sorted(set(a.attrs.get('href','') for a in page.all(['a']) if ('fortune' in a.attrs.get('href','').lower() and ('build' in a.attrs.get('href','').lower() or 'tier-list' in a.attrs.get('href','').lower()))))
        out['publisherChecks'].append({'source':source,'url':url,'status':'page checked','relatedBuildLinks':links})
    except Exception as error: out['publisherChecks'].append({'source':source,'url':url,'status':'unavailable','error':str(error)})
(ROOT / 'research/collected-guide-coverage.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
print('Saved',len(rows),'character checks.',flush=True)
