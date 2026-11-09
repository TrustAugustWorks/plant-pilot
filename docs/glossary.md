# Glossary

Aligned with the home ERP glossary so the pilot can be merged into it later.

| Term | Meaning |
|---|---|
| **Floor plan** | The image of the apartment, uploaded by the user, used as the map background. |
| **Map** | The floor plan with plant icons placed on it. |
| **Position** | Where a plant sits on the map, stored as relative coordinates `x`, `y` between 0 and 1 (fraction of image width/height), so positions survive resizing and screen sizes. |
| **Plant type** | An entry in the built-in library (e.g. Monstera) with a base watering interval, light preference, water fraction and winter rest flag. |
| **Plant** | One actual plant I own: a plant type, a name, a position, a spot light level, a pot size. |
| **Light preference** | What light a plant type likes: `sun`, `bright` (bright, indirect), or `shade`. |
| **Spot light** | How much light the plant's position actually gets: `sun`, `bright`, or `shade`. Set by the user per plant. |
| **Base interval** | Days between waterings for a plant type in `bright` light. |
| **Season** | spring (Mar-May), summer (Jun-Aug), autumn (Sep-Nov), winter (Dec-Feb). Northern hemisphere, from the local date. |
| **Winter rest** | A plant type property: the plant (e.g. cactus) is nearly dormant in winter and gets a much longer winter interval. |
| **Effective interval** | The plant's interval after adjusting the base interval for its spot light and the current season. |
| **Pot size** | The pot's top diameter in cm, entered per plant. |
| **Pot volume** | Estimated soil volume in litres: diameter³ / 2000. |
| **Water fraction** | Plant type property: share of the pot volume to give per watering (e.g. 0.1 cactus, 0.3 basil). |
| **Water amount** | How much to give per watering, in ml, rounded to 50 ml. |
| **Watering event** | A record that a plant was watered at a point in time. |
| **Last watered** | The time of the plant's most recent watering event. |
| **Next due** | Last watered + effective interval (calendar days). |
| **Days left** | Whole days from today until next due. Negative means overdue. |
| **Status** | `ok` (green), `soon` (yellow) or `due` (red), derived from days left. |
| **Overdue** | Days left < 0. |
| **Edit mode** | A toggled mode in which plants can be added, moved, edited and removed. Outside edit mode, tapping a plant waters it. |
| **Watering mode** | The default mode (edit mode off). |
| **Export file** | A JSON file containing all data, including the floor plan image. |
