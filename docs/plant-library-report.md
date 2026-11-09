# Plant library report

Run date: 2026-11-09. Library file: `src/data/plant-library.json`. It now has 25 entries (20 existing and 5 new), sorted by `name`. No `id` was removed or renamed.

## Your plants

| Your plant | Library entry | Notes |
|---|---|---|
| Monstera, living room (south-facing, sunny) | `monstera` | Checked against 4 sources, and the values hold. The app uses the "sun" spot to shorten the interval: about 5 days in spring and 6 in autumn, with more water. The Plant info will warn that the spot is sunnier than the type prefers. The RHS and Bolius both say strong direct sun can scorch Monstera leaves, so it should stand a little back from the window or behind a sheer curtain. |
| "A palm tree" (species unknown) | **Not identified, please choose** | I added five common indoor "palms" so you can pick yours. See the next section. |

### Which palm is it?

| Library entry | Danish name | How to recognise it |
|---|---|---|
| `areca-palm` (*Dypsis lutescens*) | Guldpalme | Several thin stems from the pot, yellow-green leaf stalks, and feathery fronds. |
| `kentia-palm` (*Howea forsteriana*) | Kentiapalme | Dark green, broad, drooping fronds on long bare stalks. It usually has few stems and grows slowly. |
| `parlour-palm` (*Chamaedorea elegans*) | Bjergpalme | A small palm, often under 1 m, with fine feathery fronds. Common on windowsills and tables. |
| `ponytail-palm` (*Beaucarnea recurvata*) | Elefantfod | A swollen, bulb-like base with a fountain of long, thin, grass-like leaves. Not a true palm. |
| `yucca` (*Yucca gigantea / elephantipes*) | Palmelilje / Yuccapalme | One or more thick, woody "logs" topped with stiff, sword-shaped leaves. Not a true palm. |

**Question for you:** which of these looks like your palm? A photo or a short description is enough. The pot size is also still missing for both plants. The app defaults to 14 cm.

## Entries added (5)

| id | name / nameDa | base days | light | fraction | winterRest | outdoorOk |
|---|---|---|---|---|---|---|
| areca-palm | Areca palm / Guldpalme | 7 | bright | 0.25 | false | false |
| kentia-palm | Kentia palm / Kentiapalme | 10 | bright | 0.20 | false | false |
| parlour-palm | Parlour palm / Bjergpalme | 7 | bright | 0.22 | false | false |
| ponytail-palm | Ponytail palm / Elefantfod | 14 | sun | 0.12 | true | true |
| yucca | Yucca / Palmelilje / Yuccapalme | 10 | sun | 0.18 | true | true |

All five palm entries use the `tree` icon.

Danish names were checked against Danish sources:
- The brief suggested "Goldpalme" or "Arecapalme" for the areca palm. Danish sources (Plantorama) call it **Guldpalme**. "Goldpalme" is closer to the German name (Goldfruchtpalme), so I used Guldpalme.
- Kentiapalme, Bjergpalme and Elefantfod are confirmed by lex.dk (Danmarks nationalleksikon) and Plantorama.
- Lex.dk confirms "Palmelilje" as the Danish name for the genus *Yucca*. "Yuccapalme" is the everyday retail name, so both are listed.

## Entries changed

| id | field | old -> new | reason |
|---|---|---|---|
| all 20 existing | sources | `[]` -> 2-4 URLs | Required by the contract. Sources are the RHS, university extension services (NC State, Clemson, Minnesota, Wisconsin, UF/IFAS), Missouri Botanical Garden, and Danish sources (lex.dk, Bolius, Plantorama care guides) for Danish names and local practice. |
| calathea | lightPreference | shade -> bright | The RHS and NC State both say bright light out of direct sun. Shade is tolerated, but it is not the preference. |
| peace-lily | lightPreference | shade -> bright | The RHS, Clemson and UF/IFAS say bright indirect light is best. It tolerates shade but rarely flowers there. |
| lavender | winterRest | false -> true | The RHS says to keep pots fairly dry in winter, which is a sharp cut in watering. |
| pelargonium | baseIntervalDays | 3 -> 5 | The RHS says to water moderately and let the compost dry between waterings. Minnesota says to water when the top 2.5-5 cm are dry. The old value of 3, combined with the sun factor, gave a 2-day spring interval for a 14 cm pot, which is too frequent. It is now 4 days in spring and 8 in winter. |
| pothos | nameDa | Gyldenranke -> Guldranke | Guldranke is the name used by Danish sources (Plantorama, Bolius). |
| monstera, aloe-vera, basil, cactus, calathea, fiddle-leaf-fig, lavender, mint, peace-lily, pothos, rosemary, rubber-plant, snake-plant, spider-plant, strawberry | careNote | small rewrites | Added practical points from the sources, such as how much soil should dry, scorch risk, and not watering into the rosette. All notes are 120 characters or less. |

No other values changed. The sources agreed with the starter values closely enough.

## 14 cm pot sanity check

A 14 cm pot holds 14^3 / 2000 = 1.372 L. The check uses the plant's own light preference as the spot light, with the factors from architecture section 5. Each cell shows interval / amount.

| id | spring | summer | autumn | winter |
|---|---|---|---|---|
| aloe-vera | 10d/200ml | 9d/200ml | 12d/150ml | 21d/150ml |
| areca-palm | 7d/350ml | 6d/400ml | 8d/300ml | 10d/250ml |
| basil | 2d/450ml | 1d/500ml | 2d/400ml | 2d/350ml |
| cactus | 16d/150ml | 13d/150ml | 18d/150ml | 32d/100ml |
| calathea | 4d/400ml | 3d/450ml | 5d/350ml | 6d/300ml |
| fiddle-leaf-fig | 7d/300ml | 6d/350ml | 8d/250ml | 10d/250ml |
| pelargonium | 4d/400ml | 3d/450ml | 4d/350ml | 8d/300ml |
| kentia-palm | 10d/250ml | 8d/300ml | 12d/250ml | 14d/200ml |
| lavender | 5d/300ml | 4d/350ml | 6d/250ml | 10d/250ml |
| mint | 2d/400ml | 2d/450ml | 2d/350ml | 3d/300ml |
| monstera | 7d/350ml | 6d/400ml | 8d/300ml | 10d/250ml |
| orchid | 7d/250ml | 6d/300ml | 8d/250ml | 10d/200ml |
| parlour-palm | 7d/300ml | 6d/350ml | 8d/250ml | 10d/250ml |
| peace-lily | 5d/400ml | 4d/450ml | 6d/350ml | 7d/300ml |
| ponytail-palm | 10d/200ml | 9d/200ml | 12d/150ml | 21d/150ml |
| pothos | 7d/350ml | 6d/400ml | 8d/300ml | 10d/250ml |
| rosemary | 4d/300ml | 3d/350ml | 4d/250ml | 5d/250ml |
| rubber-plant | 10d/250ml | 8d/300ml | 12d/250ml | 14d/200ml |
| snake-plant | 14d/200ml | 12d/250ml | 16d/200ml | 28d/150ml |
| spider-plant | 7d/350ml | 6d/400ml | 8d/300ml | 10d/250ml |
| strawberry | 2d/450ml | 1d/500ml | 2d/400ml | 2d/350ml |
| succulent | 10d/200ml | 9d/200ml | 12d/150ml | 21d/150ml |
| tomato | 1d/550ml | 1d/600ml | 1d/500ml | 1d/400ml |
| yucca | 8d/250ml | 6d/300ml | 9d/250ml | 15d/200ml |
| zz-plant | 18d/200ml | 15d/200ml | 21d/150ml | 36d/150ml |

No value is under 1 day or over 1 L. These results look questionable:
- **Tomato, strawberry and basil in winter** still show watering every 1-2 days. These plants are usually not grown in winter (tomato and basil are annuals, and strawberry is dormant outdoors). The model has no "annual / not in season" concept, so this is a modelling limit rather than a data error. It is worth flagging for the app.
- **Rosemary in winter (5 days)** may be too often for an indoor rosemary in a cool room. The sources disagree: the RHS says it is drought tolerant, while a Missouri Botanical Garden factsheet says not to let it dry out. I left `winterRest` false.
- **Basil and strawberry, 450-500 ml every 1-2 days**, is about a third of the pot volume. That is plausible for a sunny balcony in summer but generous in spring. I left these unchanged because the sources only say "keep moist".

## Uncertain

- **Exact intervals.** None of the sources give day counts. They describe soil-dryness cues ("top 2-5 cm dry"), so `baseIntervalDays` is my estimate from those cues for a normal pot in spring. Only the snake plant (Clemson: every 2-4 weeks), orchid (Clemson: weekly), cactus (Missouri Botanical Garden: every 2-3 weeks) and monstera (Minnesota, Bolius: about weekly) have explicit frequencies.
- **Kentia palm (10 days) and yucca (10 days)** are judgement calls between "keep evenly moist" (kentia) and "drought tolerant" (yucca).
- **Ponytail palm and yucca light.** Sources disagree. Wisconsin says full sun, while some say bright and not direct. I chose `sun` for both, matching the RHS (yucca: sunny position, shade from harsh summer sun) and Wisconsin (ponytail).
- **ZZ plant** stays `shade` because the RHS lists it among houseplants for shade, though Clemson says bright indirect light speeds growth.
- **Danish sources.** Plantorama is a retailer. I used its care guides only for Danish names and as a third source, never as one of the two required reputable sources.
- **The Calathea sources** cover the genus in general. NC State lists most species under *Goeppertia*.

## Validation

- The contract checks are in `tests/unit/plant-library.test.ts` (Vitest), with test names like `spec001_FR010_*`. The tests have not been run because Node.js is not installed.
- The same rules were checked with a Python script run as `python -I`: 25 entries and 0 errors. The script also produced the pot table above.
