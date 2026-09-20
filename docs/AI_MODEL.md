# Models and limitations

## Demand

The demo seed is synthetic: 210 days, five menu items, weekday effects and reproducible periodic variation. It represents daily item/meal aggregates, not true customer footfall or a hotel's private transactions. A bundled CSV permits import demonstrations.

For each item and meal, prior daily observations are aggregated. Features are weekday, month, weekend, previous observation, trailing 7/28-observation means and recent same-weekday mean. Only dates earlier than the requested target are included. Missing days are not imputed as zero; lags refer to recorded observations.

Random Forest: 70 estimators, depth 7, minimum leaf 2, seed 42, CPU, one worker. First 80% of eligible samples train the model, final 20% evaluate MAE. Features for each validation day use only earlier observations, yielding rolling one-step evaluation rather than a strict fixed-origin multi-day forecast. The seven-observation mean is the baseline. The lower holdout-MAE candidate is selected, then Random Forest is refit on all eligible samples when selected. This selection means the holdout is also used for model selection, so reported error is exploratory; use another untouched test period for production evaluation.

At least 35 recorded days per item are required. No false cold-start confidence is shown. Future target dates use latest available lag values without recursive daily forecasts, so this prototype is most appropriate for next-day planning.

Confirmed events add total attendance across items in proportion to baseline demand. This assumes one item-equivalent serving per additional attendee across the selected menu, a visible planning assumption. Preparation recommendation is ceil(prediction × (1 + buffer/100)). Manual total overrides are recorded separately with a reason. No automatic online learning is claimed.

## Vision

ONNX Model Zoo pretrained **SqueezeNet 1.1**, opset 7; general ImageNet 1,000-class classification, CPU execution via ONNX Runtime.

Model source: https://github.com/onnx/models/tree/main/validated/vision/classification/squeezenet

Download: https://media.githubusercontent.com/media/onnx/models/main/validated/vision/classification/squeezenet/model/squeezenet1.1-7.onnx

SHA-256: `1eeff551a67ae8d565ca33b572fc4b66e3ef357b0eb2863bb9ff47a918cc4088`

Labels: https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt

The model weights are downloaded by setup, not fabricated or trained on a claimed food-freshness dataset. The download is verified against the above checksum. Consult the upstream ONNX Model Zoo license and model documentation before distributing model weights separately.

Image preprocessing: decode actual JPEG/PNG/WebP bytes, apply EXIF orientation, RGB conversion, center-fit to 224×224, scale to [0,1], normalize with ImageNet mean/std, then NCHW float32. Apply softmax to classifier logits and return top five labels. Below 0.35 top-label probability the category is marked uncertain; this probability is not calibrated food-safety confidence.

Brightness and contrast are computed from pixels solely to warn about poor input quality. The classifier cannot diagnose spoilage, detect microbes, guarantee freshness or establish safe consumption. Even a confident category requires contextual handling review. The API rejects tiny or invalid images; absence/failure of the model returns an error.

## Future validation

Authorized institution-specific records, external holdout periods, drift assessment, culturally representative food images, human-labeled visible-condition data, calibrated uncertainty and supervised pilots are necessary before operational adoption. Nothing in this prototype replaces food-safety procedures.
