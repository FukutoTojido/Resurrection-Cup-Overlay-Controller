import { useState, createContext, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
const app = window.require("electron");

import "./App.css";

import OverlayNavigator from "./components/CurrentPosition";
import Maplist from "./components/Maplist";
import StatusBoard from "./components/StatusBoard";
import Notes from "./components/Notes";

const WS_URL = "ws://localhost:3727/ws";
const ControllerDataContext = createContext();

function App() {
    const [connectStatus, setConnectStatus] = useState(false);
    const [isInit, setIsInit] = useState(false);
    const [mappoolData, setMappoolData] = useState({});
    const [poolStatus, setPoolStatus] = useState({});
    const [naviStatus, setNaviStatus] = useState({
        phase: "Banning Phase",
        team: "left",
        pos: 0,
    });

    const [selected, setSelected] = useState({});

    let ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected");
            setConnectStatus(true);
        },
        onMessage: (event) => {
            console.log(JSON.parse(event.data));
            if (event.data[0] !== "{") return;

            const mes = JSON.parse(event.data);

            switch (mes.type) {
                case "initController":
                    // setMappoolData({
                    //     bestOf: mes.data.bestOf,
                    //     nBans: mes.data.nBans,
                    //     pool: {},
                    // });

                    setMappoolData(mes.data);

                    setPoolStatus({
                        left: {
                            ban: [...Array(mes.data.nBans).keys()].map((n) => {
                                return {};
                            }),
                            pick: [...Array((mes.data.bestOf - 1) / 2).keys()].map((n) => {
                                return {};
                            }),
                        },
                        right: {
                            ban: [...Array(mes.data.nBans).keys()].map((n) => {
                                return {};
                            }),
                            pick: [...Array((mes.data.bestOf - 1) / 2).keys()].map((n) => {
                                return {};
                            }),
                        },
                        tb: {
                            pick: [{}],
                        },
                    });

                    ws.sendJsonMessage({ type: "confirmInit" }, false);
                    setIsInit(true);
                    break;
                case "fetchData":
                    ws.sendJsonMessage(
                        {
                            type: "setOverlay",
                            data: {
                                bestOf: mappoolData.bestOf,
                                nBans: mappoolData.nBans,
                                status: {
                                    poolStatus,
                                    naviStatus,
                                },
                            },
                        },
                        false
                    );
                    break;
            }
        },
        onClose: () => {
            setConnectStatus(false);
            setIsInit(false);
            console.log("WebSocket disconnected");
        },
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (connectStatus) ws.sendJsonMessage({ type: "initController" }, false);
    }, [connectStatus]);

    // useEffect(() => {
    //     console.log(selected);
    // }, [JSON.stringify(selected)]);

    useEffect(() => {
        console.log(poolStatus);
        ws.sendJsonMessage(
            {
                type: "setPoolStatus",
                data: poolStatus,
            },
            false
        );
    }, [JSON.stringify(poolStatus)]);

    useEffect(() => {
        console.log(naviStatus);
        ws.sendJsonMessage(
            {
                type: "setNaviStatus",
                data: naviStatus,
            },
            false
        );
    }, [JSON.stringify(naviStatus)]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "F12")
                app.ipcRenderer.send("openDevTools");
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const openConfig = () => {
        // shell.openPath("C:\\");
        app.ipcRenderer.send("openFolder");
    };

    return (
        <ControllerDataContext.Provider
            value={
                isInit
                    ? {
                          mappoolData,
                          setMappoolData,
                          poolStatus,
                          setPoolStatus,
                          selected,
                          setSelected,
                          naviStatus,
                          setNaviStatus,
                      }
                    : null
            }
        >
            {isInit ? (
                <>
                    <div className="title">Resurrection Cup - Streamer Dashboard</div>
                    <button className="openConfig" onClick={openConfig}>
                        Open config folder
                    </button>
                    <div className="leftSection">
                        <OverlayNavigator />
                        <Notes />
                    </div>
                    <Maplist />
                    <StatusBoard />
                </>
            ) : (
                ""
            )}
        </ControllerDataContext.Provider>
    );
}

export default App;
export { ControllerDataContext };
