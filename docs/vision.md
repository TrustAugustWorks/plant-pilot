# Vision and scope

## Problem
I sometimes forget to water my plants. Different plants need water at different intervals, and plants in sunny spots dry out faster than plants in shade, so a single "water everything on Sunday" routine doesn't work.

## Goal
A website that shows my apartment as a map with an icon for each plant, and tells me at a glance which plants need water now and when the others are due.

## Users
- **Me**: sets up the map and plants, waters plants.
- **Others in the apartment**: can water plants. In the pilot everyone uses the same device (data is stored in that device's browser).

## In scope (pilot)
- Upload my floor plan image as the map background.
- Add, move and remove plants on the map, in an "Edit map" mode.
- Built-in plant type library with watering intervals and light preferences.
- Interval adjusted for the light at the plant's spot (sun / bright / shade) and for the season.
- How much water to give each plant, based on pot size, plant type, light and season.
- Countdown to next watering per plant, as a sorted list next to the map.
- Map icons coloured green / yellow / red by urgency.
- Tap a plant on the map to water it instantly, with undo.
- Hover a plant to see information about it (type, light needs, interval, last/next watering).
- Indoor and balcony plants; balcony plants are moved inside in winter.
- Export and import all data as a file.

## Out of scope (pilot), planned later
- Notifications (wanted later).
- Moisture sensors.
- Sharing data between devices (comes with a Raspberry Pi server).
- Fertilising, repotting, plant photos.

## Success criteria
- **SC-001**: Over one month, no plant is more than 2 days overdue without me having been shown it in red.
- **SC-002**: Watering a plant takes one tap.
- **SC-003**: Setting up the map and all my plants takes under 15 minutes.
- **SC-004**: No data is lost over the pilot period.
- **SC-005**: I never have to guess how much water to give a plant.

## The apartment
Floor plan provided by me (not committed, see Constitution I). Rooms: Altan (balcony), Køkken/Alrum (kitchen/living room), Entré, Depot, Bad, Værelse x2, Soveværelse. North points to the right of the plan: the kitchen/living room and balcony face south (sunny), the rooms on the right face north (shadier). Markings drawn on the image can be ignored.
