const wiki = require('wikijs').default;

//this would choose to either join or create a game
module.exports.getGame = (req, res) => {
    wiki()
        .page('Ape')
        .then(page => page.content())
        .then(content => {
            let contentArray = content.split(" ");
            let contentLength = contentArray.length;
            let excerptLength = 50;
            let randomWord = Math.floor(Math.random() * contentLength - excerptLength);
            let excerpt = "";
            let index = randomWord;
            while (!contentArray[index].includes('.')) {
                index++;
            }
            index++;
            for (let i = index; i < excerptLength + randomWord; i++) {
                if (!contentArray[i].includes('=')) {
                    excerpt += " " + contentArray[i];
                }
                if (i === excerptLength + randomWord - 1) {
                    let index = i;
                    do {
                        index++;
                        if (contentArray[index].includes('=')) {
                            contentArray[index].replace(/=/gi, '');
                        }
                        excerpt += " " + contentArray[index];
                    } while (!contentArray[index].includes('.'));
                }
            }
            res.render('game', {
                excerpt: excerpt
            });
        });
}