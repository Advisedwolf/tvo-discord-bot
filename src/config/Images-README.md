# Image Handling

This document describes how TVO Helper Bot manages and serves thumbnail icons (and other images) in a centralized, scalable way.

## 1. Public Hosting

All image assets (icons, thumbnails, etc.) are hosted on a public CDN—in our case, Imgur.

- We upload each icon (info, error, stats, minimal, profile) to Imgur
- We reference the **direct-link** URLs in our code

## 2. Asset Manifest

All image URLs live in a single manifest file:

```js
// src/config/assets.js

export const icons = {
  info:    'https://i.imgur.com/YOUR_INFO_ICON.png',
  error:   'https://i.imgur.com/YOUR_ERROR_ICON.png',
  stats:   'https://i.imgur.com/YOUR_STATS_ICON.png',
  minimal: 'https://i.imgur.com/YOUR_MINIMAL_ICON.png',
  profile: 'https://i.imgur.com/YOUR_PROFILE_ICON.png',
};
🎯 Why?

One source of truth: update URLs here to affect all embed templates

Clear semantics: icons.info, icons.error, etc. read like plain English

Easy to extend: add new keys (e.g. warning, success) as you create more templates

3. Embed Templates
Each embed template imports the manifest and uses the appropriate thumbnail:

js
Copy
Edit
// example: src/services/functions/embeds/info.js
import { EmbedBuilder } from 'discord.js';
import { icons }        from '../../config/assets.js';

export default function infoTemplate(options = {}) {
  const { title, description, fields = [], id } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x3498db)
    .setThumbnail(icons.info)
    .setTimestamp()
    .addFields(fields)
    // hidden zero-width tracking ID field
    .addFields({ name: '\u200B', value: id, inline: false });

  return embed;
}
Repeat similarly in error.js, stats.js, minimal.js, profile.js, using icons.error, icons.stats, etc.

4. (Optional) Dynamic Uploads
If you ever need to upload images at runtime (e.g. user‐generated avatars, charts), you can use an Imgur‐upload helper:

js
Copy
Edit
// src/services/functions/imageService.js
import fetch from 'node-fetch';
import { IMGUR_CLIENT_ID } from '../../config/index.js';

export async function uploadToImgur(imageData) {
  const payload = typeof imageData === 'string'
    ? { image: imageData, type: 'base64' }
    : { image: imageData.toString('base64'), type: 'base64' };

  const res = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
    body: JSON.stringify(payload),
  });

  const { data, success } = await res.json();
  if (!success) throw new Error(`Imgur upload failed: ${data?.error}`);
  return data.link;
}
Store your IMGUR_CLIENT_ID in .env:

dotenv
Copy
Edit
IMGUR_CLIENT_ID=your_client_id_here
Then invoke in any service:

js
Copy
Edit
import { uploadToImgur } from '../services/functions/imageService.js';

const chartUrl = await uploadToImgur(myChartBuffer);
// use chartUrl in an embed’s `.setImage(chartUrl)`
```
