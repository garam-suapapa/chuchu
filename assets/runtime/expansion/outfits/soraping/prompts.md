# Soraping expansion outfits — generation and QA

## Current processed status

The user subsequently authorized local background removal and resizing. All eight processed PNGs now have real RGBA alpha; worn files are 600x700 and selection files 600x600. Catalog paths point to processed/ and runtimeReady=true with status processed-review. Original RGB files and historical failure records remain unchanged. See [processed/QA.md](processed/QA.md) for method, verification and remaining generative limitations.

## Generation phase status (historical)

Four designs and eight PNG source images were generated through separate built-in image_gen calls. All eight have been saved inside this directory. They are **not runtime-ready**: every selected output is opaque RGB (PNG color type 2), with a painted checkerboard. Built-in background-extraction correction was attempted for every worn design and did not deliver alpha. Actual alpha and a 600×700 worn frame remain outstanding.

The parent task expressly instructed us to preserve originals and hold all local pixel editing/resizing while it awaits the user's answer permitting local background removal. No paid API/CLI, local background removal or local image resizing was used. Existing manifest and application code were not modified.

## Workflow and actual prompts

Base and current reference-wearables worn PNGs were viewed before generation. Each worn result was generated from those references; each clothing-only selection was generated in a separate built-in call using its corresponding worn result. Full prompts, selected source paths and failures are recorded here:

- [Pajamas, 07](prompts-07.md)
- [Raincoat, 08](prompts-08.md)
- [Swimwear, 09](prompts-09.md)
- [Winter, 10](prompts-10.md)

## Visual QA

All eight saved outputs were inspected. Entire ponytail, hair accessory and feet are visible in worn images; complete garments and sleeve ends are visible in selection images. No visible canvas cropping. All four characters retain the identifiable pink shell hairstyle, violet eyes, golden forehead diamond, frontal standing posture and one pair of hands touching together. Clothing-only images contain no hands, skin or wearer. Colors and principal garment details match their worn references.

Generative variations remain: head/body dimensions and the exact height/angle of clasped hands vary slightly between categories; these are visual identity matches, not pixel-exact replacements. Motif placement and visible button counts may vary where the worn character's hands occlude clothing. No alpha-boundary check can pass until the opaque backgrounds are removed.

## File QA

[inspection.json](inspection.json) records actual dimensions, PNG color types, transparency-chunk presence, file sizes and SHA256 hashes for all eight PNGs. Reproduce this read-only pixel inspection with:

```powershell
node assets/runtime/expansion/outfits/soraping/inspect-assets.mjs
```

[catalog.json](catalog.json) is an array of the four requested ids (07–10), category keys and repository-relative asset paths. width/height describe the actual selection files; wornWidth/wornHeight record actual source dimensions. runtimeReady=false and productionTemplate.status explicitly mark the remaining alpha/framing work. Do not integrate these opaque sources as final transparent runtime assets.
