import React from 'react';

function PwmGenerator() {
    const [freq, setFreq] = React.useState<number>(50);
    const [duty, setDuty] = React.useState<number>(50);
    const [playing, setPlaying] = React.useState<boolean>(false);

    function handleFreqChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFreq(event.target.valueAsNumber);
    }
    function handleDutyChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDuty(event.target.valueAsNumber);
    }
    function handlePlayClick() {
        setPlaying(true);
    }
    function handleStopClick() {
        setPlaying(false);
    }

    return (
        <>
            <h1>パルス幅変調再生器</h1>
            <div>
                <label>周波数</label> <input type="number" value={freq} min={20} max={20000} onChange={handleFreqChange} /> Hz
            </div>
            <div>
                <label>デューティ比</label> <input type="number" value={duty} min={0} max={100} onChange={handleDutyChange} /> %
            </div>
            <div>
                {playing
                    ? <button onClick={handleStopClick}>停止</button>
                    : <button onClick={handlePlayClick}>再生</button>}
            </div>
        </>
    );
}

function App() {
    return (
        <PwmGenerator />
    );
}

export default App;
