"""Import INE denominations, not inferred coverage, jobs or reception problems."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode
from datetime import date
import zipfile,io,json,hashlib,re
ROOT=Path(__file__).resolve().parents[1]
PAGE='https://ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736177010&idp=1254735572981&menu=resultados&secc=1254736195517'
ENDPOINT='https://ine.es/nomen2/Descarga'
YEAR=2025
def main():
 cache=Path('/tmp/norte-nomenclator-2025.zip')
 raw=cache.read_bytes() if cache.exists() else urlopen(Request(ENDPOINT,data=urlencode({'anioNacional':str(YEAR)}).encode()),timeout=60).read()
 archive=zipfile.ZipFile(io.BytesIO(raw));rows=archive.read(f'Nomdef{YEAR}_sex.txt').decode('utf-8-sig').splitlines()
 wanted={m['municipio_id'] for m in json.loads((ROOT/'data/municipios.json').read_text())};out={key:{} for key in wanted}
 for line in rows:
  code=line[:11]
  if code[:5] not in wanted or code[7:9]=='00' or code[9:11]=='99':continue
  assert re.fullmatch(r'\d{11}',code)
  name=line[11:81].strip();assert name and not name.startswith('*')
  # Entidad singular and núcleo can share a name. Keep one denomination,
  # preferring the named nucleus when both occur in the source.
  out[code[:5]][name]={'code':code,'name':name,'kind':'entidad singular' if code[9:11]=='00' else 'núcleo'}
 assert all(out.values()),'Missing INE denominaciones'
 result={'year':YEAR,'reference_date':'2025-01-01','source':PAGE,'download':ENDPOINT,'download_parameters':{'anioNacional':str(YEAR)},'archive_sha256':hashlib.sha256(raw).hexdigest(),'retrieved':date.today().isoformat(),'method':'Denominaciones de entidades singulares y núcleos, sin diseminados ni duplicar nombres dentro del municipio. No es una división por barrios ni una prueba de cobertura comercial.','municipalities':{key:sorted(values.values(),key=lambda v:v['name']) for key,values in sorted(out.items())}}
 (ROOT/'data/nucleos-ine.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
 print('INE',YEAR,len(out),'municipios',sum(len(v) for v in out.values()),'denominaciones')
if __name__=='__main__':main()
