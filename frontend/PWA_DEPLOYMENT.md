# 📱 PWA Configuration & Deployment Guide

## ✅ Configuration Actuelle

Votre application est maintenant configurée comme **Progressive Web App (PWA)** et peut être installée sur Android et iOS.

## 🔧 Comment ça fonctionne avec les URLs de déploiement

### ✨ **Aucune modification nécessaire !**

Le manifeste utilise des **URLs relatives**, ce qui signifie qu'il fonctionnera automatiquement avec **n'importe quelle URL de déploiement** :

- ✅ `http://localhost:3001` (développement local)
- ✅ `https://votre-domaine.com` (production)
- ✅ `https://squadlink.vercel.app` (Vercel)
- ✅ `https://squadlink.netlify.app` (Netlify)
- ✅ Toute autre URL de déploiement

### Pourquoi ça fonctionne ?

Dans `manifest.json`, nous utilisons :
```json
{
  "start_url": "/",
  "scope": "/"
}
```

Ces chemins relatifs (`/`) sont automatiquement résolus par rapport à l'URL de base de votre application, peu importe où elle est déployée.

## 📱 Installation sur Mobile

### Android (Chrome/Edge)

1. Ouvrez votre application dans Chrome ou Edge
2. Le navigateur détectera automatiquement le manifeste
3. Une bannière "Ajouter à l'écran d'accueil" apparaîtra
4. Ou allez dans le menu (⋮) → "Ajouter à l'écran d'accueil"

### iOS (Safari)

1. Ouvrez votre application dans Safari
2. Appuyez sur le bouton de partage (□↑)
3. Sélectionnez "Sur l'écran d'accueil"
4. L'icône apparaîtra sur votre écran d'accueil

## 🔍 Vérification

### Tester localement

1. Démarrez votre application :
```bash
cd frontend
npm run dev
```

2. Ouvrez Chrome DevTools (F12)
3. Allez dans l'onglet "Application" → "Manifest"
4. Vérifiez que le manifeste est chargé correctement

### Tester sur mobile

1. Déployez votre application (Vercel, Netlify, etc.)
2. Ouvrez l'URL sur votre téléphone
3. Vérifiez que l'option d'installation apparaît

## 📋 Fichiers Configurés

### ✅ `public/manifest.json`
- Configuration complète du PWA
- Icônes et raccourcis définis
- Couleurs de thème configurées

### ✅ `app/layout.tsx`
- Métadonnées Next.js pour PWA
- Meta tags iOS spécifiques
- Référence au manifeste

### ✅ Icônes
- `/public/icon.png` (192x192, 512x512)
- `/public/apple-icon.png` (180x180 pour iOS)
- `/public/Logo-Photoroom.png` (fallback)

## 🚀 Déploiement

### Vercel

Aucune configuration supplémentaire nécessaire. Le manifeste sera automatiquement servi depuis `/public/manifest.json`.

### Netlify

Aucune configuration supplémentaire nécessaire.

### Autres plateformes

Assurez-vous que le dossier `public` est servi statiquement. Next.js le fait automatiquement.

## 🔐 HTTPS Requis

⚠️ **Important** : Les PWA nécessitent HTTPS en production (sauf localhost).

- ✅ Localhost fonctionne en HTTP
- ✅ Production doit être en HTTPS
- ✅ Vercel/Netlify fournissent HTTPS automatiquement

## 📱 Fonctionnalités PWA

### Actuellement activées :
- ✅ Installation sur écran d'accueil
- ✅ Mode standalone (sans barre d'adresse)
- ✅ Icônes personnalisées
- ✅ Thème coloré
- ✅ Raccourcis (Match History, Parties)

### À venir (optionnel) :
- Service Worker pour mode hors ligne
- Notifications push
- Mise en cache des ressources

## 🐛 Dépannage

### Le manifeste n'est pas détecté

1. Vérifiez que `public/manifest.json` existe
2. Vérifiez que l'URL est en HTTPS (production)
3. Ouvrez DevTools → Application → Manifest
4. Vérifiez les erreurs dans la console

### Les icônes ne s'affichent pas

1. Vérifiez que les fichiers existent dans `/public`
2. Vérifiez les chemins dans `manifest.json`
3. Vérifiez les permissions de fichiers

### L'option d'installation n'apparaît pas

1. Vérifiez que vous êtes en HTTPS (production)
2. Vérifiez que le manifeste est valide (DevTools)
3. Essayez de vider le cache du navigateur
4. Sur iOS, utilisez Safari (pas Chrome)

## 📚 Ressources

- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Next.js PWA Guide](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Note** : Cette configuration fonctionne avec **toutes les URLs de déploiement** sans modification. Les chemins relatifs s'adaptent automatiquement à votre domaine.

