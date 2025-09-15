import React from "react";

interface Props {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    value: number;
    setValue: (value: number) => void;
    onchange?: (value: number) => void;
    children?: React.ReactNode;
}

function Slider({
    min = 0,
    max = 24,
    step = 1,
    value,
    setValue,
    onchange,
    children,
}: Props) {
    return (
        <>
            <input
                type="range"
                className="form-range"
                min={min}
                max={max}
                step={step}
                id="customRange"
                list="tickmarks"
                onChange={(e) => {
                    setValue(Number(e.target.value));
                    if (onchange) onchange(Number(e.target.value));
                }}
                value={value}
            />
            <datalist id="tickmarks">
                {Array.from(
                    { length: Math.floor((max - min) / step) + 1 },
                    (_, i) => (
                        <option key={i} value={min + i * step} />
                    )
                )}
            </datalist>
            <div>
                {children ? <>{children} </> : "Value: "}
                {value}
            </div>
        </>
    );
}

export default Slider;
