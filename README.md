# (unfinished) uno engine

### Card Colours:
Red, Green, Blue, Yellow

### Total Cards:
- Numbers : two copies of each 1 to 9 for each colour, one 0 for each colour
- Skip : two for each colour
- Reverse: two for each colour
- Draw2 : two uncoloured
- Draw4 : two uncoloured

### Initialization:
- Shuffle the deck.
- Deal 7 cards to each player.
- Place the remaining cards face down → Draw pile.
- Flip the top card face up → starts the Discard pile.

### Valid Moves:
| card to discard | top card on discard pile | valid condition      |
|-----------------|--------------------------|----------------------|
| number          | number                   | same value or colour |
| number          | skip                     | same colour          |
| skip            | number                   | same colour          |
| skip            | skip                     | always               |
| skip            | reverse                  | same colour          |
| reverse         | number                   | same colour          |
| reverse         | skip                     | same colour          |
| reverse         | reverse                  | always               |
| anything        | draw                     | always               |
| draw            | anything                 | always               |

### Card Piles:
- Discard Pile : You play cards onto the discard pile (face up).
- Draw Pile : You draw from the draw pile (face down). When the draw pile runs out, shuffle the discard pile (except the top card). That becomes the new draw pile.