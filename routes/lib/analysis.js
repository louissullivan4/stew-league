const fs = require('fs');
const { convertToTime } = require('../utils/gf');

const config = require('../../config.json');

/**
 * Imports data from a file and returns it as a JSON object.
 * @param {string} [fileName='data/matchTimeline-1.json'] - The name of the file to import data from.
 * @returns {Object} The imported data as a JSON object.
 */
function importData(fileName = 'data/matchTimeline-1.json') {
    try {
        const data = fs.readFileSync(fileName);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${fileName}:`, error);
        process.exit(1);
    }
}

/**
 * Retrieves the player ID based on the provided target PUUID.
 * If no target PUUID is provided, it uses the default PUUID from the config.
 *
 * @param {string} [targetPuuid=config.puuid] - The target PUUID to search for.
 * @returns {number} - The player ID found.
 */
function getPlayer(targetPuuid = config.puuid) {
    let playerId = null;
    const timelineData = importData();
    timelineData.metadata.participants.forEach((puuid, idx) => {
        if (puuid === targetPuuid) {
            playerId = idx + 1;
        }
    });

    if (!playerId) {
        console.error("Participant ID not found for the provided PUUID.");
        process.exit(1);
    }
    console.log("Player ID found:", playerId);
    return playerId;
}

/**
 * Assigns players to teams based on the participant data.
 * @returns {Object} - An object mapping participant IDs to team IDs.
 */
function assignPlayersTeam() {
    const participantToTeamMap = {};
    try {
        const timelineData = importData();
        timelineData.metadata.participants.forEach((puuid, idx) => {
            const participantId = idx + 1;
            participantToTeamMap[participantId] = participantId <= 5 ? 100 : 200;
        });
    } catch (error) {
        console.error("Error assigning players to teams:", error);
    }
    return participantToTeamMap;
}

/**
 * Creates a KDA (Kill-Death-Assist) timeline based on the imported data.
 * @returns {Array} An array of events representing kills, deaths, and assists.
 */
function createKdaTimeline() {
    try {
        const timelineData = importData();
        const playerId = getPlayer();
        const participantToTeamMap = assignPlayersTeam();
        const targetTeamId = participantToTeamMap[playerId];
        const events = [];

        timelineData.info.frames.forEach((frame) => {
            frame.events.forEach((event) => {
                if (event.type === 'CHAMPION_KILL') {
                    if (event.killerId === playerId || event.victimId === playerId || (event.assistingParticipantIds && event.assistingParticipantIds.includes(playerId))) {
                        const position = frame.participantFrames[playerId.toString()].position;
                        const eventInfo = {
                            type: event.killerId === playerId ? 'kill' : event.victimId === playerId ? 'death' : 'assist',
                            timestamp: convertToTime(event.timestamp),
                            position: position,
                            participants: frame.participantFrames,
                            killerId: event.killerId,
                            victimId: event.victimId,
                            assistingParticipantIds: event.assistingParticipantIds || [],
                            teamId: targetTeamId
                        };
                        events.push(eventInfo);
                        console.log("Event added:", eventInfo);
                    }
                }
            });
        });
        return events;
    } catch (error) {
        console.error("Error creating KDA timeline:", error);
    }
}

module.exports = {
    importData,
    getPlayer,
    assignPlayersTeam,
    createKdaTimeline
};
