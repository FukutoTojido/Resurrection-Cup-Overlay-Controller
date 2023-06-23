import { useContext, useRef } from "react";

import "../styles/CurrentPosition.css";

import { ControllerDataContext } from "../App";

const Input = (props) => {
    const controllerData = useContext(ControllerDataContext);
    return (
        <div className="row input">
            <div className="label">Team {props.pos}</div>
            <button onClick={() => {
                controllerData.setShowTeamSelector({
                    show: true,
                    forTeam: props.pos
                })
            }}>
                {controllerData[`team${props.pos}`] === -1
                    ? "Select Team"
                    : controllerData.mappoolData.teamList[controllerData[`team${props.pos}`]].teamName}
            </button>
        </div>
    );
};

const Bans = (props) => {
    const controllerData = useContext(ControllerDataContext);
    const inputRef = useRef(null);

    const changePos = (action) => {
        const clamp = (val) => {
            if (val === "") return 0;
            // console.log(val, Math.ceil((controllerData.mappoolData?.bestOf + 1) / 2));
            return Math.max(0, Math.min(parseInt(val), Math.ceil((controllerData.mappoolData?.bestOf + 1) / 2) - 1));
        };

        const currentNBans = controllerData.nBans;
        const currentVal = clamp(inputRef?.current.value);

        switch (action) {
            case "inc":
                controllerData.setNBans(Math.max(0, currentNBans + 1));
                if (inputRef) inputRef.current.value = Math.max(currentNBans + 1);
                break;
            case "dec":
                controllerData.setNBans(Math.max(0, currentNBans - 1));
                if (inputRef) inputRef.current.value = Math.max(currentPos - 1);
                break;
            case "val":
                controllerData.setNBans(Math.max(0, currentVal));
                if (inputRef) inputRef.current.value = Math.max(0, currentVal);
                break;
        }
    };

    return (
        <div className="row">
            <div className="label">Number of Bans</div>
            <button
                onClick={() => {
                    changePos("dec");
                }}
            >
                <div className="button minus"></div>
            </button>
            <input ref={inputRef} type="number" value={controllerData.nBans} onChange={() => changePos("val")} />
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

const OverlayNavigator = (props) => {
    return (
        <div className="container currentPosition">
            <div className="content">
                <Input pos="Left" />
                <Input pos="Right" />
                <Bans />
            </div>
        </div>
    );
};

export default OverlayNavigator;
