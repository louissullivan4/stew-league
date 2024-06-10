const { RiotApi, LolApi, Constants } = require('twisted')
const config = require('./config.json')

const riotApi = new RiotApi(config.apiKey)
const lolApi = new LolApi(config.apiKey)

async function getAccountInfo() {
   const resByRiotId = (await riotApi.Account.getByRiotId(config.summonerName, config.tagLine, Constants.RegionGroups.EUROPE)).response
   return resByRiotId.puuid
}

async function getMatchIds(puuid = config.puuid) {
    const matchIdsList = (await lolApi.MatchV5.list(puuid, Constants.RegionGroups.EUROPE, { start: 0, count: 10 })).response
    return matchIdsList
}

async function getMatchInfo(matchId) {
    const matchInfo = (await lolApi.MatchV5.get(matchId, Constants.RegionGroups.EUROPE)).response
    return matchInfo
}

async function getMatchInfoList(matchIdsList) {
    let matchInfoList = []
    for (let i = 0; i < matchIdsList.length; i++) {
        let matchInfo = await getMatchInfo(matchIdsList[i])
        matchInfoList.push(matchInfo)
        
    }
    return matchInfoList
}

async function getMatchTimeline(matchId) {
    const matchInfo = (await lolApi.MatchV5.timeline(matchId, Constants.RegionGroups.EUROPE)).response
    return matchInfo
}

async function getMatchTimelineList() {
    let matchIdsList = JSON.parse(fs.readFileSync('data/matchesList.json'));
    let matchInfoList = []
    for (let i = 0; i < matchIdsList.length; i++) {
        let matchInfo = await getMatchTimeline(matchIdsList[i])
        matchInfoList.push(matchInfo)
        
    }
    return matchInfoList
}

module.exports = {
    getAccountInfo,
    getMatchIds,
    getMatchInfo,
    getMatchInfoList,
    getMatchTimeline,
    getMatchTimelineList
}