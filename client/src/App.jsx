import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { init, predict } from './model/model';

const App = () => {
  const [modelReady, setModelReady] = useState(false);
  const [insertedValue, setInsertedValue] = useState(null);
  const [predictValue, setPredictValue] = useState(null);

  const prepareModel = useCallback(async () => {
    await init();
    setModelReady(true);
  }, []);


  const onChangeValue = useCallback((event) => {
    const { value } = event.target;
    setInsertedValue(value);
  }, []);


  useEffect(() => {
    if (modelReady && insertedValue != null) {
      setPredictValue(predict(Number(insertedValue)));
    }
  }, [modelReady, insertedValue]);

  useEffect(() => {
    prepareModel();
  }, [prepareModel]);

  const expectedValue = (insertedValue || 0) * 1000;

  return (
    <div>
      {modelReady ? 'MODEL READY' : 'MODEL INITIALIZATION ....'}
      <hr />
      <input onChange={onChangeValue} disabled={!modelReady} />
      <br />
      {predictValue != null && (
      <div>
        Predict value: {predictValue}
        <br />
        Espected value: {expectedValue}
      </div>
      )}
    </div>
  );
};

export default App;
