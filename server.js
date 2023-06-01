// Import express, expressWs, and http
const express = require("express");
const expressWs = require("express-ws");
const http = require("http");

const elecApp = require("electron").app;
const fs = require("fs");

const initialJson = JSON.parse(fs.readFileSync(`${elecApp.getPath("userData")}/config.json`, "utf-8"));

let app = express();
let port = 3727;
let server = http.createServer(app).listen(port);

// Apply expressWs
const wss = expressWs(app, server);
let confirmInit = false;

// This lets the server pick up the '/ws' WebSocket route
app.ws("/ws", async function (ws, req) {
    // After which we wait for a message and respond to it
    console.log("A client connected");

    ws.on("message", async (message) => {
        console.log(message);
        const mes = JSON.parse(message);

        switch (mes.type) {
            case "initController":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "initController",
                        data: initialJson,
                    });

                    client.send(retMes);
                });
                break;
            case "setOverlay":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "setOverlay",
                        data: mes.data,
                    });

                    client.send(retMes);
                });
                break;
            case "setPoolStatus":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "setPoolStatus",
                        data: mes.data,
                    });

                    client.send(retMes);
                });
                break;
            case "setNaviStatus":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "setNaviStatus",
                        data: mes.data,
                    });

                    client.send(retMes);
                });
                break;
            case "confirmInit":
                wss.getWss().clients.forEach((client) => {
                    confirmInit = true;
                    const retMes = JSON.stringify({
                        type: "confirmInit",
                    });

                    client.send(retMes);
                });
                break;
            case "askInit":
                if (confirmInit)
                    wss.getWss().clients.forEach((client) => {
                        const retMes = JSON.stringify({
                            type: "confirmInit",
                        });

                        client.send(retMes);
                    });
                break;
                break;
            case "fetchData":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "fetchData",
                    });

                    client.send(retMes);
                });
                break;
            case "setMap":
                wss.getWss().clients.forEach((client) => {
                    const retMes = JSON.stringify({
                        type: "fetchData",
                    });

                    client.send(retMes);
                });
                break;
        }
    });
});
