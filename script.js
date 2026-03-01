import {Game, Player} from './main.js'

const p1 = new Player(1)
const p2 = new Player(2)
const p3 = new Player(3)
const g = new Game([p1, p2, p3])

const discardPileTopCard = document.getElementById('discard-pile')
const drawPileTopCard = document.getElementById('draw-pile')
const currPlayerDiv = document.getElementById('curr-player')
const player1cards = document.getElementById('player1cards');
const player2cards = document.getElementById('player2cards');
const player3cards = document.getElementById('player3cards');
const nextbtn = document.getElementById('btn-next');
const loadbtn = document.getElementById('btn-load')

nextbtn.addEventListener('click', ()=>{next()})
loadbtn.addEventListener('click', ()=> {
    load();
    loadbtn.innerText = "reload";
})

function next(){
    load()

    const playableCards = g.getPlayableCards();
    if (playableCards.length === 0) {
        currPlayerDiv.innerText = "no playable cards for curr player.. drawing a card.."
        g.playTurn();
    }
    else {
        let promptMsg = ''
        for (let i = 0; i < playableCards.length; i++) promptMsg += ` ${playableCards[i].toString()},`
        const index = prompt(`playable cards: ${promptMsg}`)
        g.playTurn(playableCards[index])
        currPlayerDiv.innerText = 'END OF TURN'
    }

    load()

    if (g.players[g.currTurn].cards.length === 0) {
        currPlayerDiv.innerText = `PLAYER ${g.players[i].id} WON`
        nextbtn.disabled = true;
    }
}

function load() {
    currPlayerDiv.innerText = `curr player: ${g.players[g.currTurn].id.toString()}`;
    discardPileTopCard.innerText = g.discardPile[g.discardPile.length-1].toString();
    drawPileTopCard.innerText = g.drawPile[g.drawPile.length-1].toString();

    fillPlayerCardDiv(player1cards, p1.cards);
    fillPlayerCardDiv(player2cards, p2.cards);
    fillPlayerCardDiv(player3cards, p3.cards);
}

function fillPlayerCardDiv(div, cards){
    div.innerHTML = `<p>===PLAYER CARDS===</p>`
    for (let i = 0; i < cards.length; i++) div.innerHTML += ` <p> ${cards[i].toString()} </p> `
}