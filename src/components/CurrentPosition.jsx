import { useContext, useRef } from "react";

import "../styles/CurrentPosition.css";

import { ControllerDataContext } from "../App";

const CurrentPosition = (props) => {
    const controllerData = useContext(ControllerDataContext);
    const inputRef = useRef(null);

    const changePos = (action) => {
        const clamp = (val) => {
            if (val === "") return 0;
            // console.log(val, Math.ceil((controllerData.mappoolData?.bestOf + 1) / 2));
            return Math.max(0, Math.min(parseInt(val), Math.ceil((controllerData.mappoolData?.bestOf + 1) / 2) - 1));
        };

        const currentPos = controllerData.naviStatus.pos;
        const currentVal = clamp(inputRef?.current.value);

        switch (action) {
            case "inc":
                controllerData.setNaviStatus({ ...controllerData.naviStatus, pos: clamp(currentPos + 1) });
                if (inputRef) inputRef.current.value = clamp(currentPos + 1);
                break;
            case "dec":
                controllerData.setNaviStatus({ ...controllerData.naviStatus, pos: clamp(currentPos - 1) });
                if (inputRef) inputRef.current.value = clamp(currentPos - 1);
                break;
            case "val":
                controllerData.setNaviStatus({ ...controllerData.naviStatus, pos: currentVal });
                if (inputRef) inputRef.current.value = currentVal;
                break;
        }
    };

    return (
        <div className="row">
            <div className="label">Current Position</div>
            <button
                onClick={() => {
                    changePos("dec");
                }}
            >
                <div className="button minus"></div>
            </button>
            <input ref={inputRef} type="number" value={controllerData.naviStatus.pos} onChange={() => changePos("val")} />
            <button
                onClick={() => {
                    changePos("inc");
                }}
            >
                <div className="button plus"></div>
            </button>
        </div>
    );
};

const CurrentTeam = (props) => {
    const controllerData = useContext(ControllerDataContext);

    const switchTeam = () => {
        if (controllerData.naviStatus.team === "left") controllerData.setNaviStatus({ ...controllerData.naviStatus, team: "right" });
        else controllerData.setNaviStatus({ ...controllerData.naviStatus, team: "left" });
    };

    return (
        <div className="row">
            <div className="label">Current Team</div>
            <button onClick={switchTeam}>
                <div className="button back"></div>
            </button>
            <div className="value">{controllerData.naviStatus.team[0].toUpperCase() + controllerData.naviStatus.team.slice(1)}</div>
            <button onClick={switchTeam}>
                <div className="button next"></div>
            </button>
        </div>
    );
};

const CurrentPhase = (props) => {
    const controllerData = useContext(ControllerDataContext);

    const switchPhase = () => {
        if (controllerData.naviStatus.phase === "Banning Phase") controllerData.setNaviStatus({ ...controllerData.naviStatus, phase: "Picking..." });
        else controllerData.setNaviStatus({ ...controllerData.naviStatus, phase: "Banning Phase" });
    };

    return (
        <div className="row">
            <div className="label">Current Phase</div>
            <button onClick={switchPhase}>
                <div className="button back"></div>
            </button>
            <div className="value">{controllerData.naviStatus.phase}</div>
            <button onClick={switchPhase}>
                <div className="button next"></div>
            </button>
        </div>
    );
};

const OverlayNavigator = (props) => {
    return (
        <div className="container currentPosition">
            <div className="content">
                <CurrentPhase />
                <CurrentTeam />
                <CurrentPosition />
            </div>
        </div>
    );
};

export default OverlayNavigator;
