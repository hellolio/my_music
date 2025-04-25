import React, { useState } from 'react';
import './ShowMsg.css';


export default function ShowMsg({showMsgParam, inputValue, setInputValue, showDialog, setShowDialog, callFun, callFunParam}) {
  const [fadeOut, setFadeOut] = useState(false);
  
  const handleCancle = () => {
    setFadeOut(true);
    setTimeout(() => setShowDialog(false), 500);
  }

  return (
      <div>
        <div className={`dialog-overlay ${fadeOut ? 'fade-out' : ''}`} onClick={() => handleCancle()} />
        <div className={`dialog ${fadeOut ? 'fade-out' : ''}`}>
          <h3>{showMsgParam.title}</h3>
          {showMsgParam.isInput && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={showMsgParam.placeholder}
            />
          )}
          {showMsgParam.isInput ?  
              <div className="dialog-buttons">
                <button className='ok' onClick={() => callFun(callFunParam)}>确认</button>
                <button className='cancle' onClick={() => handleCancle()}>取消</button>
              </div>
            :
              <div className="dialog-buttons">
                <button className='ok' onClick={() => callFun(callFunParam)}>确认</button>
              </div>
            }
        </div>
      </div>
  );
}
