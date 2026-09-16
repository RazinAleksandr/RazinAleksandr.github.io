---
title: "Upscale the latent, decode once"
description: "Why LUA moves super-resolution before the VAE decode instead of after it, and what that buys at 4K."
date: 2026-09-20
draft: true
tags: ["diffusion", "super-resolution"]
---

<!--
  This file is a starting point, not a published post.

  Files beginning with an underscore are ignored by the content loader, so
  nothing here is built. To publish:

    1. copy it to a real name, e.g. src/content/blog/latent-upscaling.md
    2. set `draft: false` and a real `date`
    3. write

  While `draft: true`, a post shows in `npm run dev` but never in production,
  so you can work on it on a branch without hiding it from yourself.

  Reading time is computed from the body — you don't set it.
-->

Generating high-resolution images with latent diffusion is expensive in a
specific, annoying way: the cost lands twice.

## The two places resolution costs you

First, denoising at high resolution is quadratic-ish in the worst places.
Second, if you dodge that by generating small and upscaling afterwards, the
super-resolution runs *after* the VAE decode — in pixel space, on an image that
has already committed to its mistakes.

## What changes when you upscale the latent

...

## What it costs

| Setting | Direct | With LUA |
| --- | --- | --- |
| 2048² | 103.6 s | 37.0 s |
| 4096² | — | 40.5 s |

Measured on a single RTX 6000 Ada, FLUX.1, 28 steps.

## What I'd do differently

...
