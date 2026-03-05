
# UNO-ENGINE-JS
A headless, zero-dependency uno game logic engine written in TypeScript.

### Key features:
- [ ] Multiplayer Ready: Designed with a serializable state, making it easy to sync across WebSockets for real-time play.
- [x] Fully Type-Safe: Built with TypeScript for excellent IDE auto-completion
- [x] Well Documented: Clean API with JSDoc comments and comprehensive guide
- [x] Headless & Lightweight: No UI attached
- [x] Real uno rules: Engine follows all the major undisputed uno game rules

## Install  & Import
**Install with npm**
```bash
npm i uno-engine-js
```   
**TypeScript / ESM**
```typescript
// Import Game class 
import Game from 'uno-engine-js'

// Import types for TypeScript 
import type { IPlayer, ICard } from 'js-chess-engine'    

const game = new Game(["osaka", {name: "chiyo", isBot: true}, "tomo"])   
```   
## Example Usage:
A multiplayer Uno Game I'm working on:
- (unfinished) https://github.com/cdhananjay/uno

Watch bots play:
```typescript
const game = new Game([{name: "minamo", isBot: true}, {name:"yukari", isBot : true}]);

while (!game.isOver) {
    game.playTurn();
    console.log(game.toString())
}
```

## Documentation:
### Game loop
```typescript
while(!game.isOver) {  
// make player choose a card from game.PlayableCards()  
	try { 
	 game.playTurn(card);
	 // no need to do anything else 
	 // Game class handles everything 
	 } catch (err) {
		 console.log(err) // turn was not played 
	 }
}  
```  
Note: Above loop is to provide only an overall idea about how the game loop can be implemented. For detailed info, keep reading below.

**constructor**  
`new Game(players)` - Create a new game with given players.    
Params:
- `players` : ` (string | {name: string, isBot: boolean})[]` (_mandatory_) - array consisting of either player names as string or object with `name` and `isBot` properties. When array element is string, the `isBot` property is set to `false` for the given player.  
    
Throws: error if array size is less than 2 or more than 10

**toString**  
`game.toString()` - prints the game stats, including both the piles and all players with their hand, useful for debugging
Note: toString method is also available for each Player & Card

**isOver**  
`game.isOver`  
Note: if this returns true, `playTurn` & `nextPlayerIndex` methods will ALWAYS throw error  
Returns: true if there is only one player with a non-empty hand, else false

**players**  
`game.players`  
Returns: an array consisting of all the players in the game

**drawPile**  
`game.drawPile`  
Returns: an array consisting of cards in draw pile

**discardPile**  
`game.discardPile`  
Returns: an array consisting of cards in discard pile

**currPlayerIndex**  
`game.currPlayerIndex`  
Returns: current player's index in players array

**currPlayer**  
`game.currPlayer`  
Returns: returns current player object, equivalent of `game.players[game.currPlayer]`

**nextPlayerIndex**  
`game.nextPlayerIndex`  
Returns: index of player in the player's array whose turn is next.  
Throws: error if `game.isOver` is true

**isReversed**  
`game.isReversed`  
Returns: false if current player index moves from start to end of the player's array, true otherwise

**playableCards**  
`game.playableCards`  
Returns: current player's playable cards  
*Playable Cards*:  
A card is playable if it follows any of the given conditions:  
1. is Draw4 / Wild card
2. discard pile top card is NOT Draw4 or Wild && card matches the discard pile top card by Colour, Number, Type (applicable only to Skip, Reverse, Draw2)
3. discard pile top card is Draw4 or Wild && card matches the *wild colour*

*Wild colour:* when player play's a wild / draw4 card, player can choose a colour to set as wild colour

**playTurn**
- if no playable cards : current player draws a card
- else if current player is a bot: choose random card and random colour (if required) and play it
- else if only 1 playable card available which is NOT of type wild or draw4 : that card is played regardless of params given, return
- else the given card and wildColour (if needed) are played  
**Imp Note: card actions are performed internally, current player index gets updated internally, players with empty hand are skipped**  

`game.playTurn(card, wildColour)`  
Params:
- `card` : `ICard` ( *optional* ) - card to play out of the `game.playableCards`, ignored if current player is a bot OR 0 / 1 playable cards
- `wildColour` : `Colours` ( *optional* ) - colour to set as the wildColour, ignored if card is not of type Wild / Draw4 OR player is a bot  

Throws: error if required parameters are not provided by players with `isBot = false`; or if `game.isOver` is true

### TypeScript Support
```typescript  
import Game from 'uno-engine-js';
import {
  Colours, 
  CardTypes, 
 } from 'uno-engine-js';
import type {  
// Interfaces  
  IPlayer, 
  ICard
} from 'uno-engine-js';  
```  

## Implemented Uno Rules:
**Anything apart from the below given information has not been implemented in the game engine**, even if it is part of some version of Uno.

### Card Colours:
Red, Yellow, Green, Blue

### Total Cards: 108
- Numbers : two copies of each 1 to 9 per colour, one 0 per colour = 19 × 4 colours = 76 Number cards
- Skip : two per colour = 2 × 4 colours = 8 Skip cards
- Reverse: two per colour = 2 × 4 colours = 8 Reverse cards
- Draw2 : two per colour = 2 × 4 colours = 8 Draw2 cards
- Draw4 : 4 uncoloured = 4 Draw4 cards
- Wild : 4 uncoloured = 4 Wild cards

### Game Initialization:
- Game can be started with 2 to 10 players.
- Each player gets 7 cards.
- Discard Pile starts with a single card.
- Remaining cards are the discard pile.
- When the draw pile runs out, all cards from discard pile except the top card are added to draw pile.
- Play proceeds clockwise.

### During a turn:
- **play  Draw4 / Wild card**
- **else if discard pile top card is NOT Draw4 or Wild:**    
  player can discard a card which matches the top discard pile card by Colour, Number, Type (applicable only to Skip, Reverse, Draw2)
- **else if discard pile top card is Draw4 or Wild:**    
  player can discard a card whose colour matches wild colour
- **else if player cannot play by one of the above method**    
  player draws 1 card from draw pile.

### Card Actions
- Skip: Next player loses their turn.
- Reverse: Direction of play flips.
- Draw2: Next player draws 2 cards.
- Draw4: Acts as Wild card, then next player draws 4 cards.
- Wild: Current player makes a colour choice, the chosen colour is now the wild colour.

### Ending the game:
- Game ends if there is only one player with a non-empty hand.

## Contributing
Feel free to contribute but please ensure your code passes all tests before submitting a pull request:
```bash
npm run test       # Run test suite
``` 

## Documentation for Contributors
This part of documentation covers private methods which are not exposed to general end users.

### Private Game Methods

**fill**
`this.fill(pile)` - fills the given pile with the 108 uno cards  
Params:
- `pile` : `Card[]` (_mandatory_) - array which would be filled with cards

**shuffle**  
`this.shuffle(pile)` - shuffles the provided array with Fisher–Yates Shuffle (Knuth Shuffle) algorithm  
Params:
- `pile` : `Card[]` (_mandatory_) - array of cards which will be shuffled

**distribute**  
`this.distribute()` - moves 7 cards from the draw pile to each player's hand, then moves 1 card from draw pile to discard pile

**drawCard**  
`this.drawCard(player)` - moves the last card in drawPile array to player's hand  
Note: top card of draw pile is actually the end of the draw pile array, i.e. the last element in draw pile. See it as a stack.  
Note: When the draw pile runs out, all cards from discard pile except the top card are added to draw pile. So there is always a card available to draw provided the discard pile is not empty.  
Params:
- `player` : `Player` (_mandatory_) - player whose hand, the drawPile array's last card would be moved

Throws: error if both discard pile and draw pile and empty.

**discardCard**  
`this.discardCard(player, card)` - moves the card from the current player's hand onto the top of discard pile.  
Note: top card of discard pile is actually the end of the discard pile array, i.e. the last element in discard pile. See it as a stack.  
Params:
- `player` : `Player` (_mandatory_) - player from whose hand the provided card would be moved to discard pile
- `card` : `Card` (_mandatory_) - the card to move from current player's hand and added to discard pile  
Throws: error if provided card was not found with given player

**isPlayable**  
`game.isPlayable(card)`  
Params:
- `card` : `Card` (_mandatory_)

Returns: true if provided card is playable, else false
Note: view documentation for the public method `playableCards` for a playable card's definition

**performAction**  
`this.performAction(card, wildColour)` - Performs the following action based upon the parameters provided
- Skip: Next player loses their turn.
- Reverse: Direction of play flips.
- Draw2: Next player draws 2 cards.
- Draw4: Acts as Wild card, then next player draws 4 cards.
- Wild: Current player makes a colour choice, the chosen colour is now the wild colour.

Params:
- `card` : `Card` (_mandatory_) - the card based upon whose type the action is performed
- `wildColour` : `Colour` (_optional_) - ignored if card type is not draw4 or wild, `this.wildColour` is set to provided wildColour
