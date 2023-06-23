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
    const [bestOf, setBestOf] = useState(3);
    const [nBans, setNBans] = useState(1);
    const [mappoolData, setMappoolData] = useState({});
    const [poolStatus, setPoolStatus] = useState({});
    const [naviStatus, setNaviStatus] = useState({
        phase: "Banning Phase",
        team: "left",
        pos: 0,
    });

    const [selected, setSelected] = useState({});

    const gosuWS = useWebSocket("ws://127.0.0.1:24050/ws", {
        onOpen: () => {
            console.log("gosumemory connected");
        },
        onMessage: (event) => {
            const data = JSON.parse(event.data);
            if (data.tourney.manager.bestOF !== bestOf) setBestOf(data.tourney.manager.bestOF < 3 ? 3 : data.tourney.manager.bestOF);
        },
        shouldReconnect: (closeEvent) => true,
    });

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
                            ban: [...Array(nBans).keys()].map((n) => {
                                return {};
                            }),
                            pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
                                return {};
                            }),
                        },
                        right: {
                            ban: [...Array(nBans).keys()].map((n) => {
                                return {};
                            }),
                            pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
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
                                bestOf: bestOf,
                                nBans: nBans,
                                status: {
                                    poolStatus,
                                    naviStatus,
                                },
                            },
                        },
                        false
                    );
                    break;
                case "updateJson":
                    setMappoolData(mes.data);
                    setPoolStatus({
                        left: {
                            ban: [...Array(nBans).keys()].map((n) => {
                                if (!poolStatus.left.ban[n]) return {};
                                if (JSON.stringify(poolStatus.left.ban[n]) !== "{}") {
                                    const mod = poolStatus.left.ban[n].mapIndex.slice(0, 2);
                                    const idx = poolStatus.left.ban[n].mapIndex.at(-1);

                                    return {
                                        ...poolStatus.left.ban[n],
                                        beatmapData: mes.data.pool[mod][idx - 1],
                                    };
                                }
                                return {};
                            }),
                            pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
                                if (!poolStatus.left.pick[n]) return {};
                                if (JSON.stringify(poolStatus.left.pick[n]) !== "{}") {
                                    const mod = poolStatus.left.pick[n].mapIndex.slice(0, 2);
                                    const idx = poolStatus.left.pick[n].mapIndex.at(-1);

                                    return {
                                        ...poolStatus.left.pick[n],
                                        beatmapData: mes.data.pool[mod][idx - 1],
                                    };
                                }
                                return {};
                            }),
                        },
                        right: {
                            ban: [...Array(nBans).keys()].map((n) => {
                                if (!poolStatus.right.ban[n]) return {};
                                if (JSON.stringify(poolStatus.right.ban[n]) !== "{}") {
                                    const mod = poolStatus.right.ban[n].mapIndex.slice(0, 2);
                                    const idx = poolStatus.right.ban[n].mapIndex.at(-1);

                                    return {
                                        ...poolStatus.right.ban[n],
                                        beatmapData: mes.data.pool[mod][idx - 1],
                                    };
                                }
                                return {};
                            }),
                            pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
                                if (!poolStatus.right.pick[n]) return {};
                                if (JSON.stringify(poolStatus.right.pick[n]) !== "{}") {
                                    const mod = poolStatus.right.pick[n].mapIndex.slice(0, 2);
                                    const idx = poolStatus.right.pick[n].mapIndex.at(-1);

                                    return {
                                        ...poolStatus.right.pick[n],
                                        beatmapData: mes.data.pool[mod][idx - 1],
                                    };
                                }
                                return {};
                            }),
                        },
                        tb: poolStatus.tb,
                    });
                    setNaviStatus({
                        phase: "Banning Phase",
                        team: "left",
                        pos: 0,
                    });
                    break;
                case "setWinner":
                    if (naviStatus.phase !== "Picking...") break;
                    const temp = { ...poolStatus };
                    temp[naviStatus.team].pick[naviStatus.pos - 1].winner = mes.data.winner;
                    setPoolStatus(temp);
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
        if (connectStatus) {
            ws.sendJsonMessage({ type: "initController" }, false);
        }
    }, [connectStatus]);

    useEffect(() => {
        setPoolStatus({
            left: {
                ban: [...Array(nBans).keys()].map((n) => {
                    if (!poolStatus.left?.ban[n]) return {};
                    if (JSON.stringify(poolStatus?.left.ban[n]) !== "{}") {
                        const mod = poolStatus.left?.ban[n].mapIndex.slice(0, 2);
                        const idx = poolStatus.left?.ban[n].mapIndex.at(-1);

                        return {
                            ...poolStatus.left?.ban[n],
                            beatmapData: mappoolData.pool[mod][idx - 1],
                        };
                    }
                    return {};
                }),
                pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
                    if (!poolStatus.left?.pick[n]) return {};
                    if (JSON.stringify(poolStatus.left?.pick[n]) !== "{}") {
                        const mod = poolStatus.left?.pick[n].mapIndex.slice(0, 2);
                        const idx = poolStatus.left?.pick[n].mapIndex.at(-1);

                        return {
                            ...poolStatus.left?.pick[n],
                            beatmapData: mappoolData.pool[mod][idx - 1],
                        };
                    }
                    return {};
                }),
            },
            right: {
                ban: [...Array(nBans).keys()].map((n) => {
                    if (!poolStatus.right?.ban[n]) return {};
                    if (JSON.stringify(poolStatus.right?.ban[n]) !== "{}") {
                        const mod = poolStatus.right?.ban[n].mapIndex.slice(0, 2);
                        const idx = poolStatus.right?.ban[n].mapIndex.at(-1);

                        return {
                            ...poolStatus.right?.ban[n],
                            beatmapData: mappoolData.pool[mod][idx - 1],
                        };
                    }
                    return {};
                }),
                pick: [...Array(Math.ceil((bestOf - 1) / 2)).keys()].map((n) => {
                    if (!poolStatus.right?.pick[n]) return {};
                    if (JSON.stringify(poolStatus.right.pick[n]) !== "{}") {
                        const mod = poolStatus.right?.pick[n].mapIndex.slice(0, 2);
                        const idx = poolStatus.right?.pick[n].mapIndex.at(-1);

                        return {
                            ...poolStatus.right?.pick[n],
                            beatmapData: mappoolData.pool[mod][idx - 1],
                        };
                    }
                    return {};
                }),
            },
            tb: poolStatus.tb,
        });
        setNaviStatus({
            phase: "Banning Phase",
            team: "left",
            pos: 0,
        });
    }, [bestOf, nBans]);

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
            if (e.key === "F12") app.ipcRenderer.send("openDevTools");
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
                          bestOf,
                          nBans,
                          setNBans
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
