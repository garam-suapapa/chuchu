# Soraping pajamas — built-in imagegen

## Worn initial prompt

Use case: identity-preserve.
Asset type: transparent full-body character wornSprite for children's dress-up game.
Input image 1: Soraping base, identity reference. Input image 2: current dressed Soraping, primary edit target and render-style/pose reference.
Create one image of the SAME Soraping wearing cozy pajamas. Change only her clothes from image 2 to a pastel lavender long-sleeve button-front pajama set with softly scalloped pale-aqua collar and cuffs, tiny pearl-white crescent and shell motifs, matching full-length pajama trousers and simple soft slippers. No hat, no props. Keep her enormous pink swirled shell ponytail, turquoise hairband, right shell hair accessory, golden diamond forehead jewel, violet-magenta eyes, pale pink face, tiny smile, head/body proportions and shiny polished 3D toy illustration EXACTLY like image 2. Face front, stand upright, two hands clasped together at center torso just as image 2, exactly one connected pair of arms and hands. Preserve whole hair silhouette and both feet.
Genuinely transparent RGBA background, no scene, no floor shadow, no checkerboard drawn. Portrait composition matching 600x700 game frame, full character centered with comfortable transparent padding on all sides. No text, no watermark, no cropped hair or feet. Render a single complete dressed character only.

Source: Generated images are saved to C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5 as C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5\exec-8af311f0-8946-4936-b21b-3ab1b29ffe18.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.

## Background correction attempt

Use case: background-extraction. Edit target: supplied pajama Soraping. Remove ONLY the entire gray-white checkerboard background. Deliver actual RGBA PNG with alpha=0 outside the character; transparency must be encoded in alpha, never painted as a checkerboard or white. Preserve every character pixel, silhouette, face, shiny pink hair, clasped hands, full lavender pajamas and both slippers, proportions and framing unchanged. Single isolated complete sprite, no new objects or shadows.

Source: Generated images are saved to C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5 as C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5\exec-8c1927d2-ca3c-49cb-a723-73df2f418aaf.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.

Result: still RGB with baked checkerboard; original preferred for pose/identity. No paid API/CLI used.

## Clothing-only sprite prompt

Use case: precise-object-edit.
Asset type: single clothing-only wardrobe selection sprite for a children's dress-up game.
Input: worn Soraping pajamas image, design reference only.
Show ONLY the exact lavender pajama set from the reference, as an empty clothing product, front view. Include the button-front long sleeve top with pale aqua scalloped collar and cuffs, shell and crescent white motifs, pale aqua piping, shell pocket; matching full-length trousers with pale aqua scalloped ankle trim; matching lavender soft slippers with pearl buttons arranged immediately below trouser ends. Preserve exact colors, pattern style and glossy-soft children's 3D illustration treatment from the reference.
Remove the character completely: NO head, hair, face, neck, arms, wrists, hands, skin, torso, legs, feet, mannequin, hanger or props. Sleeves hang gently down and out to show empty cuffs. Clothes only, empty neck opening and cuffs. One organized outfit only, all garments fully visible, moderate padding.
Genuinely transparent background encoded in PNG alpha. No painted checkerboard, no scene, no backdrop, no floor shadow, no text or watermark. Square sprite composition.

Source: Generated images are saved to C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5 as C:\Users\admin\.codex\generated_images\01a07a94-0f25-7b03-bc6e-f5e7de9868d5\exec-aba42fbd-7a47-4eed-8d3b-856377ab2774.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.

## Visual review

Original worn: recognizable pink shell ponytail, turquoise hairband and right shell ornament, gold forehead diamond, violet eyes, clasped hands, entire body and slippers visible with margins. Clothing-only sprite: no hands/body/mannequin, matching colors, piping, collar, motifs and slippers. Small pattern placement differs due to independent generation. Both returned opaque RGB with baked checkerboard. Actual alpha and 600x700 runtime resizing pending user authorization for local postprocessing. Original files copied unchanged.
