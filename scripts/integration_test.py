"""Run the real API + inference service against an isolated temporary demo store."""
import subprocess,os,time,json,tempfile,urllib.request,urllib.error,base64,io
from pathlib import Path
from datetime import datetime,timedelta,timezone
ROOT=Path(__file__).resolve().parent.parent
TOKEN='integration-test-service-token-only'
procs=[];count=0

def req(path,method='GET',body=None,token=None,expected=200,raw=False):
 global count
 headers={}
 if token:headers['Authorization']='Bearer '+token
 if body is not None:headers['Content-Type']='application/json';body=json.dumps(body).encode()
 r=urllib.request.Request('http://127.0.0.1:18000'+path,data=body,headers=headers,method=method)
 try:
  with urllib.request.urlopen(r,timeout=90) as response:status=response.status;payload=response.read()
 except urllib.error.HTTPError as e:status=e.code;payload=e.read()
 assert status==expected,(path,status,payload[:500])
 count+=1
 return payload if raw else json.loads(payload)

def login(role):return req('/api/auth/login','POST',{'email':role+'@foodwise.demo','password':'FoodWise@2026'})['token']
def action(role,x,kind,payload={},expected=200):return req('/api/surplus/'+x+'/action','POST',{'action':kind,'payload':payload},role,expected)
try:
 with tempfile.TemporaryDirectory(prefix='foodwise-test-') as temp:
  env={**os.environ,'PORT':'18000','DEMO_MODE':'true','DATA_FILE':str(Path(temp)/'demo.json'),'JWT_SECRET':'integration-tests-have-a-separate-jwt-secret','AI_SERVICE_URL':'http://127.0.0.1:18001','AI_SERVICE_TOKEN':TOKEN}
  logfile=open(Path(temp)/'services.log','w+')
  python=ROOT/('ai-service/.venv/Scripts/python.exe' if os.name=='nt' else 'ai-service/.venv/bin/python')
  procs.append(subprocess.Popen([str(python),'-m','uvicorn','main:app','--host','127.0.0.1','--port','18001'],cwd=ROOT/'ai-service',env=env,stdout=logfile,stderr=logfile))
  procs.append(subprocess.Popen(['node','dist/index.js'],cwd=ROOT/'backend',env=env,stdout=logfile,stderr=logfile))
  for i in range(100):
   try:req('/health');break
   except urllib.error.URLError:time.sleep(.1)
  roles={r:login(r) for r in ['admin','institution','recipient','logistics','night']}
  req('/api/workspace',expected=401)
  req('/api/organizations/rec-1','PATCH',{'verified':False},roles['recipient'],403)
  req('/api/auth/login','POST',{'email':'institution@foodwise.demo','password':'incorrect'},expected=401)
  now=datetime.now(timezone.utc)
  iso=lambda d:d.isoformat(timespec='milliseconds').replace('+00:00','Z')
  row={'foodName':'Integration veg meals','category':'Cooked meals','dietaryType':'Vegetarian','quantity':40,'unit':'servings','servings':40,'preparedAt':iso(now-timedelta(minutes=30)),'detectedAt':iso(now),'availableUntil':iso(now+timedelta(hours=3)),'storageMethod':'Hot held','temperature':65,'packagingStatus':'Sealed','declaration':True,'contaminated':False,'organic':True,'notes':'Integration test'}
  x=req('/api/surplus','POST',row,roles['institution'],201)['id']
  req('/api/surplus','POST',{**row,'quantity':-1},roles['institution'],400)
  m=req('/api/surplus/'+x+'/matches',token=roles['institution']);assert any(v['recipientId']=='rec-1' for v in m['matches'])
  action(roles['institution'],x,'offer',{'recipientId':'rec-1'})
  accepted=action(roles['recipient'],x,'accept',{'mode':'delivery'});delivery=accepted['deliveryCode'];assert 'pickupCode' not in accepted
  inst=req('/api/workspace',token=roles['institution']);pickup=next(r for r in inst['surplus'] if r['id']==x)['pickupCode']
  action(roles['recipient'],x,'accept',{'mode':'delivery'},409)
  claimed=action(roles['logistics'],x,'claim');assert 'pickupCode' not in claimed and 'deliveryCode' not in claimed
  action(roles['logistics'],x,'claim',{},409)
  action(roles['logistics'],x,'deliver',{'code':delivery},409)
  action(roles['logistics'],x,'arrive')
  action(roles['logistics'],x,'pickup',{'code':'000000'},400)
  action(roles['logistics'],x,'pickup',{'code':pickup})
  action(roles['logistics'],x,'transit')
  action(roles['logistics'],x,'deliver',{'code':delivery})
  result=action(roles['recipient'],x,'confirm',{'quantity':38});assert result['status']=='completed'
  late=req('/api/demo/scenario','POST',{'scenario':'after-hours'},roles['institution'])
  m=req('/api/surplus/'+late['id']+'/matches',token=roles['institution']);assert m['afterHours'] and m['matches'][0]['recipientId']=='rec-3'
  action(roles['institution'],late['id'],'offer',{'recipientId':'rec-3'})
  action(roles['night'],late['id'],'accept',{'mode':'delivery'})
  rec=req('/api/demo/scenario','POST',{'scenario':'recovery'},roles['institution'])
  m=req('/api/surplus/'+rec['id']+'/matches',token=roles['institution']);assert not m['matches']
  before=req('/api/analytics',token=roles['institution'])['redistributed']
  action(roles['institution'],rec['id'],'recover',{'reason':'Insufficient remaining window'})
  w=req('/api/workspace',token=roles['institution']);recovery=next(r for r in w['recovery'] if r.get('surplusId')==rec['id'])
  req('/api/recovery/'+recovery['id'],'PATCH',{'status':'handed over'},roles['institution'])
  req('/api/recovery/'+recovery['id'],'PATCH',{'status':'completed'},roles['institution'])
  after=req('/api/analytics',token=roles['institution']);assert after['redistributed']==before
  tomorrow=(now+timedelta(days=1)).date().isoformat()
  f=req('/api/forecast','POST',{'date':tomorrow,'mealType':'Lunch','buffer':4},roles['institution']);assert len(f['items'])==4 and f['totalPredicted']>0
  req('/api/events','POST',{'title':'School visit','date':tomorrow,'mealType':'Lunch','attendees':80,'status':'Confirmed'},roles['institution'],201)
  updated=req('/api/forecast','POST',{'date':tomorrow,'mealType':'Lunch','buffer':4},roles['institution']);assert updated['totalPredicted']==f['totalPredicted']+80
  from PIL import Image
  im=Image.new('RGB',(224,224),(190,150,80));buf=io.BytesIO();im.save(buf,format='PNG')
  headers={'X-Service-Token':TOKEN,'Content-Type':'application/json'}
  body=json.dumps({'image':base64.b64encode(buf.getvalue()).decode()}).encode()
  with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:18001/vision',data=body,headers=headers),timeout=60) as r:cv=json.load(r)
  assert len(cv['topPredictions'])==5 and cv['modelSha256']=='1eeff551a67ae8d565ca33b572fc4b66e3ef357b0eb2863bb9ff47a918cc4088'
  pdf=req('/api/reports.pdf?from='+now.date().replace(day=1).isoformat()+'&to='+now.date().isoformat(),token=roles['admin'],raw=True);assert pdf.startswith(b'%PDF')
  (ROOT/'docs/test-report.pdf').write_bytes(pdf)
  req('/api/records/audit',token=roles['recipient'],expected=403)
  print(json.dumps({'httpAssertions':count,'visionInference':True,'eventAdjustment':80,'workflow':'completed','afterHours':'verified','recovery':'separate from redistribution','pdfBytes':len(pdf),'result':'PASS'},indent=2))
finally:
 for p in procs:p.terminate()
 for p in procs:p.wait(timeout=10)
