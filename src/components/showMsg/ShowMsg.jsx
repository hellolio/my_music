import React, { useState } from 'react';
import './ShowMsg.css';


export default function ShowMsg({showMsgParam, inputValue, setInputValue, setShowDialog, callFun, callFunParam}) {

  return (
      <div>
        <div className="dialog-overlay" onClick={() => setShowDialog(false)} />
        <div className="dialog">
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
                <button className='cancle' onClick={() => setShowDialog(false)}>取消</button>
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
