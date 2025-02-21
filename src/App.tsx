import React from 'react';

const freqMin = 20;
const freqMax = 20000;

function PwmGenerator() {

    const audioContextRef = React.useRef<AudioContext>(undefined);
    const sourceRef = React.useRef<AudioBufferSourceNode>(undefined);

    const [waveMs, setWaveMs] = React.useState<number>(20000);
    const [pulseMs, setPulseMs] = React.useState<number>(1500);
    const [inverted, setInverted] = React.useState<boolean>(false);
    const [playing, setPlaying] = React.useState<boolean>(false);
    const [cutDc, setCutDc] = React.useState<boolean>(true);

    function handleLambdaChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newLambda = event.target.valueAsNumber;
        setWaveMs(newLambda);
        setPulseMs(Math.min(pulseMs, newLambda));
    }
    function handleFreqChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newLambda = 1e6 / event.target.valueAsNumber;
        setWaveMs(newLambda);
        setPulseMs(pulseMs * newLambda / waveMs);
    }
    function handlePulseChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPulseMs(event.target.valueAsNumber);
    }
    function handleDutyChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPulseMs(waveMs * event.target.valueAsNumber / 100);
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
        const waveSamples = Math.floor(sampleRate * waveMs / 1e6);
        if (waveSamples < 1) {
            return;
        }
        const pulseSamples = Math.floor(sampleRate * pulseMs / 1e6);

        let highLevel = 1;
        let lowLevel = -1;
        if (cutDc) {
            if (pulseSamples < waveSamples / 2) {
                highLevel = 1;
                lowLevel = -pulseSamples / (waveSamples - pulseSamples);
            } else {
                highLevel = (waveSamples - pulseSamples) / pulseSamples;
                lowLevel = -1;
            }
        }
        const buffer = new AudioBuffer({
            length: waveSamples,
            numberOfChannels: inverted ? 2 : 1,
            sampleRate: sampleRate,
        });
        buffer.getChannelData(0).fill(highLevel).fill(lowLevel, pulseSamples);
        inverted && buffer.getChannelData(1).fill(lowLevel).fill(highLevel, pulseSamples);
        sourceRef.current = new AudioBufferSourceNode(audioContextRef.current, { buffer: buffer, loop: true });

        sourceRef.current.connect(audioContextRef.current.destination);
        sourceRef.current.start();
    }, [waveMs, pulseMs, inverted, playing, cutDc]);

    return (
        <>
            <h1>パルス幅変調再生器</h1>
            <div>
                <label>波長</label> <input type="number" value={Math.round(waveMs)} min={1e6 / freqMax} max={1e6 / freqMin} step={100} onChange={handleLambdaChange} /> μs,
                <label>周波数</label> <input type="number" value={Math.round(1e6 / waveMs)} min={freqMin} max={freqMax} step={1} onChange={handleFreqChange} /> Hz
            </div>
            <div>
                <label>パルス幅</label> <input type="number" value={Math.round(pulseMs)} min={0} max={Math.ceil(waveMs)} step={100} onChange={handlePulseChange} /> μs,
                <label>デューティ比</label> <input type="number" value={Math.round(pulseMs / waveMs * 100 * 10) / 10} min={0} max={100} step={0.5} onChange={handleDutyChange} /> %
            </div>
            <div>
                <label>右チャンネルを反転</label> <input type="checkbox" checked={inverted} onChange={(event) => setInverted(event.target.checked)} />
            </div>
            <div>
                <label>直流成分をカット</label> <input type="checkbox" checked={cutDc} onChange={(event) => setCutDc(event.target.checked)} />
            </div>
            <div>
                {playing
                    ? <button onClick={() => setPlaying(false)}>停止</button>
                    : <button onClick={() => setPlaying(true)}>再生</button>}
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
