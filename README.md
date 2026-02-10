# Evidenceiq clone project

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/fusionaiuk-gmailcoms-projects/v0-evidenceiq-clone-project)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/kRCxobC3gHA)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/fusionaiuk-gmailcoms-projects/v0-evidenceiq-clone-project](https://vercel.com/fusionaiuk-gmailcoms-projects/v0-evidenceiq-clone-project)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/kRCxobC3gHA](https://v0.dev/chat/projects/kRCxobC3gHA)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## BigQuery configuration

This app reads from BigQuery using Application Default Credentials / service account JSON provided via env vars (see `lib/bigquery.ts`).

- **BQ_MAIN_TABLE**: `fusion-424109.evidenceiq_alunbrig.vw_text_filtered_core_only` (view/table id used in all `FROM \`...\`` clauses)