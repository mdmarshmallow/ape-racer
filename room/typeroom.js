const colyseus = require('colyseus');
const request = require('request');

module.exports = class TypeRoom extends colyseus.Room {

    onInit() {
        this.maxClients = 4;
        this.setState({
            gameStart: false,
            timeToStart: 10,
            playersFinished: 0,
            numPlayers: 0,
            excerpt: '',
            players: {}
        });
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
        this.generateExcerpt();
    }

    onJoin(client) {
        this.state.players[client.sessionId] = {
            playerName: null,
            wpm: 0,
            finished: false,
            playerWordAt: 0,
            charactersTraversed: 0,
            percentageTraversed: 0,
            place: 0
        }
        this.state.numPlayers++;
        if (this.state.numPlayers === 4) {
            this.lock();
        }
    }

    requestJoin() {
        if (this.state.numPlayers === 4) {
            return false;
        } else {
            return true;
        }
    }

    onMessage(client, data) {
        let player = this.state.players[client.sessionId];
        if (!player.finished) { 
            if (data.name) {
                player.playerName = data.name;
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
                    //TODO: check score against leaderboard here
                }
            }
        }
    }

    onLeave(client) {
        let player = this.state.players[client.sessionId];
        if (!player.finished) {
            player.wpm = 0;
        }
    }

    generateExcerpt() {
        let url = 'http://www.gutenberg.org/files/10843/10843-8.txt';
        request(url, {json: true}, (err, res, body) => {
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
        });
    }
}