// Canonical V3 navigation. Existing means route exists, not feature complete.
// requiresAuth describes intended policy, not implemented enforcement.
export const navigation = {
  "createExplorer": {
    "id": "createExplorer",
    "label": "Create Your Explorer",
    "href": "/explorer/create",
    "description": "Create a digital explorer",
    "status": "existing",
    "requiresAuth": false
  },
  "buildAdventure": {
    "id": "buildAdventure",
    "label": "Build Your Adventure",
    "href": "/adventure/create",
    "description": "Design a virtual journey",
    "status": "existing",
    "requiresAuth": false
  },
  "exploreTogether": {
    "id": "exploreTogether",
    "label": "Explore Together",
    "href": "/adventure/together",
    "description": "Create and plan with friends",
    "status": "planned",
    "requiresAuth": true
  },
  "bringToLife": {
    "id": "bringToLife",
    "label": "Bring It to Life",
    "href": "/ways-in",
    "description": "Plan a real outdoor adventure",
    "status": "existing",
    "requiresAuth": false
  },
  "shareStory": {
    "id": "shareStory",
    "label": "Share Your Story",
    "href": "/journal",
    "description": "Create photos, posts and travel stories",
    "status": "existing",
    "requiresAuth": false
  },
  "home": {
    "id": "home",
    "label": "Home",
    "href": "/",
    "description": "Return home",
    "status": "existing",
    "requiresAuth": false
  },
  "myAdventures": {
    "id": "myAdventures",
    "label": "My Adventures",
    "href": "/my-adventures",
    "description": "Manage personal adventures",
    "status": "planned",
    "requiresAuth": true
  },
  "gearLab": {
    "id": "gearLab",
    "label": "Gear Lab",
    "href": "/gear",
    "description": "Enter Gear Room",
    "status": "existing",
    "requiresAuth": false
  },
  "myStories": {
    "id": "myStories",
    "label": "My Stories",
    "href": "/my-stories",
    "description": "Manage personal stories",
    "status": "planned",
    "requiresAuth": true
  },
  "me": {
    "id": "me",
    "label": "Me",
    "href": "/me",
    "description": "Manage account and explorers",
    "status": "planned",
    "requiresAuth": true
  }
} as const;
