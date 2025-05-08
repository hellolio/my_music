
import React, { useEffect, useRef, useState } from 'react';


export const getCommonSettingFun = (settingData, setSettingData, readWindowState, writeWindowState) => {
    
    const [selectedRemeberSize, setSelectedRemeber] = useState(false);
    const [selectedDongan, setSelectedDongan] = useState(settingData.selectedDongan);

    useEffect(() => {
        let _ = readWindowState().then(result => {
            setSelectedRemeber(result.selected_remeber_size);
        });
      }, []);


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
        saveSetting
    ];

}