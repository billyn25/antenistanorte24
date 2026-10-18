#!/usr/bin/env python3
"""Import dated population and geographic reference data; never infer reception faults."""
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlsplit,parse_qs
from io import BytesIO,StringIO
from openpyxl import load_workbook
import csv,json,math,hashlib
from datetime import date
ROOT=Path(__file__).resolve().parents[1]
POP='https://www.ine.es/jaxiT3/files/t/csv_bdsc/68065.csv'
GEO='https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.xlsx'
def distance(a,b):
 lat1,lon1,lat2,lon2=map(math.radians,[a['lat'],a['lon'],b['lat'],b['lon']]);h=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
 return 6371*2*math.asin(min(1,math.sqrt(h)))
def main():
 # Reuse downloaded bytes during the initial import; normal runs fetch the same official sources.
 pop=Path('/tmp/norte-population').read_bytes() if Path('/tmp/norte-population').exists() else urlopen(POP,timeout=45).read()
 geo=Path('/tmp/ign-municipios.xlsx').read_bytes() if Path('/tmp/ign-municipios.xlsx').exists() else urlopen(GEO,timeout=45).read()
 rows=list(csv.DictReader(StringIO(pop.decode('utf-8-sig')),delimiter=';'));year=max(int(x['Periodo']) for x in rows if x['Municipios'] and x['Sexo']=='Total')
 population={x['Municipios'][:5]:int(x['Total'].replace('.','')) for x in rows if x['Municipios'] and x['Sexo']=='Total' and x['Periodo']==str(year) and x['Total'].replace('.','').isdigit()}
 workbook=load_workbook(BytesIO(geo),read_only=True,data_only=True);geography={str(row[0]).zfill(5):row for row in list(workbook['IGN_INFOGEO_MUNICIPIOS'].values)[1:] if row[0]}
 municipalities=json.loads((ROOT/'data/municipios.json').read_text());out={}
 for m in municipalities:
  key=m['municipio_id'];g=geography[key];lon,lat=map(float,parse_qs(urlsplit(g[6]).query)['center'][0].split(','));assert key in population
  out[key]={'population':population[key],'area_km2':g[3],'capital':g[4],'lat':lat,'lon':lon}
 for key,a in out.items():a['nearby']=[[k,round(d,2)] for d,k in sorted((distance(a,b),k) for k,b in out.items() if k!=key)[:6]]
 report={'population_year':year,'population_label':'Censo anual de población, población según municipio y sexo, total','population_source':POP,'population_source_page':'https://www.ine.es/jaxiT3/Tabla.htm?t=68065','geography_source':GEO,'geography_source_page':'https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.html','geography_credit':'Obra derivada de NGMEP, IGN, CC BY 4.0','retrieved':date.today().isoformat(),'source_sha256':{'population':hashlib.sha256(pop).hexdigest(),'geography':hashlib.sha256(geo).hexdigest()},'distance_method':'Haversine, km en línea recta entre puntos de referencia aproximados del IGN; no distancias por carretera ni tiempos de llegada. Cercanía entre los municipios incluidos en esta web.','municipalities':out}
 (ROOT/'data/contexto-local.json').write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n');print('Imported',len(out),'municipalities; population year',year)
 for key in ['48012','48096','28079']:print(key,out[key])
if __name__=='__main__':main()
