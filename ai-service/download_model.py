from pathlib import Path
import urllib.request,json,hashlib
base=Path('models');base.mkdir(exist_ok=True)
resources={'squeezenet.onnx':'https://media.githubusercontent.com/media/onnx/models/main/validated/vision/classification/squeezenet/model/squeezenet1.1-7.onnx','labels.json':'https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt'}
for name,url in resources.items():
 target=base/name
 if target.exists():continue
 print('Downloading',name,flush=True)
 with urllib.request.urlopen(url,timeout=60) as r:data=r.read()
 if name=='squeezenet.onnx' and hashlib.sha256(data).hexdigest()!='1eeff551a67ae8d565ca33b572fc4b66e3ef357b0eb2863bb9ff47a918cc4088':raise RuntimeError('Model checksum mismatch; verify the upstream model before use.')
 if name=='labels.json':data=json.dumps(data.decode().strip().splitlines()).encode()
 target.write_bytes(data)
print('Model SHA256:',hashlib.sha256((base/'squeezenet.onnx').read_bytes()).hexdigest())
