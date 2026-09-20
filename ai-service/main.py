import base64,io,json,os,secrets,hashlib
from datetime import date,datetime
from pathlib import Path
from functools import lru_cache
import numpy as np
from PIL import Image,ImageOps,UnidentifiedImageError
from fastapi import FastAPI,HTTPException,Header,Depends
from pydantic import BaseModel,Field
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from dotenv import load_dotenv
load_dotenv()
app=FastAPI(title='FoodWise inference',version='1.0.0')
MODEL_PATH=Path(os.getenv('CV_MODEL_PATH','models/squeezenet.onnx'))
TOKEN=os.getenv('AI_SERVICE_TOKEN','')
Image.MAX_IMAGE_PIXELS=20_000_000

def authorize(x_service_token:str=Header(default='')):
    if not TOKEN or not secrets.compare_digest(x_service_token,TOKEN):raise HTTPException(401,'Service authorization required')
class Observation(BaseModel):
    date:date
    itemName:str=Field(min_length=1,max_length=120)
    quantitySold:float=Field(ge=0,le=100000)
    mealType:str
class ForecastRequest(BaseModel):
    date:date
    mealType:str
    history:list[Observation]=Field(max_length=15000)
    buffer:float=Field(default=4,ge=0,le=15)
    eventAttendance:int=Field(default=0,ge=0,le=10000)
    override:float|None=Field(default=None,ge=0,le=100000)
    reason:str|None=None
class VisionRequest(BaseModel):
    image:str=Field(max_length=7_000_000)
def features(day,values,days):
    same=[v for v,d in zip(values,days) if d.weekday()==day.weekday()][-4:]
    return [day.weekday(),day.month,int(day.weekday()>=5),values[-1],float(np.mean(values[-7:])),float(np.mean(values[-28:])),float(np.mean(same or values[-7:]))]
@app.get('/health')
def health():return {'status':'ok','forecast':'Random Forest + rolling baseline','vision':'model file ready' if MODEL_PATH.exists() else 'model unavailable','version':'1.0.0'}
@app.post('/forecast',dependencies=[Depends(authorize)])
def forecast(req:ForecastRequest):
    grouped={}
    for r in req.history:
        if r.date>=req.date or r.mealType!=req.mealType:continue
        grouped.setdefault(r.itemName,{})[r.date]=grouped.setdefault(r.itemName,{}).get(r.date,0)+r.quantitySold
    if not grouped:raise HTTPException(422,'No historical data for this meal period. Import POS history first.')
    output=[]; evaluations=[]
    for item,aggregates in grouped.items():
        days=sorted(aggregates);values=[aggregates[d] for d in days]
        if len(days)<35:raise HTTPException(422,f'{item}: at least 35 days of recorded demand are needed. Missing days are not assumed to be zero.')
        X=[];y=[];target_days=[]
        for i in range(14,len(days)):
            X.append(features(days[i],values[:i],days[:i]));y.append(values[i]);target_days.append(days[i])
        split=min(max(14,int(len(X)*0.8)),len(X)-4)
        model=RandomForestRegressor(n_estimators=70,max_depth=7,min_samples_leaf=2,random_state=42,n_jobs=1)
        model.fit(X[:split],y[:split]);p=model.predict(X[split:]);baseline=[x[4] for x in X[split:]]
        mae=float(mean_absolute_error(y[split:],p));base_mae=float(mean_absolute_error(y[split:],baseline));future=features(req.date,values,days)
        if mae<=base_mae:model.fit(X,y);prediction=float(model.predict([future])[0]);selected='Random Forest'
        else:prediction=float(future[4]);selected='7-day rolling baseline (lower holdout error)'
        output.append({'itemName':item,'historicalAverage':round(float(np.mean(values[-28:]))),'basePrediction':max(0,round(prediction)),'selectedModel':selected,'historyDays':len(days),'explanation':f'Uses recorded {req.mealType.lower()} demand, weekday, month, previous observation, and trailing averages. Future visits cannot be inferred without booking context.'})
        evaluations.append({'itemName':item,'modelMae':round(mae,2),'baselineMae':round(base_mae,2),'evaluationStart':str(target_days[split]),'evaluationEnd':str(target_days[-1]),'trainingRows':split,'testRows':len(X)-split,'selectedModel':selected})
    total=sum(x['basePrediction'] for x in output) or 1;attendance=req.eventAttendance;allocated=0
    for i,x in enumerate(output):
        extra=(attendance-allocated) if i==len(output)-1 else round(attendance*x['basePrediction']/total);allocated+=extra;prediction=x['basePrediction']+extra
        x['eventAllocation']=extra;x['predictedQuantity']=prediction;x['recommendedQuantity']=int(np.ceil(prediction*(1+req.buffer/100)))
        if req.override is not None:x['manualOverride']=round(req.override*x['basePrediction']/total)
    return {'items':output,'evaluation':evaluations,'modelVersion':'foodwise-demand-v1','generatedAt':datetime.now().isoformat(),'dataSource':'Uploaded or synthetic institutional POS history','methodology':'Per-item chronological 80/20 holdout. Lag features use only previous observations; rolling one-step evaluation. Better model selected per item. Events are an explicit proportional planning adjustment, not a learned causal effect.','eventAttendance':attendance,'totalPredicted':sum(x['predictedQuantity'] for x in output),'totalRecommended':sum(x['recommendedQuantity'] for x in output)}
@lru_cache(maxsize=1)
def vision_model():
    if not MODEL_PATH.exists():raise HTTPException(503,'Vision model unavailable. Run python download_model.py in ai-service.')
    import onnxruntime as ort
    settings=ort.SessionOptions();settings.intra_op_num_threads=1;settings.inter_op_num_threads=1
    try:return ort.InferenceSession(str(MODEL_PATH),sess_options=settings,providers=['CPUExecutionProvider'])
    except Exception:raise HTTPException(503,'Vision model could not load.')
@app.post('/vision',dependencies=[Depends(authorize)])
def vision(req:VisionRequest):
    try:
        raw=base64.b64decode(req.image,validate=True)
        if len(raw)>5*1024*1024:raise HTTPException(413,'Image exceeds 5 MB.')
        im=Image.open(io.BytesIO(raw))
        if im.format not in ('JPEG','PNG','WEBP'):raise HTTPException(415,'Use JPEG, PNG or WebP.')
        im=ImageOps.exif_transpose(im).convert('RGB')
        if min(im.size)<96:raise HTTPException(422,'Image resolution is too low; use at least 96 pixels on each side.')
    except HTTPException:raise
    except (ValueError,UnidentifiedImageError,OSError,Image.DecompressionBombError):raise HTTPException(422,'Image is invalid or too large to decode safely.')
    session=vision_model();resized=ImageOps.fit(im,(224,224),method=Image.Resampling.BILINEAR);pixels=np.array(resized).astype(np.float32)/255
    arr=((pixels-np.array([.485,.456,.406],dtype=np.float32))/np.array([.229,.224,.225],dtype=np.float32)).transpose(2,0,1)[None].astype(np.float32)
    try:logits=session.run(None,{session.get_inputs()[0].name:arr})[0].reshape(-1)
    except Exception:raise HTTPException(503,'Vision inference failed. Try another image.')
    probs=np.exp(logits-logits.max());probs/=probs.sum();top=np.argsort(probs)[-5:][::-1];labels=json.loads(Path('models/labels.json').read_text());ranked=[{'label':labels[int(i)],'confidence':round(float(probs[i]),4)} for i in top];best=ranked[0];brightness=float(pixels.mean());contrast=float(pixels.std())
    quality='Image quality insufficient' if brightness<.08 or brightness>.95 or contrast<.03 else 'Manual review recommended'
    return {'detectedCategory':best['label'] if best['confidence']>=.35 else 'Uncertain','confidence':best['confidence'],'topPredictions':ranked,'visibleAssessment':quality,'imageWidth':im.width,'imageHeight':im.height,'brightness':round(brightness,3),'contrast':round(contrast,3),'warning':'This general ImageNet classifier may recognize food or non-food objects. It cannot establish freshness, deterioration or microbiological safety. No food-safety conclusion is made from this photo.','modelVersion':'SqueezeNet 1.1 / ONNX ImageNet','modelSha256':hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()}
