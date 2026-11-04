from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from pathlib import Path
import json,os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
c=json.loads((root/'dist/coverage-manifest.json').read_text())
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root/'dist')))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  for engine in os.environ.get('TEST_ENGINES','chromium,webkit').split(','):
   browser=getattr(p,engine).launch()
   for width in [320,390,768,1440]:
    page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    for province in ['madrid','bizkaia']:
     row=next(a for a in c['assignments'] if a['provinceSlug']==province and a['original']!=a['destination'])
     page.goto(base+('/' if c['site']=='norte' else '/zonas/'),wait_until='domcontentloaded')
     field=page.locator('#town-search');field.fill(row['name'])
     link=page.locator('#town-results a').filter(has_text=row['name']).filter(has=page.locator('small')).first
     link.wait_for();assert link.get_attribute('href')==row['url'],(row['name'],link.get_attribute('href'),row['url']);link.click()
     page.locator('#cobertura-'+row['code']).wait_for()
     page.wait_for_function('(data)=>document.querySelector(data.selector).value===data.name',arg={'selector':c['townInput'],'name':row['name']})
     assert row['hub'] in page.locator('h1').inner_text()
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(engine,width,row['name'],'overflow',page.evaluate('Array.from(document.querySelectorAll("body *")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,15)'))
     target=page.locator('[data-coverage-enquiry="'+row['code']+'"]');target.click()
     assert page.locator(c['townInput']).input_value()==row['name']
     assert not errors,errors
    page.close()
   browser.close()
 print('NAVEGADORES OK: búsqueda, cobertura y municipio del formulario; '+os.environ.get('TEST_ENGINES','chromium,webkit')+' a 320, 390, 768 y 1440 px.')
finally:server.shutdown()
