# VAR4 — Starter scroll animations

Next.js (App Router) + **Lenis** (scroll fluide) + **GSAP ScrollTrigger** (pin, scrub, reveals).

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

> Si `npm install` échoue à cause du cache npm global :  
> `sudo chown -R $(whoami) ~/.npm`  
> ou utilise un cache local :  
> `NPM_CONFIG_CACHE="$(pwd)/.npm-cache" npm install`

## Structure

| Fichier | Rôle |
|---------|------|
| `src/components/providers/SmoothScrollProvider.tsx` | Lenis + proxy ScrollTrigger |
| `src/components/sections/HeroSection.tsx` | Hero + parallax léger au scroll |
| `src/components/sections/PinnedStorySection.tsx` | Section **épinglée** + scroll horizontal |
| `src/components/sections/RevealSection.tsx` | Cartes **reveal** avec `ScrollTrigger.batch` |
| `src/hooks/usePrefersReducedMotion.ts` | Désactive Lenis si reduced motion |

## Personnalisation rapide

1. **Contenu** — Modifie les tableaux `STEPS` / `ITEMS` dans les sections.
2. **Pin vertical** — Remplace le `x` horizontal par une timeline sur `y` ou `opacity` dans `PinnedStorySection`.
3. **Marqueurs debug** — Ajoute `markers: true` dans un `scrollTrigger` (à retirer en prod).
4. **ScrollSmoother** — Plugin GSAP payant ; Lenis couvre déjà le smooth scroll gratuitement.

## Stack

- [Lenis](https://github.com/darkroomengineering/lenis)
- [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [@gsap/react](https://gsap.com/resources/React) (`useGSAP`)
