const colyseus = require('colyseus');
const request = require('request');
const leaderboard_db = require('../models/leaderboard');

module.exports = class TypeRoom extends colyseus.Room {

    onInit(options) {
        this.maxClients = 4;
        this.setState({
            gameStart: false,
            timeToStart: 10,
            playersFinished: 0,
            numPlayers: 0,
            excerpt: '',
            players: {},
            creatorId: null,
            timerStart: false
        });
        this.generateExcerpt(options.private);
    }

    onJoin(client, options) {
        if (!this.state.players[client.id]) {
            this.state.players[client.id] = {
                playerName: options.name,
                wpm: 0,
                finished: false,
                playerWordAt: 0,
                charactersTraversed: 0,
                percentageTraversed: 0,
                place: 0
            }
            if (this.state.numPlayers === 0) {
                this.state.creatorId = client.id;
            }
            this.state.numPlayers++;
            if (this.state.numPlayers === 4) {
                this.lock();
            }
        }
    }

    requestJoin(options, isNew) {
        if (this.state.numPlayers === 4) {
            return false;
        } else {
            if (!options.private) {
                return true;
            } else {
                if (!options.create) {
                    if (isNew) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    if (isNew) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    }

    onMessage(client, data) {
        let player = this.state.players[client.id];
        if (!player.finished) { 
            if (data.name) {
                player.playerName = data.name;
            }
            if (data.timerStart && !this.state.timerStart) {
                if (client.id === this.state.creatorId) {
                    this.startRoomClock();
                }
            }
            if (data.wordInput) {
                let word = data.wordInput.replace(/\s/g, '');
                if (player.playerWordAt < this.state.excerptArray.length - 1) {
                    console.log(word);
                    if (word === this.state.excerptArray[player.playerWordAt]) {
                        player.charactersTraversed += word.length;
                        player.percentageTraversed = player.playerWordAt / (this.state.excerptArray.length - 1);
                        player.playerWordAt++;
                        let numWords = player.charactersTraversed / 4.84; //gets number of words traversed based on average
                        let timeSec = this.clock.elapsedTime / 1000; //time since game started
                        player.wpm = (numWords / timeSec) * 60; //gets words per minute
                        console.log(player.wpm);
                    } 
                } else {
                    player.finished = true;
                    this.state.playersFinished++;
                    player.place = this.state.playersFinished;
                    leaderboard_db.addToLeaderboard(player.playerName, player.wpm);
                }
            }
            // if (data.htmlId) {
            //     let nameToSend = this.state.players[data.clientId].playerName;
            // }
        }
    }

    onLeave(client) {
        let player = this.state.players[client.id];
        if (!player.finished) {
            player.wpm = 0;
        }
    }

    generateExcerpt(isPrivate) {
        let url = 'http://www.gutenberg.org/files/10843/10843-8.txt';
        request(url, {json: true}, (err, res, body) => {
            if (!err) {
                let sentenceArray = body.match( /[^\.!\?]+[\.!\?]+/g );
                let i = Math.floor(Math.random() * sentenceArray.length);
                let primates = ['ape', 'monkey', 'chimp', 'orang'];
                let containsPhrase = false;
                while(!containsPhrase) {
                    let sentence = sentenceArray[i % sentenceArray.length];
                    primates.forEach(primate => {
                        if (sentence.includes(primate) && containsPhrase === false) {
                            containsPhrase = true;
                            this.state.excerpt = sentence;
                            this.state.excerptArray = sentence.split(/[\s\n\r]+/);
                            this.state.excerptArray.shift(); //gets rid of empty char in the beginning
                        }
                    });
                    i++;
                }
                if (!isPrivate) {
                    this.startRoomClock();
                }
            } else {
                this.state.excerpt = "Error";
                this.state.excerptArray = "Error"
            }   
        });
    }

    startRoomClock () {
        this.state.timerStart = true;
        this.clock.setInterval(() => {
            if (this.state.timeToStart === 0) {
                this.state.gameStart = true;
                this.clock.clear();
                this.clock.start();
            } else {
                this.state.timeToStart--;
            }
            if (this.state.timeToStart === 3) {
                this.lock();
            }
        }, 1000);
    }
}