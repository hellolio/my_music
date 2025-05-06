
import React, { useEffect, useRef, useState } from 'react';


export const getCommonSettingFun = (commonSetting, setCommonSetting, data, setData, panelRef, settingData, setSettingData, readWindowState, writeWindowState) => {
    
    const [selectedRemeberSize, setSelectedRemeber] = useState(false);
    const [selectedDongan, setSelectedDongan] = useState(settingData.selectedDongan);

    const CommonSettingRef = useRef(null);

    useEffect(() => {
        let _ = readWindowState().then(result => {
            setSelectedRemeber(result.selected_remeber_size);
        });
      }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (commonSetting && CommonSettingRef.current && !CommonSettingRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
            setCommonSetting(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        // 清理函数
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [commonSetting, panelRef]);


    const saveSetting = async () => {
        setSettingData(prevData => ({
            ...prevData,
            selectedRemeberSize: selectedRemeberSize,
            selectedDongan: selectedDongan
        }));

        let windowState = await readWindowState();
        windowState.selected_remeber_size = selectedRemeberSize;
        await writeWindowState(windowState);
    }


    return [
        selectedRemeberSize, setSelectedRemeber,
        selectedDongan, setSelectedDongan,
        CommonSettingRef,
        saveSetting
    ];

}