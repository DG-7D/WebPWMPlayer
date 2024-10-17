import React from 'react';

function PwmGenerator() {

    const [lambda, setLambda] = React.useState<number>(20000);
    const [width, setWidth] = React.useState<number>(15000);
    const [inverted, setInverted] = React.useState<boolean>(false);
    const [playing, setPlaying] = React.useState<boolean>(false);

    function handleLambdaChange(event: React.ChangeEvent<HTMLInputElement>) {
        setLambda(event.target.valueAsNumber);
    }
    function handleFreqChange(event: React.ChangeEvent<HTMLInputElement>) {
        setLambda(1000000 / event.target.valueAsNumber);
    }
    function handlePulseChange(event: React.ChangeEvent<HTMLInputElement>) {
        setWidth(event.target.valueAsNumber);
    }
    function handleDutyChange(event: React.ChangeEvent<HTMLInputElement>) {
        setWidth(lambda * event.target.valueAsNumber / 100);
    }
    function handleInvertChange(event: React.ChangeEvent<HTMLInputElement>) {
        setInverted(event.target.checked);
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
                <label>波長</label> <input type="number" value={Math.round(lambda)} step={100} onChange={handleLambdaChange} /> μs,
                <label>周波数</label> <input type="number" value={Math.round(1000000 / lambda)} min={20} max={20000} step={1} onChange={handleFreqChange} /> Hz
            </div>
            <div>
                <label>パルス幅</label> <input type="number" value={Math.round(width)} step={100} onChange={handlePulseChange} /> μs,
                <label>デューティ比</label> <input type="number" value={Math.round(width / lambda * 100 * 10) / 10} min={0} max={100} step={0.5} onChange={handleDutyChange} /> %
            </div>
            <div>
                <label>右チャンネルを反転</label> <input type="checkbox" checked={inverted} onChange={handleInvertChange} />
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
