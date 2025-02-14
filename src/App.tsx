import React from 'react';

const freqMin = 20;
const freqMax = 20000;

function PwmGenerator() {

    const audioContextRef = React.useRef<AudioContext>(undefined);
    const sourceRef = React.useRef<AudioBufferSourceNode>(undefined);

    const [lambda, setLambda] = React.useState<number>(20000);
    const [width, setWidth] = React.useState<number>(1500);
    const [inverted, setInverted] = React.useState<boolean>(false);
    const [playing, setPlaying] = React.useState<boolean>(false);

    function handleLambdaChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newLambda = event.target.valueAsNumber;
        setLambda(newLambda);
        setWidth(Math.min(width, newLambda));
    }
    function handleFreqChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newLambda = 1e6 / event.target.valueAsNumber;
        setLambda(newLambda);
        setWidth(width * newLambda / lambda);
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

    React.useEffect(() => {
        audioContextRef.current = new AudioContext();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    React.useEffect(() => {
        if (!audioContextRef.current) {
            return;
        }
        if (!playing) {
            audioContextRef.current.suspend();
            return;
        }

        audioContextRef.current.resume();

        sourceRef.current?.stop();
        sourceRef.current?.disconnect();

        const sampleRate = audioContextRef.current.sampleRate;
        const loopLength = Math.floor(sampleRate * lambda / 1e6);
        if (loopLength < 1) {
            return;
        }
        const buffer = new AudioBuffer({
            length: loopLength,
            numberOfChannels: inverted ? 2 : 1,
            sampleRate: sampleRate,
        });
        buffer.getChannelData(0).fill(1).fill(-1, width / 1e6 * sampleRate);
        inverted && buffer.getChannelData(1).fill(-1).fill(1, width / 1e6 * sampleRate);
        sourceRef.current = new AudioBufferSourceNode(audioContextRef.current, { buffer: buffer, loop: true });

        sourceRef.current.connect(audioContextRef.current.destination);
        sourceRef.current.start();
    }, [lambda, width, inverted, playing]);

    return (
        <>
            <h1>パルス幅変調再生器</h1>
            <div>
                <label>波長</label> <input type="number" value={Math.round(lambda)} min={1e6 / freqMax} max={1e6 / freqMin} step={100} onChange={handleLambdaChange} /> μs,
                <label>周波数</label> <input type="number" value={Math.round(1e6 / lambda)} min={freqMin} max={freqMax} step={1} onChange={handleFreqChange} /> Hz
            </div>
            <div>
                <label>パルス幅</label> <input type="number" value={Math.round(width)} min={0} max={Math.ceil(lambda)} step={100} onChange={handlePulseChange} /> μs,
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
