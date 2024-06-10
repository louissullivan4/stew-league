const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { createKdaTimeline, assignPlayersTeam, getPlayer } = require('../lib/analysis');

const mapWidth = 512;
const mapHeight = 512;
const mapImagePath = 'assets/lol-map.png';
const outputImagePath = 'output/multiple_maps_positions.png';
const mapsPerRow = 3;

function mapCoordinates(position) {
    return {
        x: (position.x / 15000) * mapWidth,
        y: mapHeight - (position.y / 15000) * mapHeight
    };
}

function drawEvent(event, ctx, xOffset, yOffset, participantToTeamMap, participantId) {
    ctx.fillStyle = 'green';
    const playerPos = mapCoordinates(event.position);
    ctx.beginPath();
    ctx.arc(playerPos.x + xOffset, playerPos.y + yOffset, 5, 0, 2 * Math.PI);
    ctx.fill();

    for (let key in event.participants) {
        const pos = mapCoordinates(event.participants[key].position);
        const participantTeamId = participantToTeamMap[parseInt(key)];
        if (parseInt(key) === participantId) continue;

        if (parseInt(key) === event.victimId) {
            ctx.fillStyle = 'purple';
        } else if (participantTeamId === participantToTeamMap[participantId]) {
            ctx.fillStyle = 'blue';
        } else {
            ctx.fillStyle = 'red';
        }

        ctx.beginPath();
        ctx.arc(pos.x + xOffset, pos.y + yOffset, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function main() {
    const events = createKdaTimeline();
    const participantToTeamMap = assignPlayersTeam();
    const participantId = getPlayer();

    const numRows = Math.ceil(events.length / mapsPerRow);
    const canvasWidth = mapsPerRow * mapWidth;
    const canvasHeight = numRows * mapHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    loadImage(mapImagePath).then((image) => {
        events.forEach((event, index) => {
            const xOffset = (index % mapsPerRow) * mapWidth;
            const yOffset = Math.floor(index / mapsPerRow) * mapHeight;
            ctx.drawImage(image, xOffset, yOffset, mapWidth, mapHeight);
            drawEvent(event, ctx, xOffset, yOffset, participantToTeamMap, participantId);
        });

        const out = fs.createWriteStream(outputImagePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`The map with multiple events was created.`));
    }).catch((error) => {
        console.error("Error loading the map image:", error);
    });
}

main();